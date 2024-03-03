import React, { ReactElement, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

import getSeriesSeasonDetails from "@/dataFetchings/getSeriesSeasonDetails";
import Image from "next/image";
import { getImageBaseLink } from "@/constants";

interface props {
	activeSeason: number;
	totalSeasons: number;
	setActiveSeason: Function;
	seriesId: string;
}

interface seasonDataProps {
	air_date: string;
	episodes: Array<any>;
	id: number;
	name: string;
	overview: string;
	poster_path: string;
	season_number: number;
	vote_average: number;
}

const SeasonsModal: React.FC<props> = ({
	activeSeason,
	totalSeasons,
	setActiveSeason,
	seriesId,
}): ReactElement => {
	const [seasonData, setSeasonData] = useState<seasonDataProps>({
		air_date: "",
		episodes: [],
		id: 0,
		name: "",
		overview: "",
		poster_path: "",
		season_number: 0,
		vote_average: 0,
	});

	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		console.log("oooyaaahhhh");
		setLoading(true);
		getSeriesSeasonDetails(seriesId, activeSeason)
			.then((res) => {
				setSeasonData(res);
				setLoading(false);
			})
			.catch((err) => console.log(err));
	}, []);

	const isEpisodeReleased = (releaseData: string) => {
		if (!releaseData) return false;
		const currentdate = new Date().toISOString().split("T")[0];
		return (
			Number(currentdate?.split("-").join("")) -
				Number(releaseData.split("-").join("")) >
			0
		);
	};
	return (
		<div
			className="seasonModal fixed top-0 fadein w-screen h-screen bg-black/90 flex flex-col justify-end items-end gap-2 default_screen_adjust"
			style={{ overflowY: "hidden", zIndex: 2055 }}
		>
			<div
				className="body w-full h-4/6 flex flex-col justify-start gap-3 p-3"
				style={{
					border: "1px solid white",
					background: "rgba(255,255,255,1",
					borderRadius: "16px 16px 0 0",
					height: "75%",
				}}
			>
				{seasonData && seasonData?.name && !isLoading ? (
					<>
						<div
							className="w-full flex flex-col gap-2"
							style={{ justifyContent: "end" }}
						>
							<div className="flex items-center justify-between">
								<p className="text-xl">
									S{activeSeason < 10 ? `0${activeSeason}` : activeSeason} -{" "}
									{seasonData?.name}
								</p>
								<div onClick={() => setActiveSeason(0)}>
									<IoMdClose style={{ fontSize: "30px" }} />
								</div>
							</div>
							<p className="text-gray-500 limitTo2Lines">
								{seasonData?.overview}
							</p>
						</div>
						{seasonData?.episodes &&
						Array.isArray(seasonData?.episodes) &&
						seasonData?.episodes?.length ? (
							<div className="flex flex-col" style={{ overflowY: "auto" }}>
								{seasonData?.episodes?.map((epi, epiId) => (
									<div
										key={epiId}
										className="flex items-center gap-2 py-2"
										style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
									>
										<p className="text-2xl">
											{epi?.episode_number < 10
												? `0${epi?.episode_number}`
												: epi?.episode_number}
										</p>
										<div className="flex gap-2 w-full">
											{epi?.still_path || isEpisodeReleased(epi?.air_date) ? (
												<Image
													unoptimized
													style={{ minWidth: "40%" }}
													src={getImageBaseLink({
														type: "backdrop",
														quality: "md",
														path: epi?.still_path,
													})}
													height={70}
													width={150}
													alt=""
												/>
											) : (
												<div
													className="flex flex-col p-2 text-gray-500"
													style={{
														minWidth: "40%",
														border: "1px solid rgba(0,0,0,0.06)",
													}}
												>
													<p>Release Date</p>
													<p>{epi?.air_date}</p>
												</div>
											)}
											<div style={{ minWidth: "55%" }}>
												<div className="flex justify-between text-sm">
													<p className="text-orange-500">
														{epi?.vote_average.toFixed(1)} / 10
													</p>
													{epi?.runtime ? (
														<p className="text-gray-400">{epi?.runtime} mins</p>
													) : null}
												</div>
												<p className="text-md limitTo2Lines">{epi?.name}</p>
												<p className="text-gray-500 limitTo1Lines text-xs">
													{epi?.overview}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						) : null}
					</>
				) : (
					<div className="loading">...loading</div>
				)}
			</div>
		</div>
	);
};
export default SeasonsModal;
