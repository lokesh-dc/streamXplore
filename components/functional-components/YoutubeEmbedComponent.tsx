"use client";

import React, { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
	FaPause,
	FaPlay,
	FaVolumeMute,
	FaVolumeUp,
} from "react-icons/fa";
import { FiRotateCcw, FiMaximize } from "react-icons/fi";

declare global {
	interface Window {
		YT: any;
		onYouTubeIframeAPIReady?: () => void;
	}
}

interface props {
	videoId: string;
	title: string;
	classes: string;
}

let apiReadyPromise: Promise<void> | null = null;

const loadYouTubeApi = () => {
	if (apiReadyPromise) return apiReadyPromise;
	apiReadyPromise = new Promise<void>((resolve) => {
		const previous = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			previous?.();
			resolve();
		};
		const tag = document.createElement("script");
		tag.src = "https://www.youtube.com/iframe_api";
		document.head.appendChild(tag);
	});
	return apiReadyPromise;
};

const formatTime = (seconds: number) => {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
};

/**
 * Custom YouTube player backed by the IFrame Player API.
 * Own overlay controls so play/pause/seek work consistently on
 * desktop and touch without relying on YouTube's native chrome.
 */
const YoutubeEmbedComponent: React.FC<props> = ({
	videoId,
	title,
	classes,
}): ReactElement => {
	const containerRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<any>(null);
	const readyRef = useRef(false);

	const [playing, setPlaying] = useState(false);
	const [ended, setEnded] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [muted, setMuted] = useState(false);

	// Boot the player once (container persists across video changes)
	useEffect(() => {
		let cancelled = false;
		loadYouTubeApi().then(() => {
			if (cancelled || !containerRef.current || playerRef.current) return;
			playerRef.current = new window.YT.Player(containerRef.current, {
				host: "https://www.youtube-nocookie.com",
				videoId,
				playerVars: {
					autoplay: 1,
					controls: 0,
					disablekb: 1,
					playsinline: 1,
					rel: 0,
					iv_load_policy: 3,
					modestbranding: 1,
				},
				events: {
					onReady: (event: any) => {
						readyRef.current = true;
						setDuration(event.target.getDuration() || 0);
						try {
							event.target.playVideo();
						} catch {
							/* autoplay blocked — wait for user tap */
						}
					},
					onStateChange: (event: any) => {
						const STATE = window.YT.PlayerState;
						if (event.data === STATE.PLAYING) {
							setDuration(event.target.getDuration() || 0);
							setPlaying(true);
							setEnded(false);
						} else if (event.data === STATE.PAUSED) {
							setPlaying(false);
						} else if (event.data === STATE.ENDED) {
							setPlaying(false);
							setEnded(true);
						}
					},
				},
			});
		});
		return () => {
			cancelled = true;
			try {
				playerRef.current?.destroy();
			} catch {
				/* already destroyed */
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Switch video without rebuilding the player
	useEffect(() => {
		setCurrentTime(0);
		setEnded(false);
		const player = playerRef.current;
		if (!player || !readyRef.current) return;
		player.loadVideoById({ videoId, autoplay: 1 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoId]);

	// Poll playback position for the seek bar
	useEffect(() => {
		if (!playing) return;
		const id = window.setInterval(() => {
			const player = playerRef.current;
			if (!player?.getCurrentTime) return;
			setCurrentTime(player.getCurrentTime());
		}, 250);
		return () => window.clearInterval(id);
	}, [playing]);

	const togglePlay = useCallback(() => {
		const player = playerRef.current;
		if (!player || !readyRef.current) return;
		if (ended) {
			player.seekTo(0);
			player.playVideo();
			return;
		}
		if (playing) {
			player.pauseVideo();
		} else {
			player.playVideo();
		}
	}, [playing, ended]);

	const seek = (event: React.PointerEvent<HTMLDivElement>) => {
		const player = playerRef.current;
		if (!player?.getDuration || !readyRef.current) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const ratio = Math.min(
			Math.max((event.clientX - rect.left) / rect.width, 0),
			1,
		);
		player.seekTo(ratio * player.getDuration());
	};

	const toggleMute = () => {
		const player = playerRef.current;
		if (!player?.isMuted) return;
		const next = !player.isMuted();
		if (next) player.mute();
		else player.unMute();
		setMuted(next);
	};

	const toggleFullscreen = () => {
		const iframe = playerRef.current?.getIframe?.();
		if (!iframe) return;
		try {
			if (document.fullscreenElement) {
				document.exitFullscreen();
			} else if (iframe.requestFullscreen) {
				iframe.requestFullscreen();
			}
		} catch {
			/* fullscreen unavailable */
		}
	};

	const progress = duration ? (currentTime / duration) * 100 : 0;

	return (
		<div className={`relative ${classes}`}>
			{/* Poster peeks through while the embed boots */}
			<Image
				unoptimized
				src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
				alt=""
				aria-hidden
				fill
				sizes="(max-width: 768px) 100vw, 1152px"
				className="object-cover opacity-60"
			/>

			{/* Player mount point (YT replaces this node with an iframe) */}
			<div ref={containerRef} className="absolute inset-0" />

			{/* Tap-anywhere to play / pause */}
			<button
				type="button"
				aria-label={playing ? "Pause" : "Play"}
				onClick={togglePlay}
				className="absolute inset-0 z-10 cursor-pointer"
			/>

			{/* Center affordance */}
			{!playing ? (
				<span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
					<span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 ease-smooth group-hover:scale-110 sm:h-20 sm:w-20">
						{ended ? (
							<FiRotateCcw className="text-2xl" />
						) : (
							<FaPlay className="ml-1 text-xl text-white" />
						)}
					</span>
				</span>
			) : null}

			{/* Control bar */}
			<div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pb-1.5 pt-10 sm:px-4">
				<span className="pointer-events-auto flex items-center gap-2.5 sm:gap-3">
					<button
						type="button"
						onClick={togglePlay}
						aria-label={playing ? "Pause" : "Play"}
						className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
					>
						{ended ? (
							<FiRotateCcw />
						) : playing ? (
							<FaPause />
						) : (
							<FaPlay className="ml-0.5 text-sm" />
						)}
					</button>

					<div
						role="slider"
						aria-label="Seek"
						aria-valuemin={0}
						aria-valuemax={Math.round(duration)}
						aria-valuenow={Math.round(currentTime)}
						onPointerDown={seek}
						className="group/slider relative h-6 flex-1 cursor-pointer"
					>
						<span className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/25 transition-colors group-hover/slider:bg-white/35" />
						<span
							className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
							style={{ width: `${progress}%` }}
						/>
						<span
							className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
							style={{ left: `${progress}%` }}
						/>
					</div>

					<span className="shrink-0 font-mono text-[11px] tabular text-white/80 sm:text-xs">
						{formatTime(currentTime)} / {formatTime(duration)}
					</span>

					<button
						type="button"
						onClick={toggleMute}
						aria-label={muted ? "Unmute" : "Mute"}
						className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 sm:grid"
					>
						{muted ? <FaVolumeMute /> : <FaVolumeUp />}
					</button>

					<button
						type="button"
						onClick={toggleFullscreen}
						aria-label="Fullscreen"
						className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 md:grid"
					>
						<FiMaximize />
					</button>
				</span>
			</div>
		</div>
	);
};

export default YoutubeEmbedComponent;