"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
	FiArrowRight,
	FiArrowUp,
	FiArrowDown,
	FiBookmark,
	FiCalendar,
	FiCheck,
	FiCheckCircle,
	FiChevronLeft,
	FiChevronRight,
	FiCompass,
	FiEye,
	FiFeather,
	FiFilm,
	FiGrid,
	FiHeart,
	FiLayers,
	FiLoader,
	FiMoon,
	FiRotateCcw,
	FiSearch,
	FiShield,
	FiSliders,
	FiSmile,
	FiSun,
	FiUsers,
	FiZap,
} from "react-icons/fi";
import { BiLoaderAlt, BiSolidBot } from "react-icons/bi";
import { AiFillStar } from "react-icons/ai";
import { GiSparkles } from "react-icons/gi";

import discoverMovies from "@/dataFetchings/discoverMovies";
import { getImageBaseLink } from "@/constants";
import { decorateLink } from "@/utils";
import { MOODS, moodName } from "@/lib/ai/moods";
import type { AiPick, SeedTitle } from "@/lib/ai/types";
import { isSaved, toggleSaved } from "@/lib/watchlist";
import ReasonCard from "@/components/ai/ReasonCard";

/* ── Static data ─────────────────────────────────────────────────────────── */

const MOOD_CARDS: Record<string, { icon: ReactNode; accent: string; blurb: string }> = {
	"action-adventure": { icon: <FiZap />, accent: "#f97316", blurb: "Sprints & stakes" },
	animation: { icon: <FiFilm />, accent: "#a78bfa", blurb: "Hand-drawn wonders" },
	comedy: { icon: <FiSmile />, accent: "#eab308", blurb: "Laugh-out-loud" },
	crime: { icon: <FiShield />, accent: "#94a3b8", blurb: "Heists & hardboiled" },
	documentary: { icon: <FiCompass />, accent: "#2dd4bf", blurb: "True stories" },
	drama: { icon: <FiFeather />, accent: "#fb7185", blurb: "Heavy emotions" },
	family: { icon: <FiUsers />, accent: "#34d399", blurb: "Gather the crew" },
	"fantasy-scifi": { icon: <FiMoon />, accent: "#818cf8", blurb: "Other worlds" },
	horror: { icon: <FiEye />, accent: "#f43f5e", blurb: "Lights on, please" },
	"mystery-thriller": { icon: <FiSearch />, accent: "#38bdf8", blurb: "Clues & twists" },
	romance: { icon: <FiHeart />, accent: "#f472b6", blurb: "Swoon factor" },
	western: { icon: <FiSun />, accent: "#d4a373", blurb: "Dust & duels" },
};

const YEARS = [
	{ label: "All Time", value: "" },
	{ label: "Post 2020", value: "2020" },
	{ label: "Post 2010", value: "2010" },
	{ label: "Post 2000", value: "2000" },
	{ label: "Post 1990", value: "1990" },
];

const SORT_OPTIONS = [
	{ label: "Popularity", value: "popularity.desc", icon: <FiArrowDown /> },
	{ label: "Highest Rated", value: "vote_average.desc", icon: <FiArrowUp /> },
	{
		label: "Newest First",
		value: "primary_release_date.desc",
		icon: <FiCalendar />,
	},
	{ label: "Revenue", value: "revenue.desc", icon: <FiArrowDown /> },
];

const CURATING_STAGES = [
	{ icon: <FiSmile />, label: "Reading your vibes", detail: "Mood signals locked in" },
	{ icon: <FiLayers />, label: "Studying your favorites", detail: "Pulling title DNA" },
	{ icon: <FiGrid />, label: "Scouting the catalog", detail: "Scanning thousands of titles" },
	{ icon: <FiZap />, label: "Ranking your shortlist", detail: "Writing your reasons" },
];

const HERO_POSTERS = [
	"/72AoFPC5TY4DfJwXXS9rPwPeReD.jpg",
	"/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg",
	"/aSmAmNAK2VYfb0rYlleYJ10s3CC.jpg",
];

const safePadding = { paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" };

/* ── Page ────────────────────────────────────────────────────────────────── */

function RecommendationsWizard() {
	// 0: start · 1: moods · 2: filters · 3: seeds · 4: AI curating · 5: deck
	const searchParams = useSearchParams();

	// Deep link: /recommendations?seed=ID&type=movie|tv&title=Name
	const seedHint: SeedTitle | null = useMemo(() => {
		const id = Number(searchParams.get("seed"));
		const type = searchParams.get("type");
		const title = searchParams.get("title") || "";
		if (!Number.isInteger(id) || (type !== "movie" && type !== "tv")) return null;
		return { id, title, mediaType: type };
	}, [searchParams]);

	const [step, setStep] = useState(seedHint ? 4 : 0);

	const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
	const [selectedYear, setSelectedYear] = useState("");
	const [selectedSort, setSelectedSort] = useState("popularity.desc");
	const [selectedMovies, setSelectedMovies] = useState<any[]>([]);
	const [movieChoices, setMovieChoices] = useState<any[]>([]);
	const [loadingChoices, setLoadingChoices] = useState(false);

	const [aiPicks, setAiPicks] = useState<AiPick[]>([]);
	const [aiSummary, setAiSummary] = useState("");
	const [aiGenerated, setAiGenerated] = useState(true);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [curateStage, setCurateStage] = useState(0);
	const [curateError, setCurateError] = useState(false);
	const [saved, setSaved] = useState(false);

	const currentPick = aiPicks[currentIndex];

	/* Auto-run AI curation when arriving seeded from a detail page */
	const seedStartedRef = useRef(false);
	useEffect(() => {
		if (!seedHint || seedStartedRef.current) return;
		seedStartedRef.current = true;
		runAiCuration([seedHint]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/* Curating stage cycler */
	useEffect(() => {
		if (step !== 4) return;
		setCurateStage(0);
		const timer = setInterval(
			() => setCurateStage((s) => Math.min(s + 1, CURATING_STAGES.length - 1)),
			1150
		);
		return () => clearInterval(timer);
	}, [step]);

	/* Re-sync saved state when the visible pick changes */
	useEffect(() => {
		setSaved(
			!!currentPick && isSaved(currentPick.id, currentPick.mediaType)
		);
	}, [currentIndex, aiPicks, currentPick]);

	/* Keyboard navigation on the deck */
	useEffect(() => {
		if (step !== 5 || !aiPicks.length) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight")
				setCurrentIndex((i) => (i + 1) % aiPicks.length);
			else if (e.key === "ArrowLeft")
				setCurrentIndex((i) => (i - 1 + aiPicks.length) % aiPicks.length);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	const toggleMood = (id: string) => {
		setSelectedMoods((prev) =>
			prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
		);
	};

	const toggleMovie = (movie: any) => {
		setSelectedMovies((prev) => {
			if (prev.find((m) => m.id === movie.id)) {
				return prev.filter((m) => m.id !== movie.id);
			}
			if (prev.length >= 3) return prev;
			return [...prev, movie];
		});
	};

	const fetchMovieChoices = async () => {
		setLoadingChoices(true);
		try {
			const genreIds = MOODS.filter((m) => selectedMoods.includes(m.id))
				.flatMap((m) => m.genres)
				.join("|");
			const res = await discoverMovies({
				genre: genreIds || undefined,
				page: 1,
				sort_by: "popularity.desc",
				year_gte: selectedYear || "2010",
			});
			const choices = (res.data || []).slice(0, 12);
			setMovieChoices(choices);
			setLoadingChoices(false);

			if (choices.length === 0) {
				// Nothing matched this mix — skip the favorites step and go straight to AI picks.
				runAiCuration();
			} else {
				setStep(3);
			}
		} catch (error) {
			console.error("Error fetching movie choices:", error);
			setLoadingChoices(false);
			setMovieChoices([]);
			runAiCuration();
		}
	};

	const runAiCuration = async (seedOverride?: SeedTitle[]) => {
		setCurateError(false);
		setStep(4);
		let picks: AiPick[] = [];
		let summary = "";
		let generated = true;
		try {
			const seeds =
				seedOverride ??
				selectedMovies.map((m) => ({
					id: m.id,
					title: m.title || m.name,
					mediaType: "movie" as const,
				}));
			const res = await fetch("/api/ai/recommendations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					moods: selectedMoods,
					seeds,
					year: selectedYear,
					sort: selectedSort,
				}),
			});
			const data = await res.json();
			picks = data.picks || [];
			summary = data.summary || "";
			generated = data.aiGenerated !== false;
		} catch (error) {
			console.error("AI curation request failed:", error);
		}

		if (!picks.length) {
			generated = false;
			summary = "Titles that fit your vibe";
			picks = (movieChoices || []).slice(0, 6).map((m: any) => ({
				id: m.id,
				title: m.title || m.name || "Unknown",
				mediaType: "movie" as const,
				year: (m.release_date || "").split("-")[0] || null,
				voteAverage: typeof m.vote_average === "number" ? m.vote_average : null,
				genres: [],
				overview: m.overview || null,
				posterPath: m.poster_path || null,
				backdropPath: m.backdrop_path || null,
				reason: "A solid match for your vibe.",
			}));
		}

		setAiPicks(picks);
		setAiSummary(summary);
		setAiGenerated(generated);
		setCurateError(!generated || !picks.length);
		setStep(5);
	};

	const nextPick = () => {
		if (!aiPicks.length) return;
		setCurrentIndex((i) => (i + 1) % aiPicks.length);
	};

	const prevPick = () => {
		if (!aiPicks.length) return;
		setCurrentIndex((i) => (i - 1 + aiPicks.length) % aiPicks.length);
	};

	const handleSave = () => {
		if (!currentPick) return;
		const nowSaved = toggleSaved({
			id: currentPick.id,
			mediaType: currentPick.mediaType,
			title: currentPick.title,
			posterPath: currentPick.posterPath,
		});
		setSaved(nowSaved);
	};

	const moodSummary = useMemo(
		() =>
			selectedMoods.length
				? selectedMoods.map(moodName).join(" · ")
				: "open to anything",
		[selectedMoods]
	);

	const stepLabel = useMemo(() => {
		const map: Record<number, string> = {
			1: "STEP 1 OF 3",
			2: "STEP 2 OF 3",
			3: "STEP 3 OF 3",
		};
		return map[step] || "";
	}, [step]);

	return (
		<div className="min-h-screen bg-[#0a0a0a] text-white max-w-2xl mx-auto overflow-x-hidden pt-20">
			<div className="fixed inset-0 bg-[#0a0a0a] -z-50" />

			<AnimatePresence mode="wait">
				{step === 0 && (
					<motion.div
						key="start"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex flex-col items-center justify-center min-h-[72vh] text-center relative px-4 md:px-8">
						<span className="inline-flex items-center gap-2 bg-[#E6501B]/10 border border-[#E6501B]/30 text-[#ff8a5c] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-10">
							<GiSparkles className="text-[15px]" />
							AI-Powered Picks
						</span>

						<div className="relative w-full aspect-square max-w-sm mb-12 flex items-center justify-center">
							<div className="absolute w-[70%] aspect-square rounded-full bg-[#E6501B]/20 blur-3xl animate-pulse" />
							{HERO_POSTERS.slice(1).map((path, idx) => (
								<div
									key={idx}
									className="absolute w-[45%] aspect-[2/3] bg-[#141414] rounded-xl shadow-2xl overflow-hidden border border-white/10"
									style={{
										transform: `rotate(${idx === 0 ? -15 : 15}deg) translateX(${idx === 0 ? -64 : 64}px) translateY(16px)`,
										filter: "grayscale(0.5) opacity(0.45)",
									}}>
									<Image
										unoptimized
										src={getImageBaseLink({
											path,
											type: "poster",
											quality: "lg",
										})}
										alt=""
										fill
										className="object-cover"
									/>
								</div>
							))}
							<div className="relative w-[52%] aspect-[2/3] bg-[#141414] rounded-2xl shadow-2xl overflow-hidden border border-white/10 scale-110 z-10">
								<Image
									unoptimized
									src={getImageBaseLink({
										path: HERO_POSTERS[0],
										type: "poster",
										quality: "lg",
									})}
									alt="poster"
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 ring-1 ring-inset ring-white/5" />
							</div>
						</div>

						<h1 className="text-4xl md:text-5xl font-bold uppercase bebas_nueve tracking-wider leading-none">
							Find your next
							<br />
							obsession
						</h1>
						<p className="text-gray-400 text-base max-w-xs mx-auto mt-5">
							Tell Hooked AI your vibe, hand over a few favorites, and get a
							curated shortlist — with a reason for every pick.
						</p>

						<div
							style={safePadding}
							className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent backdrop-blur-md z-50">
							<button
								onClick={() => setStep(1)}
								className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 bg-white text-black rounded-full font-bold text-base hover:bg-gray-200 transition-all shadow-xl uppercase tracking-widest h-12">
								Start matching
								<FiArrowRight size={18} />
							</button>
						</div>
					</motion.div>
				)}

				{step === 1 && (
					<motion.div
						key="moods"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex flex-col pb-10 relative px-4 md:px-8">
						<div className="flex justify-between items-center mb-10">
							<button
								onClick={() => setStep(0)}
								className="text-gray-400 hover:text-white transition-colors">
								✕
							</button>
							<span className="text-sm font-medium uppercase tracking-widest text-gray-500">
								{stepLabel}
							</span>
							<span className="text-gray-400 text-xs font-mono font-bold">
								{selectedMoods.length} selected
							</span>
						</div>

						<h1 className="text-3xl font-bold text-center mb-3 max-w-xs mx-auto uppercase bebas_nueve tracking-wide">
							Pick your vibe
						</h1>
						<p className="text-gray-500 text-center text-sm max-w-[17rem] mx-auto mb-10">
							Tap every mood you feel — the more you pick, the sharper the
							AI gets.
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-40 px-1">
							{MOODS.map((mood) => {
								const meta = MOOD_CARDS[mood.id] || {
									icon: <FiZap />,
									accent: "#E6501B",
									blurb: "Mood",
								};
								const isSelected = selectedMoods.includes(mood.id);
								return (
									<motion.button
										key={mood.id}
										layout
										transition={{ type: "spring", stiffness: 500, damping: 35 }}
										onClick={() => toggleMood(mood.id)}
										className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-colors duration-200 active:scale-[0.98] ${
											isSelected
												? "bg-white/[0.06]"
												: "border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
										}`}
										style={
											isSelected
												? {
														borderColor: meta.accent,
														boxShadow: `0 0 22px ${meta.accent}26`,
													}
												: undefined
										}>
										<span
											className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0 border transition-colors"
											style={
												isSelected
													? {
															background: meta.accent,
															color: "#0a0a0a",
															borderColor: meta.accent,
														}
													: {
															color: meta.accent,
															background: `${meta.accent}1a`,
															borderColor: `${meta.accent}38`,
														}
											}>
											{meta.icon}
										</span>
										<span className="flex-1 min-w-0">
											<span
												className={`block text-[13px] font-bold leading-tight tracking-wide transition-colors ${
													isSelected ? "text-white" : "text-gray-100"
												}`}>
												{mood.name}
											</span>
											<span className="block text-[11px] text-gray-500 mt-0.5">
												{meta.blurb}
											</span>
										</span>
										<span
											className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
												isSelected
													? "text-[#0a0a0a]"
													: "border-white/15 text-transparent"
											}`}
											style={
												isSelected
													? {
															background: meta.accent,
															borderColor: meta.accent,
														}
													: undefined
											}>
											<FiCheck size={14} />
										</span>
									</motion.button>
								);
							})}
						</div>

						<div
							style={safePadding}
							className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent backdrop-blur-md z-50">
							<div className="max-w-lg mx-auto">
								{selectedMoods.length > 0 && (
									<div className="flex flex-wrap justify-center gap-2 mb-3 px-4">
										{selectedMoods.map((id) => {
											const meta = MOOD_CARDS[id] || {
												icon: <FiZap />,
												accent: "#E6501B",
											};
											return (
												<span
													key={id}
													className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-white/10 border border-white/15 px-3 py-1.5 rounded-full">
													<span className="text-[13px]" style={{ color: meta.accent }}>
														{meta.icon}
													</span>
													{moodName(id)}
												</span>
											);
										})}
									</div>
								)}
								<button
									onClick={() => setStep(2)}
									className="w-full flex items-center justify-center bg-white text-black rounded-full font-bold text-base hover:bg-gray-200 transition-all shadow-xl uppercase tracking-widest h-12 px-4 text-center">
									{selectedMoods.length > 0
										? `Continue with ${selectedMoods.length} mood${selectedMoods.length > 1 ? "s" : ""}`
										: "I'm open to anything"}
								</button>
							</div>
						</div>
					</motion.div>
				)}

				{step === 2 && (
					<motion.div
						key="filters"
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -50 }}
						className="flex flex-col pb-10 relative px-4 md:px-8">
						<div className="flex justify-between items-center mb-10">
							<button
								onClick={() => setStep(1)}
								className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
								<FiChevronLeft /> Back
							</button>
							<span className="text-sm font-medium uppercase tracking-widest text-gray-500">
								{stepLabel}
							</span>
							<span className="text-gray-400 text-xs font-mono font-bold">
								Refine
							</span>
						</div>

						<h1 className="text-3xl font-bold text-center mb-3 max-w-xs mx-auto uppercase bebas_nueve tracking-wide">
							Fine-tune the shortlist
						</h1>
						<p className="text-gray-500 text-center text-sm mb-10">
							Lock your eras and ordering — Hooked AI will work the rest out.
						</p>

						<div className="space-y-10 mb-32">
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
									<FiCalendar /> Release Era
								</div>
								<div className="flex flex-wrap gap-3">
									{YEARS.map((y) => (
										<button
											key={y.label}
											onClick={() => setSelectedYear(y.value)}
											className={`px-6 h-10 rounded-full border-2 transition-all font-bold text-sm flex items-center justify-center ${
												selectedYear === y.value
													? "bg-white text-black border-white"
													: "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600"
											}`}>
											{y.label}
										</button>
									))}
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
									<FiSliders /> Sort By
								</div>
								<div className="grid grid-cols-1 gap-3">
									{SORT_OPTIONS.map((s) => (
										<button
											key={s.value}
											onClick={() => setSelectedSort(s.value)}
											className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between font-bold ${
												selectedSort === s.value
													? "bg-white/10 text-white border-[#E6501B] shadow-[0_0_20px_rgba(230,80,27,0.15)]"
													: "bg-gray-900/50 text-gray-500 border-gray-800 hover:border-gray-700"
											}`}>
											<span className="flex items-center gap-3">
												{s.icon}
												{s.label}
											</span>
											{selectedSort === s.value && (
												<div className="w-2 h-2 rounded-full bg-[#E6501B]" />
											)}
										</button>
									))}
								</div>
							</div>
						</div>

						<div
							style={safePadding}
							className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent backdrop-blur-md z-50">
							<button
								onClick={fetchMovieChoices}
								className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 bg-white text-black rounded-full font-bold text-base hover:bg-gray-200 transition-all shadow-xl uppercase tracking-widest h-12">
								Find favorites to feed the AI
								<FiArrowRight size={18} />
							</button>
						</div>
					</motion.div>
				)}

				{step === 3 && (
					<motion.div
						key="seeds"
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -50 }}
						className="flex flex-col pb-10 relative px-4 md:px-8">
						<div className="flex justify-between items-center mb-10">
							<button
								onClick={() => setStep(2)}
								className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
								<FiChevronLeft /> Back
							</button>
							<span className="text-sm font-medium uppercase tracking-widest text-gray-500">
								{stepLabel}
							</span>
							<span className="text-gray-400 text-xs font-mono font-bold">
								Optional
							</span>
						</div>

						<h1 className="text-3xl font-bold text-center mb-3 max-w-xs mx-auto uppercase bebas_nueve tracking-wide">
							Any favorites here?
						</h1>
						<p className="text-gray-500 text-center mb-10 text-sm max-w-xs mx-auto">
							Tap up to 3 you&apos;ve loved — Hooked AI studies their DNA for
							better picks.
						</p>

						{loadingChoices ? (
							<div className="grid grid-cols-3 gap-3 mb-32">
								{Array.from({ length: 9 }).map((_, i) => (
									<div
										key={i}
										className="aspect-[2/3] rounded-lg bg-white/5 animate-pulse"
									/>
								))}
							</div>
						) : movieChoices.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-3 py-16 mb-28">
								<span className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
									<FiFilm size={24} />
								</span>
								<p className="text-gray-500 text-sm text-center max-w-[16rem]">
									Couldn&apos;t find candidates for that mix — you can skip
									straight to the AI picks.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-3 gap-3 mb-32">
								{movieChoices.map((movie) => {
									const isSelected = selectedMovies.find(
										(m) => m.id === movie.id
									);
									return (
										<button
											key={movie.id}
											onClick={() => toggleMovie(movie)}
											className="relative aspect-[2/3] rounded-lg overflow-hidden group">
											<Image
												unoptimized
												src={getImageBaseLink({
													path: movie.poster_path,
													type: "poster",
													quality: "md",
												})}
												alt={movie.title}
												fill
												className={`object-cover transition-all duration-300 ${
													isSelected
														? "scale-105"
														: "opacity-60 grayscale-[0.5]"
												}`}
											/>
											<div
												className={`absolute inset-0 bg-black/40 transition-opacity ${
													isSelected ? "opacity-100" : "opacity-0"
												}`}
											/>
											{isSelected && (
												<div className="absolute inset-0 flex items-center justify-center">
													<FiCheckCircle className="text-[#E6501B] text-4xl drop-shadow-lg" />
												</div>
											)}
										</button>
									);
								})}
							</div>
						)}

						<div
							style={safePadding}
							className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent backdrop-blur-md z-50">
							<button
								onClick={() => runAiCuration()}
								className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 bg-white text-black rounded-full font-bold text-base hover:bg-gray-200 transition-all shadow-xl uppercase tracking-widest h-12 px-4 text-center">
								<GiSparkles className="text-[#E6501B] text-lg" />
								{selectedMovies.length > 0
									? `Curate with ${selectedMovies.length} favorites`
									: "Generate AI picks"}
							</button>
						</div>
					</motion.div>
				)}

				{step === 4 && (
					<motion.div
						key="curating"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 relative">
						<div className="relative mb-12 flex items-center justify-center">
							<div className="absolute w-36 h-36 rounded-full border border-[#E6501B]/30 animate-ping" />
							<div className="absolute w-36 h-36 rounded-full border border-[#E6501B]/40" />
							<div className="absolute w-36 h-36 rounded-full border-t-2 border-[#E6501B] animate-spin" />
							<div className="w-20 h-20 rounded-full bg-[#E6501B]/10 border border-[#E6501B]/40 flex items-center justify-center">
								<BiSolidBot className="text-[#ff8a5c] text-4xl" />
							</div>
						</div>

						<h2 className="text-3xl font-bold uppercase bebas_nueve tracking-wide mb-2">
							Hooked AI is cooking
						</h2>
						<p className="text-gray-500 text-sm mb-8">{moodSummary}</p>

						<div className="w-full max-w-sm space-y-3 text-left">
							{CURATING_STAGES.map((stage, i) => {
								const done = i < curateStage;
								const active = i === curateStage;
								return (
									<motion.div
										key={stage.label}
										animate={{ opacity: active || done ? 1 : 0.35 }}
										className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors"
										style={{
											borderColor: active
												? "rgba(230,80,27,0.35)"
												: "rgba(255,255,255,0.08)",
											background: active
												? "rgba(230,80,27,0.06)"
												: "rgba(255,255,255,0.03)",
										}}>
										<span
											className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
												done
													? "bg-[#E6501B] text-white"
													: active
														? "bg-white/10 text-[#ff8a5c]"
														: "bg-white/5 text-gray-500"
											}`}>
											{done ? <FiCheck /> : active ? <FiLoader className="animate-spin" /> : stage.icon}
										</span>
										<div className="flex-1">
											<p className="text-sm font-bold">{stage.label}</p>
											<p className="text-xs text-gray-500">{stage.detail}</p>
										</div>
										{active && (
											<BiLoaderAlt className="text-[#E6501B] animate-spin" />
										)}
									</motion.div>
								);
							})}
						</div>

						{curateError && (
							<p className="mt-6 text-xs text-red-400">
								AI is feeling slow — showing a popularity backup instead.
							</p>
						)}
					</motion.div>
				)}

				{step === 5 && (
					<motion.div
						key="deck"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black overflow-hidden">
						{currentPick ? (
							<div className="relative w-full h-full flex flex-col">
								{(currentPick.backdropPath || currentPick.posterPath) && (
									<div className="absolute inset-0 z-0">
										<Image
											unoptimized
											src={getImageBaseLink({
												path: currentPick.backdropPath || currentPick.posterPath,
												type: currentPick.backdropPath
													? "backdrop"
													: "poster",
												quality: "lg",
											})}
											alt={currentPick.title}
											fill
											className="object-cover"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
										<div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
									</div>
								)}

								{/* Top bar */}
								<div className="relative z-10 p-6 flex justify-between items-center pt-[calc(5.5rem+env(safe-area-inset-top))]">
									<button
										onClick={() => setStep(3)}
										className="px-4 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center gap-2 text-white border border-white/10 text-sm font-bold">
										<FiChevronLeft size={20} />
										Back
									</button>
									<div className="flex items-center gap-2">
										{aiGenerated && (
											<span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 h-10 rounded-full border border-[#E6501B]/40 text-[#ffc9ad] text-xs font-bold uppercase tracking-wider">
												<GiSparkles className="text-[#E6501B]" />
												AI Pick
											</span>
										)}
										<span className="text-sm font-bold text-white/80 bg-black/40 backdrop-blur-md px-4 h-10 flex items-center justify-center rounded-full border border-white/10">
											{currentIndex + 1} / {aiPicks.length}
										</span>
									</div>
								</div>

								{/* Filmstrip */}
								<div className="relative z-10 px-4 mt-4 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 flex-nowrap">
									{aiPicks.map((pick, i) => (
										<ReasonCard
											key={`${pick.mediaType}-${pick.id}`}
											pick={pick}
											active={i === currentIndex}
											onSelect={() => setCurrentIndex(i)}
										/>
									))}
								</div>

								{/* Main content */}
								<div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-44">
									<div className="space-y-4 max-w-md">
										{aiSummary && aiGenerated && (
											<div className="flex items-start gap-2 text-[#ff8a5c] bg-black/40 backdrop-blur-md border border-[#E6501B]/25 rounded-xl px-4 py-2.5 w-fit max-w-full">
												<GiSparkles className="mt-0.5 flex-shrink-0" />
												<p className="text-xs font-semibold leading-relaxed">
													{aiSummary}
												</p>
											</div>
										)}

										{!aiGenerated && (
											<p className="text-[11px] text-gray-400">
												AI was offline — showing a popularity-curated
												backup instead.
											</p>
										)}

										<h2 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow-2xl uppercase bebas_nueve tracking-wider">
											{currentPick.title}
										</h2>

										<div className="flex flex-wrap items-center gap-3 text-gray-200 font-semibold drop-shadow-md text-sm">
											<span className="uppercase text-[10px] font-black tracking-widest bg-white/90 text-black px-2 py-1 rounded-md">
												{currentPick.mediaType === "tv" ? "Series" : "Film"}
											</span>
											<span>{currentPick.year || "—"}</span>
											{typeof currentPick.voteAverage === "number" && (
												<span className="flex items-center gap-1">
													<AiFillStar className="text-[#F5C518]" />
													{currentPick.voteAverage.toFixed(1)}/10
												</span>
											)}
											{currentPick.genres.slice(0, 3).map((g) => (
												<span
													key={g}
													className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-[11px] font-bold text-gray-200">
													{g}
												</span>
											))}
										</div>

										{currentPick.overview && (
											<p className="text-gray-100 text-sm leading-relaxed line-clamp-2 drop-shadow-md font-medium">
												{currentPick.overview}
											</p>
										)}

										<div className="flex items-start gap-3 bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3.5">
											<div className="w-8 h-8 rounded-full bg-[#E6501B]/15 border border-[#E6501B]/40 flex items-center justify-center flex-shrink-0">
												<GiSparkles className="text-[#ff8a5c] text-base" />
											</div>
											<div>
												<p className="text-[10px] font-black uppercase tracking-widest text-[#ff8a5c] mb-1">
													Why you&apos;ll like it
												</p>
												<p className="text-sm font-medium text-gray-100 leading-relaxed">
													{currentPick.reason ||
														"Hand-picked to fit your vibe."}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Action bar */}
								<div
									style={safePadding}
									className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-md z-50">
									<div className="max-w-lg mx-auto flex flex-col gap-4">
										<div className="flex gap-4">
											<button
												onClick={prevPick}
												aria-label="Previous pick"
												className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/20">
												<FiChevronLeft size={20} />
											</button>
											<button
												onClick={nextPick}
												className="flex-1 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/20 text-white">
												<FiRotateCcw size={20} />
												Rematch
											</button>
											<button
												onClick={handleSave}
												className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
													saved
														? "bg-[#E6501B] border-[#E6501B] text-white"
														: "bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20"
												}`}
												aria-label="Save to watchlist">
												<FiBookmark
													size={20}
													className={saved ? "fill-white" : ""}
												/>
											</button>
											<button
												onClick={nextPick}
												aria-label="Next pick"
												className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/20">
												<FiChevronRight size={20} />
											</button>
										</div>
										<Link
											prefetch={false}
											href={`/${currentPick.mediaType}/${decorateLink(currentPick.title)}/${currentPick.id}`}
											className="w-full flex items-center justify-center bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all shadow-2xl uppercase tracking-widest h-12">
											Watch details
										</Link>
									</div>
								</div>
							</div>
						) : (
							<div className="flex items-center justify-center h-screen bg-black">
								<div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default function RecommendationsPage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
			<RecommendationsWizard />
		</Suspense>
	);
}