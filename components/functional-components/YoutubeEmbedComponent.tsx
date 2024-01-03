import React, { ReactElement, useEffect, useState } from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

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

	return (
		<div className={`${classes}`}>
			<LiteYouTubeEmbed id={videoIdState} title={title} />
		</div>
	);
};

export default YoutubeEmbedComponent;
