"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { IoShareSocialOutline } from "react-icons/io5";
import { AiOutlineCheck } from "react-icons/ai";

export default function ShareIntentComponent({ text }) {
	const [isCopied, setIsCopied] = useState(false);

	const shareIntent = async () => {
		const shareData = {
			url: window.location.href,
			text: text || "Check this out on HookedOnMovies!",
		};

		if (
			navigator?.share &&
			navigator.canShare &&
			navigator.canShare(shareData)
		) {
			try {
				await navigator?.share(shareData);
				console.log("shared");
			} catch (error) {
				if (error.name !== "AbortError") {
					console.error(`Error: ${error.message}`);
				}
			}
		} else {
			try {
				await navigator.clipboard.writeText(window.location.href);
				setIsCopied(true);
				setTimeout(() => setIsCopied(false), 2000);
			} catch (err) {
				console.error("Error copying to clipboard:", err);
			}
		}
	};

	return (
		<button
			className="border-dotted rounded-sm border-2 px-2 py-1 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors relative group"
			onClick={() => shareIntent()}
			title={isCopied ? "Copied!" : "Share"}
		>
			{isCopied ? (
				<AiOutlineCheck className="text-green-500" />
			) : (
				<IoShareSocialOutline />
			)}
			{isCopied && (
				<span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap">
					Link Copied!
				</span>
			)}
		</button>
	);
}
