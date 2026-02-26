"use client";
import { getImageBaseLink } from "@/constants";
import SeasonsModal from "@/modals/SeasonsModal";
import Image from "next/image";
import React, { useState } from "react";
import { AiTwotoneStar } from "react-icons/ai";

interface props {
	data: Array<any>;
	seriesId: string;
}

const SeasonsContainer: React.FC<props> = ({ data, seriesId }) => {
	const [activeSeason, setActiveSeason] = useState(0);

	return (
		<>
			{data && data?.length ? (
				<div className="flex flex-col gap-1">
					<h2 className="py-1 text-2xl uppercase">Seasons</h2>
					<div className="flex gap-5 border-grey overflow-x-auto">
						{data?.map((item, index) =>
							item?.name != "Specials" ? (
								<div
									key={index}
									className="scrolling_seasons_cards"
									onClick={() => setActiveSeason(item?.season_number)}
								>
									<Image
										src={getImageBaseLink({
											path: item?.poster_path,
											type: "poster",
											quality: "xl",
										})}
										width={150}
										height={200}
										alt=""
									/>
									<div>
										<p className="text-sm text-orange-700 flex items-center gap-1">
											<AiTwotoneStar />
											{item?.vote_average}/10
										</p>
										<h3>
											{item?.name?.length > 14
												? `${item?.name?.substring(0, 14)}...`
												: item?.name}{" "}
											({item?.episode_count})
										</h3>
									</div>
									{/* <p> Released on : {item?.air_date}</p> */}
								</div>
							) : null
						)}
					</div>
				</div>
			) : null}

			{data && data.length && activeSeason ? (
				<>
					<SeasonsModal
						activeSeason={activeSeason}
						totalSeasons={data?.length}
						setActiveSeason={setActiveSeason}
						seriesId={seriesId}
					/>
				</>
			) : null}
		</>
	);
};

export default SeasonsContainer;
