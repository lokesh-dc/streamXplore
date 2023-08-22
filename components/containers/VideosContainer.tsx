import { movieVideos } from "@/constants/typescript";
import React, { ReactElement, useEffect } from "react";

interface props {
	data: Array<movieVideos>;
	movieId: string;
}

const VideosContainer: React.FC<props> = ({ data, movieId }): ReactElement => {
	useEffect(() => {
		videoSorter(data);
	}, [movieId]);

	function videoSorter(data: Array<movieVideos>) {
		let types = {};
		for (let i = 0; i < data.length; i++) {
			// @ts-ignore
			if (types[data[i]?.type] == undefined) {
				// @ts-ignore
				types[data[i]?.type] = [data[i]];
			} else {
				// @ts-ignore
				types[data[i]?.type].push(data[i]);
			}
		}
	}

	return (
		<>
			<h2 className={`text-2xl uppercase`}>Videos</h2>

			<div
				className="flex overflow-x gap-1"
				style={{ width: "100%", overflowX: "scroll" }}
			>
				{data?.map((item, index) => (
					<div key={index} className="movie_video_card">
						<div>
							<h3>{item?.name}</h3>
							<p className="text-zinc-600 text-sm">{item?.type}</p>
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default VideosContainer;
