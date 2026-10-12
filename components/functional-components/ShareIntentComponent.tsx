"use client";
import React, { useEffect, useState } from "react";
import { IoShareSocialOutline } from "react-icons/io5";
import { FiCheck } from "react-icons/fi";

interface ShareIntentProps {
	title?: string;
	posterUrl?: string;
	className?: string;
}

export default function ShareIntentComponent({ title, posterUrl, className }: ShareIntentProps) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(timer);
	}, [copied]);

	const shareIntent = async () => {
		const shareData = {
			title: title || "HookedOnMovies",
			text: `Check out ${title || "this"} on HookedOnMovies!`,
			url: window.location.href,
		};

		if (navigator?.share) {
			try {
				await navigator.share(shareData);
			} catch (error: any) {
				if (error.name !== "AbortError") {
					console.error(`Error: ${error.message}`);
				}
			}
			return;
		}

		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
		} catch {
			/* clipboard unavailable — silently ignore */
		}
	};

	return (
		<button
			type="button"
			className={className || "p-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/10"}
			onClick={() => shareIntent()}
			title={copied ? "Link copied" : "Share"}
			aria-label={copied ? "Link copied" : "Share"}
		>
			{copied ? (
				<FiCheck className="text-xl text-primary" />
			) : (
				<IoShareSocialOutline className="text-xl" />
			)}
		</button>
	);
}
