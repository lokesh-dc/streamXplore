import { AiTwotoneStar } from "react-icons/ai";
import Tags from "@/components/tags";

import { genresType, movieDetailsPage } from "@/constants/typescript";
import React, { ReactElement } from "react";
import Image from "next/image";
import { getImageBaseLink } from "@/constants";

interface props {
	poster_path: string;
	title: string;
	release_date: string;
	runtime: number;
	overview: string;
	vote_average: number;
	tagline: string;
	genres: Array<genresType>;
}

const IntroSection: React.FC<props> = ({
	poster_path,
	title,
	release_date,
	runtime,
	overview,
	vote_average,
	tagline,
	genres,
}): ReactElement => {
	return (
		<div className="p-1 md:p-3 flex md:gap-2 w-screen md:w-4/6 m-auto items-center mt-2">
			<div className="w-2/5 hidden md:block">
				<Image
					priority
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
				<div>
					<p className="flex gap-1 items-center text-orange-500">
						<AiTwotoneStar />
						{vote_average} / 10
					</p>
					<h1 className="text-5xl bebas_nueve ">{title}</h1>
				</div>
				<h3 className="oswald">{tagline}</h3>
				<div className="flex items-center text-zinc-500	">
					<p className="pr-2">{release_date.split("-")[0]}</p>
					<p>|</p>
					<p className="pl-2">{runtime} minutes</p>
				</div>
				<p className=" text-gray-600">{overview}</p>
				<Tags data={genres} />
			</div>
		</div>
	);
};

export default IntroSection;
