import React, { ReactElement, useEffect, useState } from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
// import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

interface props {
	videoId: string;
	title: string;
	classes: string;
}

const YoutubeEmbedComponent: React.FC<props> = ({
	videoId,
	title,
	classes,
}): ReactElement => {
	const [videoIdState, setVideoIdState] = useState(videoId);

	useEffect(() => {
		setVideoIdState(videoId);
	}, [videoId]);

	useEffect(() => {
		const button = document.querySelector(".lty-playbtn");

		if (!button) return;

		function createObserver() {
			let observer;

			let options = {
				rootMargin: "-50%",
				threshold: 1,
			};

			// @ts-ignore
			observer = new IntersectionObserver(() => button.click(), options);
			// @ts-ignore
			observer.observe(button);
		}
		return createObserver();
	}, [videoId]);

	return (
		<div className={`${classes}`}>
			<LiteYouTubeEmbed id={videoIdState} title={title} />
		</div>
	);
};

export default YoutubeEmbedComponent;
