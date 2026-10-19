"use client";

import { useState } from "react";
import clsx from "clsx";
import { FiCheck } from "react-icons/fi";

interface CompactWatchedButtonProps {
	/** Watched state is owned by the parent — this button never fetches. */
	watched: boolean;
	onToggle: () => void | Promise<void>;
	title: string;
	/** Blocks repeat clicks while the parent's write is in flight. */
	busy?: boolean;
	className?: string;
}

/**
 * Icon-only watched toggle for overlaying on cards.
 * Render as a sibling of the card link (not nested inside it).
 * Fully controlled: the parent (e.g. PersonDetail) owns the data, so a page
 * of cards costs zero extra requests.
 */
export default function CompactWatchedButton({
	watched,
	onToggle,
	title,
	busy = false,
	className,
}: CompactWatchedButtonProps) {
	const [pending, setPending] = useState(false);
	const busyState = busy || pending;

	const handleClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (busyState) return;
		setPending(true);
		try {
			await onToggle();
		} finally {
			setPending(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={watched}
			disabled={busyState}
			aria-label={
				watched ? `Mark ${title} as unwatched` : `Mark ${title} as watched`
			}
			title={watched ? "Watched — click to undo" : "Mark as watched"}
			className={clsx(
				"absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-sm backdrop-blur transition-all duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60 [@media(hover:none)]:opacity-100",
				watched
					? "border-primary/60 bg-primary text-white opacity-100 hover:bg-primary/90"
					: "border-white/15 bg-black/70 text-white opacity-0 hover:bg-primary hover:text-white group-hover:opacity-100",
				className,
			)}>
			<FiCheck strokeWidth={3} />
		</button>
	);
}
