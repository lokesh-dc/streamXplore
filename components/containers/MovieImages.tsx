import { options } from "@/constants/api";
import React, { ReactElement, useEffect, useState } from "react";
import MovieContainer from "./SwiperMovieContainer";

interface props {
	movieId: string | number;
}

const MovieImages: React.FC<props> = ({ movieId }): ReactElement => {
	const [movieImageData, setImagesData] = useState([]);

	async function getMovieImages(movieId: string | number) {
		fetch(`https://api.themoviedb.org/3/movie/${movieId}/images`, options)
			.then((response) => response.json())
			.then((response) => setImagesData(response?.posters))
			.catch((err) => console.error(err));
	}

	useEffect(() => {
		getMovieImages(movieId);
	}, [movieId]);
	return <MovieContainer data={movieImageData} showType={""} title="POSTERS" />;
};

export default MovieImages;
