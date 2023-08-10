import { options } from "@/constants/api";
import React, { ReactElement, useEffect, useState } from "react";
import MovieImageCard from "@/components/cards/MovieImageCard";
interface props {
	movieId: string | number;
	title: string;
}

const MovieImages: React.FC<props> = ({ movieId, title }): ReactElement => {
	const [movieImageData, setImagesData] = useState([]);

	async function getMovieImages(movieId: string | number) {
		fetch(`https://api.themoviedb.org/3/movie/${movieId}/images`, options)
			.then((response) => response.json())
			.then((response) => setImagesData(response?.backdrops))
			.catch((err) => console.error(err));
	}

	console.log(movieImageData);

	useEffect(() => {
		getMovieImages(movieId);
	}, [movieId]);
	return (
		<div className="p-1">
			<h2 className="py-1 text-2xl uppercase">Images</h2>
			<div
				className="flex gap-3 overflow-x-auto"
				style={{ width: "100%", overflowX: "scroll" }}
			>
				{movieImageData.map(({ file_path }, index) => (
					<MovieImageCard imgSrc={file_path} key={index} title={title} />
				))}
			</div>
		</div>
	);
};

export default MovieImages;
