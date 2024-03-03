import { AiTwotoneStar } from "react-icons/ai";
import Tags from "@/components/tags";

import { genresType } from "@/constants/typescript";
import React, { ReactElement } from "react";
import Image from "next/image";
import { getImageBaseLink } from "@/constants";
import ShareIntentComponent from "@/components/functional-components/ShareIntentComponent";

interface props {
	poster_path: string;
	title: string;
	release_date: string;
	runtime?: number | undefined;
	overview: string;
	vote_average: number;
	tagline: string;
	genres: Array<genresType>;
	pageType: string;
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
	pageType = "movies",
}): ReactElement => {
	return (
		<div className="flex md:gap-8 my-3 items-center">
			<div className="hidden md:block w-auto">
				<Image
					unoptimized
					priority
					src={getImageBaseLink({
						type: "poster",
						quality: "xl",
						path: poster_path,
					})}
					height={350}
					width={250}
					alt={`${title}`}
				/>
			</div>
			<div className="flex flex-col gap-2 w-full md:w-2/3">
				<div>
					<p className="flex gap-1 items-center text-orange-500">
						<AiTwotoneStar />
						{Math.floor(vote_average)} / 10
					</p>
					<h1 className="text-5xl bebas_nueve">{title}</h1>
				</div>
				<h3 className="oswald">{tagline}</h3>
				<div className="flex gap-3">
					<div className="flex items-center text-zinc-500	">
						<p className="pr-2">{release_date?.split("-")[0]}</p>
						<p>|</p>
						{runtime ? <p className="pl-2">{runtime} minutes</p> : null}
					</div>
					<ShareIntentComponent text={title} />
				</div>
				<p className=" text-gray-600 text-justify ">{overview}</p>
				<Tags pageType={pageType} data={genres} title={"Genres"} />
			</div>
		</div>
	);
};

export default IntroSection;
