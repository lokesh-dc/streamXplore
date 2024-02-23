import { getImageBaseLink } from "@/constants";
import { searchedDataEntry } from "@/constants/typescript";
import Image from "next/image";
import React, { ReactElement } from "react";

import { IoMdClose, IoIosArrowDown } from "react-icons/io";
import { AiTwotoneStar } from "react-icons/ai";

import Link from "next/link";
import { decorateLink } from "@/utils";

interface props {
	toggleModalVisibility: Function;
	handleQueryChange: Function;
	resultData: Array<searchedDataEntry>;
}

const SearchModal: React.FC<props> = ({
	toggleModalVisibility,
	handleQueryChange,
	resultData = [],
}): ReactElement => {
	return (
		<div
			className="fixed top-0 left-0 z-[2055] h-screen w-screen bg-black/90 flex flex-col items-center flex-start gap-2 fadein"
			style={{
				padding: "100px 10px",
				overflowY: "hidden",
				zIndex: 2055,
			}}
		>
			<div
				className="w-full md:w-2/3  text-white flex justify-end cursor-pointer"
				// @ts-ignore
				onClick={toggleModalVisibility}
			>
				<IoMdClose style={{ fontSize: "30px" }} />
			</div>
			<div className="w-full md:w-2/3 ">
				<input
					type="search"
					className="w-full p-3"
					placeholder="Search for any movie or tv-series"
					onChange={(event) => handleQueryChange(event.target.value)}
				/>
			</div>
			{resultData?.length ? (
				<div
					className="w-full md:w-2/3  p-2 flex flex-col gap-2 bg-white"
					style={{ overflowY: "auto" }}
				>
					{resultData?.map(
						(
							{
								id,
								media_type,
								profile_path,
								poster_path,
								release_date,
								first_air_date,
								name,
								title,
								vote_average,
								backdrop_path,
							},
							index
						) =>
							["tv", "movie"]?.includes(media_type) ? (
								<Link
									href={`/${media_type}/${decorateLink(name || title)}/${id}`}
									key={index}
									className="relative p-2 flex gap-2 border-dashed border-2 border-gray-300 bg-gray-50"
									// @ts-ignore
									onClick={toggleModalVisibility}
								>
									<div
										className="absolute top-0 left-0"
										style={{
											zIndex: 0,
											// 	backgroundImage: `url(${getImageBaseLink({
											// 		path: backdrop_path,
											// 		type: "backdrop",
											// 		quality: "lg",
											// 	})}
											// )`,
											// backgroundColor: "rgba(0,0,0,0.2)",
											// backgroundPosition: "center",
											// filter: `brightness(40%)`,
											// height: "100%",
											// width: "100%",
										}}
									></div>
									<div className="w-1/3" style={{ zIndex: 1 }}>
										<Image
											src={getImageBaseLink({
												path: poster_path || profile_path,
												type: "poster",
												quality: "lg",
											})}
											height={200}
											width={100}
											alt=""
										/>
									</div>
									<div className="w-2/3" style={{ zIndex: 1 }}>
										<p className="text-sm">
											{(first_air_date || release_date)?.split("-")[0]}
										</p>
										<p className="text-xl">
											{/* @ts-ignore */}
											{name || title}
										</p>
										<p className="text-orange-500 flex gap-1 items-center">
											<AiTwotoneStar /> {vote_average?.toFixed(1)} / 10
										</p>
									</div>
								</Link>
							) : null
					)}
					{/* <div className="flex gap-2 items-center justify-center border-dashed border-2 border-gray-300 p-2">
						load more <IoIosArrowDown />
					</div> */}
				</div>
			) : null}
		</div>
	);
};
export default SearchModal;
