"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import discoverMovies from "@/dataFetchings/discoverMovies";
import discoverTV from "@/dataFetchings/discoverTV";
import getMovieDetails from "@/dataFetchings/getMovieDetails";
import getTvSeriesDetails from "@/dataFetchings/getTVSeriesDetails";
import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { decorateLink } from "@/utils";
import {
	FiChevronLeft,
	FiRotateCcw,
	FiBookmark,
	FiFilter,
	FiCalendar,
	FiArrowUp,
	FiArrowDown,
} from "react-icons/fi";

const MOODS = [
	{
		id: "action-adventure",
		name: "Action & Adventure",
		genres: [28, 12, 10759],
	},
	{ id: "animation", name: "Animation", genres: [16] },
	{ id: "comedy", name: "Comedy", genres: [35] },
	{ id: "crime", name: "Crime", genres: [80] },
	{ id: "documentary", name: "Documentary", genres: [99] },
	{ id: "drama", name: "Drama", genres: [18] },
	{ id: "family", name: "Family", genres: [10751] },
	{ id: "fantasy-scifi", name: "Fantasy & Sci-Fi", genres: [14, 878, 10765] },
	{ id: "horror", name: "Horror", genres: [27] },
	{ id: "mystery-thriller", name: "Mystery & Thriller", genres: [9648, 53] },
	{ id: "romance", name: "Romance", genres: [10749, 10766] },
	{ id: "western", name: "Western", genres: [37] },
];

const MOOD_DATA: Record<string, string[]> = {
	"action-adventure": [
		"/aSmAmNAK2VYfb0rYlleYJ10s3CC.jpg",
		"/6EiRUJTLGE7mXz9G9p9pX0S0f5Y.jpg",
		"/v9p9pX0S0f5Y.jpg",
	],
	animation: [
		"/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg",
		"/aSmAmNAK2VYfb0rYlleYJ10s3CC.jpg",
		"/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
	],
	comedy: [
		"/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg",
		"/xjtWQ2CL1mpmMNwuU5HeS4Iuwuu.jpg",
		"/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
	],
	crime: [
		"/72AoFPC5TY4DfJwXXS9rPwPeReD.jpg",
		"/jjyuk0edLiW8vOSnlfwWCCLpbh5.jpg",
		"/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg",
	],
	documentary: [
		"/82bX2GK4PhaJQtfkTnfmd2P7erG.jpg",
		"/kSzcpfbTy2pXHGvrVU2WhQTo6oU.jpg",
		"/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg",
	],
	drama: [
		"/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg",
		"/kSzcpfbTy2pXHGvrVU2WhQTo6oU.jpg",
		"/82bX2GK4PhaJQtfkTnfmd2P7erG.jpg",
	],
	family: [
		"/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg",
		"/9Unz4SnlkXg0OAxgiLKZAfu096c.jpg",
		"/vTQIqlxUkOuyf2UKhlM2OUaFGKz.jpg",
	],
	"fantasy-scifi": [
		"/72AoFPC5TY4DfJwXXS9rPwPeReD.jpg",
		"/jjyuk0edLiW8vOSnlfwWCCLpbh5.jpg",
		"/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg",
	],
	horror: [
		"/72AoFPC5TY4DfJwXXS9rPwPeReD.jpg",
		"/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg",
		"/jjyuk0edLiW8vOSnlfwWCCLpbh5.jpg",
	],
	"mystery-thriller": [
		"/72AoFPC5TY4DfJwXXS9rPwPeReD.jpg",
		"/jjyuk0edLiW8vOSnlfwWCCLpbh5.jpg",
		"/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg",
	],
	romance: [
		"/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg",
		"/9Unz4SnlkXg0OAxgiLKZAfu096c.jpg",
		"/vTQIqlxUkOuyf2UKhlM2OUaFGKz.jpg",
	],
	western: [
		"/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg",
		"/72AoFPC5TY4DfJwXXS9rPwPeReD.jpg",
		"/jjyuk0edLiW8vOSnlfwWCCLpbh5.jpg",
	],
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

export default function RecommendationsPage() {
	const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
	const [selectedYear, setSelectedYear] = useState("");
	const [selectedSort, setSelectedSort] = useState("popularity.desc");
	const [discoveryPool, setDiscoveryPool] = useState<any[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentDetails, setCurrentDetails] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState(0); // 0: Start, 1: Moods, 2: Filters, 3: Recommendation

	const toggleMood = (id: string) => {
		setSelectedMoods((prev) =>
			prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
		);
	};

	const startDiscovery = async () => {
		setLoading(true);
		setStep(3);

		const genreIds =
			selectedMoods.length > 0
				? MOODS.filter((m) => selectedMoods.includes(m.id))
						.flatMap((m) => m.genres)
						.join("|")
				: undefined;

		const [movieRes, tvRes] = await Promise.all([
			discoverMovies({
				genre: genreIds,
				page: 1,
				sort_by: selectedSort,
				year_gte: selectedYear,
			}),
			discoverTV({
				genre: genreIds,
				page: 1,
				sort_by: selectedSort,
				year_gte: selectedYear,
			}),
		]);

		const combinedPool = [
			...(movieRes.data || []).map((m: any) => ({ ...m, type: "movie" })),
			...(tvRes.data || []).map((t: any) => ({ ...t, type: "tv" })),
		]
			.filter((item) => item.poster_path || item.backdrop_path)
			.sort(() => Math.random() - 0.5);

		setDiscoveryPool(combinedPool.slice(0, 10));
		setCurrentIndex(0);
		await fetchCurrentDetails(combinedPool[0]);
		setLoading(false);
	};

	const fetchCurrentDetails = async (item: any) => {
		if (!item) return;
		setLoading(true);
		try {
			const details =
				item.type === "movie"
					? await getMovieDetails(item.id)
					: await getTvSeriesDetails(item.id);
			setCurrentDetails(details);
		} catch (error) {
			console.error("Error fetching details:", error);
		}
		setLoading(false);
	};

	const nextRecommendation = async () => {
		const nextIdx = currentIndex + 1;
		if (nextIdx < discoveryPool.length) {
			setCurrentIndex(nextIdx);
			await fetchCurrentDetails(discoveryPool[nextIdx]);
		} else {
			setCurrentIndex(0);
			await fetchCurrentDetails(discoveryPool[0]);
		}
	};

	const reset = () => {
		setSelectedMoods([]);
		setSelectedYear("");
		setSelectedSort("popularity.desc");
		setDiscoveryPool([]);
		setCurrentIndex(0);
		setCurrentDetails(null);
		setStep(1);
	};

	const formatRuntime = (minutes: number) => {
		if (!minutes) return "N/A";
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		return h > 0 ? `${h}h ${m}m` : `${m}m`;
	};

	return (
		<div className="min-h-screen bg-[#0F0F0F] text-white max-w-2xl mx-auto overflow-x-hidden">
			<div className="fixed inset-0 bg-[#0F0F0F] -z-50" />

			<AnimatePresence mode="wait">
				{step === 0 && (
					<motion.div
						key="start"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex flex-col items-center justify-center min-h-[70vh] text-center relative px-4 md:px-8">
						<div className="relative w-full aspect-square max-w-sm mb-12 flex items-center justify-center">
							<div className="absolute w-[45%] aspect-[2/3] bg-[#1A1A1A] rounded-xl shadow-2xl rotate-[-15deg] -translate-x-16 translate-y-4 overflow-hidden border border-white/5 z-0">
								<Image
									unoptimized
									src={getImageBaseLink({
										path: "/72AoFPC5TY4DfJwXXS9rPwPeReD.jpg",
										type: "poster",
										quality: "lg",
									})}
									alt="poster"
									fill
									className="object-cover opacity-40"
								/>
							</div>
							<div className="absolute w-[45%] aspect-[2/3] bg-[#1A1A1A] rounded-xl shadow-2xl rotate-[15deg] translate-x-16 translate-y-4 overflow-hidden border border-white/5 z-0">
								<Image
									unoptimized
									src={getImageBaseLink({
										path: "/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg",
										type: "poster",
										quality: "lg",
									})}
									alt="poster"
									fill
									className="object-cover opacity-40"
								/>
							</div>
							<div className="absolute w-[55%] aspect-[2/3] bg-[#1A1A1A] rounded-2xl shadow-2xl z-10 overflow-hidden border border-white/10 scale-110">
								<Image
									unoptimized
									src={getImageBaseLink({
										path: "/aSmAmNAK2VYfb0rYlleYJ10s3CC.jpg",
										type: "poster",
										quality: "lg",
									})}
									alt="poster"
									fill
									className="object-cover"
								/>
							</div>
						</div>

						<h1 className="text-4xl font-bold mb-6 uppercase bebas_nueve tracking-wider">
							Find your great match
						</h1>
						<p className="text-gray-400 text-lg max-w-xs mx-auto mb-10">
							Rate a few movies, tell us your vibe — we'll do the rest
						</p>

						<div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/90 to-transparent backdrop-blur-md z-50">
							<button
								onClick={() => setStep(1)}
								className="w-full max-w-lg mx-auto block py-5 bg-[#EAEAEA] text-black rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl uppercase tracking-widest">
								Start matching
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
						<div className="flex justify-between items-center mb-8">
							<button
								onClick={() => setStep(0)}
								className="text-gray-400 hover:text-white transition-colors">
								✕
							</button>
							<span className="text-sm font-medium uppercase tracking-widest text-gray-500">
								Step 1 of 2
							</span>
							<span className="text-gray-400 text-xs font-mono font-bold">
								{selectedMoods.length} Selected
							</span>
						</div>

						<h1 className="text-3xl font-bold text-center mb-12 max-w-xs mx-auto uppercase bebas_nueve">
							What mood are you looking for?
						</h1>

						<div className="grid grid-cols-2 gap-x-6 gap-y-12 w-full mb-32 px-2">
							{MOODS.map((mood) => {
								const isSelected = selectedMoods.includes(mood.id);
								const posters = MOOD_DATA[mood.id] || [];
								return (
									<div key={mood.id} className="flex flex-col gap-4 group">
										<button
											onClick={() => toggleMood(mood.id)}
											className={`relative aspect-[3/4] rounded-2xl transition-all duration-300 ${
												isSelected
													? "ring-2 ring-white ring-offset-4 ring-offset-[#0F0F0F]"
													: ""
											}`}>
											<div className="absolute inset-0 flex items-center justify-center">
												{posters.map((path, idx) => (
													<div
														key={idx}
														className="absolute w-[70%] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl transition-all duration-500"
														style={{
															transform: `translateX(${(idx - 1) * 20}px) rotate(${(idx - 1) * 8}deg) scale(${1 - Math.abs(idx - 1) * 0.1})`,
															zIndex: 10 - Math.abs(idx - 1),
															filter: isSelected
																? "none"
																: "grayscale(0.6) contrast(0.8) opacity(0.7)",
															marginTop: `${Math.abs(idx - 1) * 10}px`,
														}}>
														<Image
															unoptimized
															src={getImageBaseLink({
																path,
																type: "poster",
																quality: "md",
															})}
															alt=""
															fill
															className="object-cover"
														/>
													</div>
												))}
											</div>
											{isSelected && (
												<div className="absolute -top-2 -right-2 z-30 bg-white text-black rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-[#0F0F0F]">
													<span className="text-xs font-bold">✓</span>
												</div>
											)}
										</button>
										<span
											className={`text-center text-sm font-bold uppercase tracking-widest transition-colors ${isSelected ? "text-white" : "text-gray-500"}`}>
											{mood.name}
										</span>
									</div>
								);
							})}
						</div>

						<div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/90 to-transparent backdrop-blur-md z-50">
							<button
								onClick={() => setStep(2)}
								className="w-full max-w-lg mx-auto block py-5 bg-[#EAEAEA] text-black rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl uppercase tracking-widest">
								{selectedMoods.length > 0
									? `Continue with ${selectedMoods.length}`
									: "I'm open to anything"}
							</button>
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
						<div className="flex justify-between items-center mb-8">
							<button
								onClick={() => setStep(1)}
								className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
								<FiChevronLeft /> Back
							</button>
							<span className="text-sm font-medium uppercase tracking-widest text-gray-500">
								Step 2 of 2
							</span>
							<span className="text-gray-400 text-xs font-mono font-bold">
								Refine
							</span>
						</div>

						<h1 className="text-3xl font-bold text-center mb-12 max-w-xs mx-auto uppercase bebas_nueve">
							Fine-tune your results
						</h1>

						<div className="space-y-10 mb-32">
							{/* Era Selection */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
									<FiCalendar /> Release Era
								</div>
								<div className="flex flex-wrap gap-3">
									{YEARS.map((y) => (
										<button
											key={y.label}
											onClick={() => setSelectedYear(y.value)}
											className={`px-6 py-3 rounded-full border-2 transition-all font-bold text-sm ${
												selectedYear === y.value
													? "bg-white text-black border-white"
													: "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600"
											}`}>
											{y.label}
										</button>
									))}
								</div>
							</div>

							{/* Sort Selection */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
									<FiFilter /> Sort By
								</div>
								<div className="grid grid-cols-1 gap-3">
									{SORT_OPTIONS.map((s) => (
										<button
											key={s.value}
											onClick={() => setSelectedSort(s.value)}
											className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between font-bold ${
												selectedSort === s.value
													? "bg-indigo-600/20 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
													: "bg-gray-900/50 text-gray-500 border-gray-800 hover:border-gray-700"
											}`}>
											<span className="flex items-center gap-3">
												{s.icon}
												{s.label}
											</span>
											{selectedSort === s.value && (
												<div className="w-2 h-2 rounded-full bg-indigo-500" />
											)}
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/90 to-transparent backdrop-blur-md z-50">
							<button
								onClick={startDiscovery}
								className="w-full max-w-lg mx-auto block py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all shadow-xl uppercase tracking-widest">
								Find Recommendations
							</button>
						</div>
					</motion.div>
				)}

				{step === 3 && (
					<motion.div
						key="recommendation"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-[#0F0F0F] overflow-hidden">
						{currentDetails ? (
							<div className="relative w-full h-full flex flex-col">
								<div className="absolute inset-0 z-0">
									<Image
										unoptimized
										src={getImageBaseLink({
											path:
												currentDetails.poster_path ||
												currentDetails.backdrop_path,
											type: currentDetails.poster_path ? "poster" : "backdrop",
											quality: "lg",
										})}
										alt="Poster"
										fill
										className="object-cover"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-transparent" />
								</div>

								<div className="relative z-10 p-6 flex justify-between items-center pt-12">
									<button
										onClick={reset}
										className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-2 text-white border border-white/10 text-sm font-bold">
										<FiChevronLeft size={20} />
										Back
									</button>
									<span className="text-sm font-bold text-white/80 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
										{currentIndex + 1} of {discoveryPool.length}
									</span>
								</div>

								<div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-48">
									<div className="space-y-4 max-w-md">
										<h2 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow-2xl uppercase bebas_nueve tracking-wider">
											{currentDetails.title || currentDetails.name}
										</h2>

										<div className="flex items-center gap-4 text-gray-200 font-semibold drop-shadow-md">
											<span>
												{
													(
														currentDetails.release_date ||
														currentDetails.first_air_date
													)?.split("-")[0]
												}
											</span>
											<span>•</span>
											<span>
												{discoveryPool[currentIndex].type === "movie"
													? formatRuntime(currentDetails.runtime)
													: `${currentDetails.number_of_seasons} Seasons`}
											</span>
										</div>

										<p className="text-gray-100 text-sm leading-relaxed line-clamp-3 drop-shadow-md font-medium">
											{currentDetails.overview}
										</p>

										<div className="flex flex-wrap gap-4 pt-4">
											<div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
												<span className="bg-[#F5C518] text-black text-[10px] font-black px-1.5 py-0.5 rounded-sm">
													IMDb
												</span>
												<div className="flex flex-col">
													<span className="text-sm font-bold leading-none">
														{currentDetails.vote_average?.toFixed(1)}/10
													</span>
													<span className="text-[10px] text-gray-400 font-medium">
														({currentDetails.vote_count?.toLocaleString()}{" "}
														votes)
													</span>
												</div>
											</div>
											<div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
												<span className="text-indigo-400 text-[10px] font-black uppercase">
													Popularity
												</span>
												<span className="text-sm font-bold">
													{Math.round(currentDetails.popularity || 0)}
												</span>
											</div>
										</div>
									</div>
								</div>

								<div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/95 to-transparent backdrop-blur-md z-50">
									<div className="max-w-lg mx-auto flex flex-col gap-4">
										<div className="flex gap-4">
											<button
												onClick={nextRecommendation}
												className="flex-1 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/20 text-white">
												<FiRotateCcw size={20} />
												Rematch
											</button>
											<button className="flex-1 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/20 text-white">
												<FiBookmark size={20} />
												Save
											</button>
										</div>
										<Link
											prefetch={false}
											href={`/${discoveryPool[currentIndex].type}/${decorateLink(currentDetails.title || currentDetails.name)}/${currentDetails.id}`}
											className="block w-full py-5 bg-white text-black text-center font-bold rounded-2xl hover:bg-gray-200 transition-all shadow-2xl uppercase tracking-widest font-black">
											Watch Details
										</Link>
									</div>
								</div>
							</div>
						) : (
							<div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
								<div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
