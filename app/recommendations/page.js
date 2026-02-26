"use client";

import React, { useState, useEffect } from "react";
import getMoviesGenres from "@/dataFetchings/getMoviesGenres";
import discoverMovies from "@/dataFetchings/discoverMovies";
import getRecommendations from "@/dataFetchings/getRecommendations";
import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { decorateLink } from "@/utils";

export default function RecommendationsPage() {
	const [genres, setGenres] = useState([]);
	const [selectedGenre, setSelectedGenre] = useState(null);
	const [moviesInGenre, setMoviesInGenre] = useState([]);
	const [selectedMovie, setSelectedMovie] = useState(null);
	const [recommendations, setRecommendations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState(1);

	useEffect(() => {
		const fetchGenres = async () => {
			const data = await getMoviesGenres();
			setGenres(data.data || []);
		};
		fetchGenres();
	}, []);

	const handleGenreSelect = async (genre) => {
		setSelectedGenre(genre);
		setLoading(true);
		const data = await discoverMovies({ genre: genre.id, page: 1 });
		setMoviesInGenre(data.data || []);
		setLoading(false);
		setStep(2);
	};

	const handleMovieSelect = async (movie) => {
		setSelectedMovie(movie);
		setLoading(true);
		const data = await getRecommendations(movie.id);
		setRecommendations(data.data?.slice(0, 3) || []);
		setLoading(false);
		setStep(3);
	};

	const reset = () => {
		setSelectedGenre(null);
		setSelectedMovie(null);
		setRecommendations([]);
		setStep(1);
	};

	return (
		<div
			style={{
				paddingTop: "140px",
			}}
			className="min-h-screen flex flex-col items-center justify-center"
		>
			<h1 className="text-4xl font-bold mb-8 text-center">
				Movie Recommendations
			</h1>

			{step === 1 && (
				<div className="flex flex-col items-center">
					<h2 className="text-2xl mb-6">Step 1: Select a Genre</h2>
					<div className="flex flex-wrap justify-center gap-4">
						{genres.map((genre) => (
							<button
								key={genre.id}
								onClick={() => handleGenreSelect(genre)}
								className="px-6 py-3 bg-gray-800 hover:bg-indigo-600 rounded-full transition-colors text-lg"
							>
								{genre.name}
							</button>
						))}
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="flex flex-col items-center">
					<h2 className="text-2xl mb-6">
						Step 2: Pick a movie you liked in{" "}
						<span className="text-indigo-400">{selectedGenre.name}</span>
					</h2>
					{loading ? (
						<p>Loading movies...</p>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
							{moviesInGenre.map((movie) => (
								<div
									key={movie.id}
									onClick={() => handleMovieSelect(movie)}
									className="cursor-pointer group relative"
									style={{ border: "1px solid red" }}
								>
									{/* <div className="aspect-[2/3] overflow-hidden rounded-lg border-2 border-transparent group-hover:border-indigo-500 transition-all">
										<Image
											unoptimized
											src={getImageBaseLink({
												path: movie.poster_path,
												type: "poster",
												quality: "md",
											})}
											alt={movie.title}
											width={200}
											height={300}
											className="object-cover w-full h-full group-hover:scale-105 transition-transform"
										/>
									</div> */}
									<p className="mt-2 text-sm text-center truncate">
										{movie.title}
									</p>
								</div>
							))}
						</div>
					)}
					<button
						onClick={() => setStep(1)}
						className="mt-8 text-indigo-400 hover:underline"
					>
						Go back to genres
					</button>
				</div>
			)}

			{step === 3 && (
				<div className="flex flex-col items-center text-center">
					<h2 className="text-2xl mb-4">
						Because you liked{" "}
						<span className="text-indigo-400">{selectedMovie.title}</span>:
					</h2>
					<p className="mb-8 text-gray-400">
						We recommend these {recommendations.length} movies for you:
					</p>

					{loading ? (
						<p>Finding recommendations...</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
							{recommendations.length > 0 ? (
								recommendations.map((movie) => (
									<Link
										key={movie.id}
										href={`/movie/${decorateLink(movie.title)}/${movie.id}`}
										className="flex flex-col items-center bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-colors"
									>
										<div className="w-full aspect-[16/9] relative">
											<Image
												unoptimized
												src={getImageBaseLink({
													path: movie.backdrop_path || movie.poster_path,
													type: "backdrop",
													quality: "md",
												})}
												alt={movie.title}
												fill
												className="object-cover"
											/>
										</div>
										<div className="p-4">
											<h3 className="text-xl font-semibold mb-2">
												{movie.title}
											</h3>
											<p className="text-sm text-gray-400 line-clamp-3">
												{movie.overview}
											</p>
										</div>
									</Link>
								))
							) : (
								<p className="col-span-3">
									No recommendations found for this movie.
								</p>
							)}
						</div>
					)}

					<div className="flex gap-4 mt-12">
						<button
							onClick={() => setStep(2)}
							className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-lg font-bold"
						>
							Back to Movies
						</button>
						<button
							onClick={reset}
							className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors text-lg font-bold"
						>
							Start Over
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
