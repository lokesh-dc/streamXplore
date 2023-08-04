import React, { ReactElement } from "react";
import getMovieDetails from "@/data/getMovieDetails";
import { genresType, production_companies } from "@/constants/typescript";
import Image from "next/image";
import { getImageBaseLink } from "@/constants";
import HeroSection from "@/components/ui/detail/HeroSection";
import { AiTwotoneStar } from "react-icons/ai";
import Tags from "@/components/tags";

interface props {
	adult: boolean;
	backdrop_path: string;
	poster_path: string;
	budget: number;
	genres: Array<genresType>;
	homepage: string;
	imdb_id: number;
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	production_companies: Array<production_companies>;
	production_countries: Array<genresType>;
	release_date: string;
	revenue: number;
	runtime: string;
	status: string;
	tagline: string;
	title: string;
	vote_average: number;
	vote_count: number;
	details: any;
}

const Movie: React.FC<props> = ({
	adult,
	backdrop_path,
	poster_path,
	budget,
	genres,
	homepage,
	imdb_id,
	original_language,
	original_title,
	overview,
	popularity,
	production_companies,
	production_countries,
	release_date,
	revenue,
	runtime,
	tagline,
	title,
	vote_average,
	vote_count,
	details,
}) => {
	return (
		<div>
			<HeroSection backdrop_path={backdrop_path} title={title} />
			<div className="p-1 md:p-3 flex md:gap-2 w-screen md:w-4/6 m-auto items-center">
				<div className="w-2/5 hidden md:block">
					<Image
						priority
						className=""
						src={getImageBaseLink({
							type: "poster",
							quality: "xl",
							path: poster_path,
						})}
						height={400}
						width={300}
						alt={`${title}`}
					/>
				</div>
				<div className="w-screen md:w-3/5 flex flex-col gap-2">
					<p className="flex gap-1 items-center text-orange-500">
						<AiTwotoneStar />
						{vote_average} / 10
					</p>
					<h1 className="text-5xl bebas_nueve ">{title}</h1>
					<div className="flex items-center text-zinc-500	">
						<p className="pr-2">{release_date.split("-")[0]}</p>
						<p>|</p>
						<p className="pl-2">{runtime} minutes</p>
					</div>
					<h3 className="oswald">{tagline}</h3>
					<p className=" text-gray-600">{overview}</p>
					<Tags data={genres} />
				</div>
			</div>
		</div>
	);
};
export default Movie;

export async function getServerSideProps(context: any) {
	const { id } = context.query;
	const details = await getMovieDetails(id);
	const {
		adult,
		backdrop_path,
		poster_path,
		budget,
		genres,
		homepage,
		imdb_id,
		original_language,
		original_title,
		overview,
		popularity,
		production_companies,
		production_countries,
		release_date,
		revenue,
		runtime,
		tagline,
		title,
		vote_average,
		vote_count,
	} = details;

	return {
		props: {
			adult,
			backdrop_path,
			poster_path,
			budget,
			genres,
			homepage,
			imdb_id,
			original_language,
			original_title,
			overview,
			popularity,
			production_companies,
			production_countries,
			release_date,
			revenue,
			runtime,
			tagline,
			title,
			vote_average,
			vote_count,
			details,
		},
	};
}
