import { movieVideos } from "@/constants/typescript";
import YoutubeVideoModal from "@/modals/YoutubeVideoModal";
import React, { ReactElement, useEffect, useState } from "react";

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
			if (
				// @ts-ignore
				types[data[i]?.type] == undefined &&
				(data[i]?.type == "Trailer" || data[i]?.type == "Teaser")
			) {
				// @ts-ignore
				types[data[i]?.type] = [data[i]];
			} else if (
				(data[i]?.type == "Trailer" || data[i]?.type == "Teaser") &&
				// @ts-ignore
				types[data[i]?.type]?.length < 5
			) {
				// @ts-ignore

				types[data[i]?.type].push(data[i]);
			}
		}
		setMovieVideos(types);
	}

	const [movieVideos, setMovieVideos] = useState({});
	const [modalVideo, setVideoModal] = useState({
		position: 0,
		key: "",
		title: "",
	});
	const changeModalVideo = (position: number, key: string, title: string) => {
		setVideoModal({ position, key: key, title: title });
	};

	// @ts-ignore
	return Object.keys(movieVideos)?.length ? (
		<>
			<h2 className={`text-2xl uppercase`}>Videos</h2>
			<div className="flex flex-col gap-4 pl-3">
				{Object.keys(movieVideos)?.map((item, index) => (
					<div className="flex flex-col gap-2" key={index}>
						<h3>{item}</h3>
						<div className="flex gap-3 overflow-x-auto">
							{/* @ts-ignore */}
							{movieVideos[item]?.map(({ name, type, key }, playlistIndex) => (
								<div
									className="movie_video_card flex-col"
									key={playlistIndex}
									onClick={() => changeModalVideo(index, key, name)}
								>
									<h3>{`${name?.substring(0, 30)}${
										name.length > 30 ? "..." : ""
									}`}</h3>
									<p className="text-zinc-600 text-sm">{type}</p>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
			{modalVideo?.key ? (
				<YoutubeVideoModal
					videoId={modalVideo?.key}
					title={modalVideo?.title}
					position={modalVideo?.position}
					changeModalVideo={changeModalVideo}
					data={data}
				/>
			) : null}
		</>
	) : null;
};

export default VideosContainer;
