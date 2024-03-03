import { AiTwotoneStar } from "react-icons/ai";
import MovieCardImage from "../cards/MovieImageCard";
import { movieDetails } from "@/constants/typescript";
import { ReactElement } from "react";
import Link from "next/link";
import { decorateLink } from "@/utils";

import styles from "@/styles/Movie_Container.module.css";
import Image from "next/image";
import { getImageBaseLink } from "@/constants";

interface props {
	data: Array<movieDetails>;
	title: string;
}

const MoviesContainer: React.FC<props> = ({ data, title }): ReactElement => {
	// @ts-ignore
	return Array.isArray(data) && data?.length > 0 ? (
		<div className="flex flex-col gap-1">
			<h2 className="py-1 text-2xl uppercase">{title}</h2>
			<div
				className={`flex gap-x-3 gap-y-6 justify-start  flex-wrap ${styles?.container}`}
			>
				{data?.map((movieItem, index) => {
					if (!movieItem?.poster_path || !movieItem?.backdrop_path) return null;
					return (
						<Link
							key={index}
							href={`/${movieItem?.media_type}/${decorateLink(
								movieItem?.original_title
							)}/${movieItem?.id}`}
							className={`${styles?.movieCardWrapper}`}
						>
							<div className={`flex flex-col gap-1`}>
								<Image
									unoptimized
									src={getImageBaseLink({
										path: movieItem?.poster_path,
										type: "backdrop",
										quality: "lg",
									})}
									width={250}
									height={150}
									alt={`${title} image`}
								/>

								<div className="flex justify-between text-xs">
									<p className="text-orange-500 flex gap-1 items-center">
										<AiTwotoneStar />
										{movieItem?.vote_average?.toFixed(1)} / 10
									</p>
									{movieItem?.release_date ? (
										<p className="text-gray-500">
											{movieItem?.release_date?.split("-")[0]}
										</p>
									) : null}
								</div>
								<h3>{movieItem?.title}</h3>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	) : null;
};

export default MoviesContainer;
