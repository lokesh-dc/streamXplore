"use client";
import React from "react";
import { IoShareSocialOutline } from "react-icons/io5";

export default function ShareIntentComponent({ title, posterUrl, className }) {
	const shareIntent = async () => {
		const shareData = {
			title: title || "HookedOnMovies",
			text: `Check out ${title || "this"} on HookedOnMovies!${posterUrl ? `\n\nPoster: ${posterUrl}` : ""}`,
			url: window.location.href,
		};

		if (navigator?.share) {
			try {
				await navigator?.share(shareData);
			} catch (error) {
				if (error.name !== "AbortError") {
					console.error(`Error: ${error.message}`);
				}
			}
		} else {
			console.log("Share is not supported in this browser");
		}
	};

	return (
		<button
			className={className || "p-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/10"}
			onClick={() => shareIntent()}
			title="Share"
		>
			<IoShareSocialOutline className="text-xl" />
		</button>
	);
}
