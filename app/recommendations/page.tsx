"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import getMoviesGenres from "@/dataFetchings/getMoviesGenres";
import discoverMovies from "@/dataFetchings/discoverMovies";
import getRecommendations from "@/dataFetchings/getRecommendations";
import { decorateLink } from "@/utils";
import MovieCard from "@/components/cards/MovieCard";
import PageTitle from "@/components/ui/PageTitle";
import { fadeIn, staggerContainer } from "@/lib/animations";

import { movieDetails, genresType } from "@/constants/typescript";

export default function RecommendationsPage() {
	const [genres, setGenres] = useState<genresType[]>([]);
	const [selectedGenre, setSelectedGenre] = useState<genresType | null>(null);
	const [moviesInGenre, setMoviesInGenre] = useState<movieDetails[]>([]);
	const [selectedMovie, setSelectedMovie] = useState<movieDetails | null>(null);
	const [recommendations, setRecommendations] = useState<movieDetails[]>([]);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState(1);

	useEffect(() => {
		const fetchGenres = async () => {
			const data = await getMoviesGenres();
			setGenres(data.data || []);
		};
		fetchGenres();
	}, []);

	const handleGenreSelect = async (genre: genresType) => {
		setSelectedGenre(genre);
		setLoading(true);
		setStep(2);
		const data = await discoverMovies({ genre: genre.id, page: 1 });
		setMoviesInGenre(data.data || []);
		setLoading(false);
	};

	const handleMovieSelect = async (movie: movieDetails) => {
		if (!movie.id) return;
		setSelectedMovie(movie);
		setLoading(true);
		setStep(3);
		const data = await getRecommendations(movie.id);
		setRecommendations(data.data || []);
		setLoading(false);
	};

	const reset = () => {
		setSelectedGenre(null);
		setSelectedMovie(null);
		setRecommendations([]);
		setStep(1);
	};

	const steps = [
		{ id: 1, title: "Pick a Genre" },
		{ id: 2, title: "Choose a Movie" },
		{ id: 3, title: "Recommendations" },
	];

	return (
		<div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
			<PageTitle title="Movie Recommendations" />

			{/* Progress Indicator */}
			<div className="flex items-center justify-center mb-12 gap-2 md:gap-4 overflow-x-auto py-2">
				{steps.map((s, idx) => (
					<React.Fragment key={s.id}>
						<div
							className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border transition-all ${
								step === s.id
									? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
									: step > s.id
									? "bg-indigo-900/30 border-indigo-500/50 text-indigo-300"
									: "bg-gray-900/50 border-gray-800 text-gray-500"
							}`}
						>
							<span
								className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
									step >= s.id ? "bg-white text-indigo-600" : "bg-gray-800 text-gray-500"
								}`}
							>
								{s.id}
							</span>
							<span className="text-sm font-medium">{s.title}</span>
						</div>
						{idx < steps.length - 1 && (
							<div
								className={`hidden md:block w-8 h-[2px] ${
									step > s.id ? "bg-indigo-500" : "bg-gray-800"
								}`}
							/>
						)}
					</React.Fragment>
				))}
			</div>

			<AnimatePresence mode="wait">
				{step === 1 && (
					<motion.div
						key="step1"
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						exit={{ opacity: 0, y: -20 }}
						className="flex flex-col items-center"
					>
						<h2 className="text-2xl font-semibold mb-8 text-gray-200">
							What kind of mood are you in?
						</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
							{genres.map((genre) => (
								<motion.button
									variants={fadeIn}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									key={genre.id}
									onClick={() => handleGenreSelect(genre)}
									className="group relative overflow-hidden px-4 py-6 bg-gray-900/60 border border-gray-800 hover:border-indigo-500 rounded-2xl transition-all text-center"
								>
									<div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<span className="relative text-lg font-medium text-gray-300 group-hover:text-white transition-colors">
										{genre.name}
									</span>
								</motion.button>
							))}
						</div>
					</motion.div>
				)}

				{step === 2 && (
					<motion.div
						key="step2"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						className="flex flex-col items-center"
					>
						<div className="flex flex-col md:flex-row justify-between items-center w-full mb-8 gap-4">
							<h2 className="text-2xl font-semibold text-gray-200">
								Pick a movie you liked in{" "}
								<span className="text-indigo-400 font-bold">{selectedGenre?.name}</span>
							</h2>
							<button
								onClick={() => setStep(1)}
								className="text-gray-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all text-sm"
							>
								← Back to genres
							</button>
						</div>

						{loading ? (
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
								{[...Array(8)].map((_, i) => (
									<div key={i} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-xl" />
								))}
							</div>
						) : (
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 w-full">
								{moviesInGenre.map((movie) => (
									<div
										key={movie.id}
										className="cursor-pointer transition-transform duration-300 flex flex-col gap-2"
									>
										<MovieCard
											imgSrc={movie.poster_path}
											title={movie.title || ""}
											movieId={movie.id}
											showType="movie"
											onClick={() => handleMovieSelect(movie)}
										/>
										<p className="text-sm font-medium text-center text-gray-300 truncate px-2">
											{movie.title}
										</p>
									</div>
								))}
							</div>
						)}
					</motion.div>
				)}

				{step === 3 && (
					<motion.div
						key="step3"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1.05 }}
						className="flex flex-col items-center"
					>
						<div className="text-center mb-12">
							<h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
								Because you liked{" "}
								<span className="text-indigo-400">{selectedMovie?.title}</span>
							</h2>
							<p className="text-gray-400 text-lg">
								We found these movies we think you'll love:
							</p>
						</div>

						{loading ? (
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-xl" />
								))}
							</div>
						) : (
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 w-full">
								{recommendations.length > 0 ? (
									recommendations.map((movie) => (
										<div key={movie.id} className="flex flex-col gap-2">
											<MovieCard
												imgSrc={movie.poster_path}
												title={movie.title}
												movieId={movie.id}
												showType="movie"
											/>
											<div className="flex flex-col items-center">
												<p className="text-sm font-medium text-center text-gray-200 truncate w-full px-2">
													{movie.title}
												</p>
												<div className="flex gap-2 mt-1">
													<span className="text-orange-500 text-xs font-bold">
														★ {movie.vote_average?.toFixed(1)}
													</span>
													<span className="text-gray-500 text-xs">
														{movie.release_date?.split("-")[0]}
													</span>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="col-span-full py-20 text-center">
										<p className="text-xl text-gray-500">
											No direct recommendations found for this movie.
										</p>
										<button
											onClick={reset}
											className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all"
										>
											Try another movie
										</button>
									</div>
								)}
							</div>
						)}

						<div className="flex flex-wrap justify-center gap-4 mt-16 w-full max-w-md">
							<button
								onClick={() => setStep(2)}
								className="flex-1 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-2xl transition-all font-semibold"
							>
								Back to Movies
							</button>
							<button
								onClick={reset}
								className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all font-semibold shadow-lg shadow-indigo-600/20"
							>
								Start Over
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
