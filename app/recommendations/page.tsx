"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
import { isSaved } from "@/lib/watchlist";
import { useUser } from "@/lib/hooks/useUser";
import { isInWatchlist, toggleWatchlist } from "@/app/actions/watchlist";
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

/* ── Shared wizard chrome ────────────────────────────────────────────────── */

const CtaBar = ({ children }: { children: ReactNode }) => (
	<div
		style={safePadding}
		className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-bg-main via-bg-main to-transparent px-6 pt-16">
		<div className="mx-auto w-full max-w-lg">{children}</div>
	</div>
);

const CtaButton = ({
	children,
	onClick,
}: {
	children: ReactNode;
	onClick: () => void;
}) => (
	<button
		onClick={onClick}
		className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-text-primary px-6 text-sm font-bold uppercase tracking-[0.16em] text-bg-main shadow-xl transition-all hover:opacity-90 active:scale-[0.99]">
		{children}
	</button>
);

const StepHeader = ({
	onBack,
	step,
	right,
}: {
	onBack: () => void;
	step?: number;
	right?: ReactNode;
}) => (
	<div className="pt-8">
		<div className="flex items-center justify-between gap-4">
			<button
				onClick={onBack}
				aria-label="Go back"
				className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary">
				<FiChevronLeft size={20} />
			</button>
			{step ? (
				<span className="eyebrow">Step {step} of 3</span>
			) : (
				<span aria-hidden />
			)}
			<div className="flex min-w-[2.5rem] items-center justify-end text-xs font-semibold tabular text-text-secondary">
				{right}
			</div>
		</div>
		{step ? (
			<div className="mt-6 flex gap-1.5">
				{[1, 2, 3].map((n) => (
					<span
						key={n}
						className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
							n <= step ? "bg-primary" : "bg-white/10"
						}`}
					/>
				))}
			</div>
		) : null}
	</div>
);

const StepTitle = ({ title, hint }: { title: ReactNode; hint: string }) => (
	<div className="mx-auto mt-10 max-w-md text-center">
		<h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">
			{title}
		</h1>
		<p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
			{hint}
		</p>
	</div>
);

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
	const [saving, setSaving] = useState(false);
	const { user } = useUser();
	const router = useRouter();

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
		let cancelled = false;
		const run = async () => {
			if (!currentPick) {
				setSaved(false);
				return;
			}
			if (user) {
				try {
					const res = await isInWatchlist(
						currentPick.mediaType,
						currentPick.id,
					);
					if (!cancelled) setSaved(res);
				} catch {
					/* ignore */
				}
			} else if (!cancelled) {
				setSaved(isSaved(currentPick.id, currentPick.mediaType));
			}
		};
		run();
		return () => {
			cancelled = true;
		};
	}, [currentIndex, aiPicks, currentPick, user]);

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

	const handleSave = async () => {
		if (!currentPick || saving) return;
		if (!user) {
			router.push("/login");
			return;
		}
		setSaving(true);
		try {
			await toggleWatchlist({
				mediaType: currentPick.mediaType,
				tmdbId: currentPick.id,
				title: currentPick.title,
				posterPath: currentPick.posterPath,
			});
			setSaved(await isInWatchlist(currentPick.mediaType, currentPick.id));
		} catch (err) {
			console.error(err);
		} finally {
			setSaving(false);
		}
	};

	const moodSummary = useMemo(
		() =>
			selectedMoods.length
				? selectedMoods.map(moodName).join(" · ")
				: "open to anything",
		[selectedMoods]
	);

	return (
		<div className="relative min-h-screen pt-[var(--nav-h)] text-text-primary">
			<AnimatePresence mode="wait">
				{step === 0 && (
					<motion.div
						key="start"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="shell flex min-h-[calc(100vh-var(--nav-h))] flex-col items-center justify-center pb-28 text-center">
						<span className="glass-card inline-flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
							<GiSparkles className="text-[15px]" />
							AI-Powered Picks
						</span>

						<div className="relative mt-14 mb-12 flex aspect-square w-full max-w-sm items-center justify-center">
							<div className="absolute h-[70%] w-[70%] rounded-full bg-primary/20 blur-3xl" />
							{HERO_POSTERS.slice(1).map((path, idx) => (
								<div
									key={idx}
									className="absolute left-1/2 top-1/2 aspect-[2/3] w-[45%] overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl"
									style={{
										transform: `translate(-50%, -50%) rotate(${idx === 0 ? -15 : 15}deg) translateX(${idx === 0 ? -72 : 72}px) translateY(18px)`,
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
							<div className="absolute left-1/2 top-1/2 z-10 aspect-[2/3] w-[52%] -translate-x-1/2 -translate-y-1/2 scale-110 overflow-hidden rounded-3xl border border-white/15 bg-bg-secondary shadow-2xl">
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
								<div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
							</div>
						</div>

						<h1 className="font-display text-6xl uppercase leading-[0.88] tracking-wide sm:text-7xl md:text-8xl">
							Find your next
							<br />
							<span className="text-primary">obsession</span>
						</h1>
						<p className="mt-6 max-w-md text-balance text-sm leading-relaxed text-text-secondary sm:text-base">
							Tell Hooked AI your vibe, hand over a few favorites, and get a
							curated shortlist — with a reason for every pick.
						</p>

						<CtaBar>
							<CtaButton onClick={() => setStep(1)}>
								Start matching
								<FiArrowRight size={18} />
							</CtaButton>
						</CtaBar>
					</motion.div>
				)}

				{step === 1 && (
					<motion.div
						key="moods"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="shell pb-40">
						<div className="mx-auto w-full max-w-3xl">
							<StepHeader
								step={1}
								onBack={() => setStep(0)}
								right={`${selectedMoods.length} selected`}
							/>

							<StepTitle
								title="Pick your vibe"
								hint="Tap every mood you feel — the more you pick, the sharper the AI gets."
							/>

							<div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
											className={`relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition-colors duration-200 active:scale-[0.98] ${
												isSelected
													? "bg-white/[0.06]"
													: "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
											}`}
											style={
												isSelected
													? {
															borderColor: meta.accent,
															boxShadow: `0 0 24px ${meta.accent}26`,
														}
													: undefined
											}>
											<span className="flex items-center justify-between">
												<span
													className="flex h-11 w-11 items-center justify-center rounded-xl border text-[22px] transition-colors"
													style={
														isSelected
															? {
																	background: meta.accent,
																	color: "#0a0908",
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
												<span
													className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${
														isSelected
															? "text-[#0a0908]"
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
											</span>
											<span>
												<span className="block text-sm font-bold leading-tight">
													{mood.name}
												</span>
												<span className="mt-0.5 block text-xs text-text-secondary">
													{meta.blurb}
												</span>
											</span>
										</motion.button>
									);
								})}
							</div>
						</div>

						<CtaBar>
							{selectedMoods.length > 0 && (
								<div className="mb-3 flex flex-wrap justify-center gap-2 px-4">
									{selectedMoods.map((id) => {
										const meta = MOOD_CARDS[id] || {
											icon: <FiZap />,
											accent: "#E6501B",
										};
										return (
											<span
												key={id}
												className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white">
												<span className="text-[13px]" style={{ color: meta.accent }}>
													{meta.icon}
												</span>
												{moodName(id)}
											</span>
										);
									})}
								</div>
							)}
							<CtaButton onClick={() => setStep(2)}>
								{selectedMoods.length > 0
									? `Continue with ${selectedMoods.length} mood${selectedMoods.length > 1 ? "s" : ""}`
									: "I'm open to anything"}
							</CtaButton>
						</CtaBar>
					</motion.div>
				)}

				{step === 2 && (
					<motion.div
						key="filters"
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -50 }}
						className="shell pb-40">
						<div className="mx-auto w-full max-w-xl">
							<StepHeader step={2} onBack={() => setStep(1)} right="Refine" />

							<StepTitle
								title="Fine-tune the shortlist"
								hint="Lock your eras and ordering — Hooked AI will work the rest out."
							/>

							<div className="mt-10 space-y-10">
								<div className="space-y-4">
									<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
										<FiCalendar /> Release Era
									</div>
									<div className="flex flex-wrap gap-3">
										{YEARS.map((y) => (
											<button
												key={y.label}
												onClick={() => setSelectedYear(y.value)}
												className={`flex h-10 items-center justify-center rounded-full border px-5 text-sm font-bold transition-colors ${
													selectedYear === y.value
														? "border-transparent bg-text-primary text-bg-main"
														: "border-white/10 text-text-secondary hover:border-white/30 hover:text-text-primary"
												}`}>
												{y.label}
											</button>
										))}
									</div>
								</div>

								<div className="space-y-4">
									<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
										<FiSliders /> Sort By
									</div>
									<div className="grid grid-cols-1 gap-3">
										{SORT_OPTIONS.map((s) => (
											<button
												key={s.value}
												onClick={() => setSelectedSort(s.value)}
												className={`flex items-center justify-between rounded-2xl border p-5 text-sm font-bold transition-all ${
													selectedSort === s.value
														? "border-primary bg-primary/10 text-text-primary"
														: "border-white/10 bg-white/[0.02] text-text-secondary hover:border-white/25"
												}`}>
												<span className="flex items-center gap-3">
													{s.icon}
													{s.label}
												</span>
												{selectedSort === s.value && (
													<span className="h-2 w-2 rounded-full bg-primary" />
												)}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>

						<CtaBar>
							<CtaButton onClick={fetchMovieChoices}>
								Find favorites to feed the AI
								<FiArrowRight size={18} />
							</CtaButton>
						</CtaBar>
					</motion.div>
				)}

				{step === 3 && (
					<motion.div
						key="seeds"
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -50 }}
						className="shell pb-40">
						<div className="mx-auto w-full max-w-3xl">
							<StepHeader step={3} onBack={() => setStep(2)} right="Optional" />

							<StepTitle
								title="Any favorites here?"
								hint="Tap up to 3 you've loved — Hooked AI studies their DNA for better picks."
							/>

							{loadingChoices ? (
								<div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4">
									{Array.from({ length: 12 }).map((_, i) => (
										<div
											key={i}
											className="aspect-[2/3] animate-pulse rounded-xl bg-white/5"
										/>
									))}
								</div>
							) : movieChoices.length === 0 ? (
								<div className="mt-10 flex flex-col items-center justify-center gap-3 py-16">
									<span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-secondary">
										<FiFilm size={24} />
									</span>
									<p className="max-w-[16rem] text-center text-sm text-text-secondary">
										Couldn&apos;t find candidates for that mix — you can skip
										straight to the AI picks.
									</p>
								</div>
							) : (
								<div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4">
									{movieChoices.map((movie) => {
										const isSelected = selectedMovies.find(
											(m) => m.id === movie.id
										);
										return (
											<button
												key={movie.id}
												onClick={() => toggleMovie(movie)}
												className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10">
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
															: "opacity-70 grayscale-[0.4] group-hover:opacity-100"
													}`}
												/>
												<div
													className={`absolute inset-0 bg-black/40 transition-opacity ${
														isSelected ? "opacity-100" : "opacity-0"
													}`}
												/>
												{isSelected && (
													<div className="absolute inset-0 flex items-center justify-center">
														<FiCheckCircle
															size={36}
															className="text-primary drop-shadow-lg"
														/>
													</div>
												)}
											</button>
										);
									})}
								</div>
							)}
						</div>

						<CtaBar>
							<CtaButton onClick={() => runAiCuration()}>
								<GiSparkles className="text-lg text-primary" />
								{selectedMovies.length > 0
									? `Curate with ${selectedMovies.length} favorites`
									: "Generate AI picks"}
							</CtaButton>
						</CtaBar>
					</motion.div>
				)}

				{step === 4 && (
					<motion.div
						key="curating"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="shell flex min-h-[calc(100vh-var(--nav-h))] flex-col items-center justify-center py-16 text-center">
						<div className="relative mb-12 flex items-center justify-center">
							<div className="absolute h-36 w-36 animate-ping rounded-full border border-primary/30" />
							<div className="absolute h-36 w-36 rounded-full border border-primary/40" />
							<div className="absolute h-36 w-36 animate-spin rounded-full border-t-2 border-primary" />
							<div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
								<BiSolidBot className="text-4xl text-primary" />
							</div>
						</div>

						<h2 className="font-display text-5xl uppercase tracking-wide">
							Hooked AI is cooking
						</h2>
						<p className="mt-3 text-sm text-text-secondary">{moodSummary}</p>

						<div className="mt-8 w-full max-w-sm space-y-3 text-left">
							{CURATING_STAGES.map((stage, i) => {
								const done = i < curateStage;
								const active = i === curateStage;
								return (
									<motion.div
										key={stage.label}
										animate={{ opacity: active || done ? 1 : 0.35 }}
										className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
											active
												? "border-primary/30 bg-primary/[0.06]"
												: "border-white/10 bg-white/[0.02]"
										}`}>
										<span
											className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
												done
													? "bg-primary text-white"
													: active
														? "bg-white/10 text-primary"
														: "bg-white/5 text-text-secondary"
											}`}>
											{done ? <FiCheck /> : active ? <FiLoader className="animate-spin" /> : stage.icon}
										</span>
										<div className="flex-1">
											<p className="text-sm font-bold">{stage.label}</p>
											<p className="text-xs text-text-secondary">{stage.detail}</p>
										</div>
										{active && <BiLoaderAlt className="animate-spin text-primary" />}
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
						className="fixed inset-0 z-50 overflow-hidden bg-bg-main">
						{currentPick ? (
							<div className="flex h-full w-full flex-col">
								{/* Hero banner — the current pick's artwork, never covered */}
								<div className="relative shrink-0 basis-[40%] overflow-hidden sm:basis-[36%]">
									{(currentPick.backdropPath || currentPick.posterPath) && (
										<>
											<Image
												unoptimized
												src={getImageBaseLink({
													path: currentPick.backdropPath || currentPick.posterPath,
													type: currentPick.backdropPath ? "backdrop" : "poster",
													quality: "lg",
												})}
												alt={currentPick.title}
												fill
												className="object-cover"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-black/30" />
										</>
									)}

									{/* Top bar */}
									<div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 pt-[calc(5rem+env(safe-area-inset-top))]">
										<button
											onClick={() => setStep(3)}
											className="flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 text-sm font-bold text-white backdrop-blur-md">
											<FiChevronLeft size={20} />
											Back
										</button>
										<div className="flex items-center gap-2">
											{aiGenerated && (
												<span className="flex h-10 items-center gap-1.5 rounded-full border border-primary/40 bg-black/40 px-3 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-md">
													<GiSparkles className="text-primary" />
													AI Pick
												</span>
											)}
											<span className="flex h-10 items-center justify-center rounded-full border border-white/15 bg-black/40 px-4 text-sm font-bold text-white/80 backdrop-blur-md">
												{currentIndex + 1} / {aiPicks.length}
											</span>
										</div>
									</div>
								</div>

								{/* Details panel */}
								<div className="min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
									<div className="mx-auto w-full max-w-xl space-y-4">
										{aiSummary && aiGenerated && (
											<div className="flex w-fit max-w-full items-start gap-2 rounded-xl border border-primary/25 bg-black/40 px-4 py-2.5 text-primary backdrop-blur-md">
												<GiSparkles className="mt-0.5 flex-shrink-0" />
												<p className="text-xs font-semibold leading-relaxed">
													{aiSummary}
												</p>
											</div>
										)}

										{!aiGenerated && (
											<p className="text-[11px] text-text-secondary">
												AI was offline — showing a popularity-curated
												backup instead.
											</p>
										)}

										<h2 className="font-display text-5xl uppercase leading-[0.92] tracking-wide drop-shadow-2xl sm:text-6xl">
											{currentPick.title}
										</h2>

										<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/90 drop-shadow-md">
											<span className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-black">
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
													className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/90 backdrop-blur">
													{g}
												</span>
											))}
										</div>

										{currentPick.overview && (
											<p className="line-clamp-2 text-sm font-medium leading-relaxed text-white/90 drop-shadow-md">
												{currentPick.overview}
											</p>
										)}

										<div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-black/50 px-4 py-3.5 backdrop-blur-md">
											<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
												<GiSparkles className="text-base text-primary" />
											</div>
											<div>
												<p className="mb-1 text-[10px] font-black uppercase tracking-widest text-primary">
													Why you&apos;ll like it
												</p>
												<p className="text-sm font-medium leading-relaxed text-white/90">
													{currentPick.reason ||
														"Hand-picked to fit your vibe."}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Shortlist rail */}
								<div className="shrink-0 px-6 pb-2 pt-3">
									<p className="eyebrow mb-3 text-text-secondary">
										More like this
									</p>
									<div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
										{aiPicks.map((pick, i) => (
											<ReasonCard
												key={`${pick.mediaType}-${pick.id}`}
												pick={pick}
												active={i === currentIndex}
												onSelect={() => setCurrentIndex(i)}
												size="sm"
											/>
										))}
									</div>
								</div>

								{/* Action bar */}
								<div
									style={safePadding}
									className="relative z-10 shrink-0 border-t border-white/10 bg-bg-main px-6 pt-4">
									<div className="mx-auto flex max-w-lg flex-col gap-4">
										<div className="flex gap-4">
											<button
												onClick={prevPick}
												aria-label="Previous pick"
												className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20">
												<FiChevronLeft size={20} />
											</button>
											<button
												onClick={nextPick}
												className="flex h-12 flex-1 items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 font-bold text-white backdrop-blur-xl transition-all hover:bg-white/20">
												<FiRotateCcw size={20} />
												Rematch
											</button>
											<button
												onClick={handleSave}
												disabled={saving}
												title={user ? undefined : "Sign in to save to your watchlist"}
												className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all disabled:opacity-60 ${
													saved
														? "border-primary bg-primary text-white"
														: "border-white/20 bg-white/10 text-white backdrop-blur-xl hover:bg-white/20"
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
												className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20">
												<FiChevronRight size={20} />
											</button>
										</div>
										<Link
											prefetch={false}
											href={`/${currentPick.mediaType}/${decorateLink(currentPick.title)}/${currentPick.id}`}
											className="flex h-12 w-full items-center justify-center rounded-2xl bg-text-primary font-bold uppercase tracking-widest text-bg-main shadow-2xl transition-all hover:opacity-90">
											Watch details
										</Link>
									</div>
								</div>
							</div>
						) : (
							<div className="flex h-screen items-center justify-center bg-black">
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
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
		<Suspense fallback={<div className="min-h-screen pt-[var(--nav-h)]" />}>
			<RecommendationsWizard />
		</Suspense>
	);
}
