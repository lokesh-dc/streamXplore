"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { FiPlus, FiCheck } from "react-icons/fi";
import { isFollowing, subscribeFollowing, toggleFollow } from "@/lib/following";

interface FollowButtonProps {
	id: number;
	name: string;
	profilePath?: string | null;
	department?: string | null;
	className?: string;
	showLabel?: boolean;
}

/**
 * Follow/unfollow a person for filmography tracking.
 * Works for any department — acting, directing, writing, production, etc.
 */
export default function FollowButton({
	id,
	name,
	profilePath = null,
	department = null,
	className,
	showLabel = true,
}: FollowButtonProps) {
	const [following, setFollowing] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const sync = () => setFollowing(isFollowing(id));
		sync();
		return subscribeFollowing(sync);
	}, [id]);

	const handleClick = () => {
		setFollowing(toggleFollow({ id, name, profilePath, department }));
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={following}
			title={
				following
					? `Stop tracking ${name}`
					: `Track ${name}'s filmography`
			}
			className={clsx(
				"inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md border px-5 text-base font-medium transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
				following
					? "border-primary/50 bg-primary/15 text-white hover:bg-primary/25"
					: "border-white/20 text-white hover:bg-white/10",
				className,
			)}>
			{following ? <FiCheck className="text-primary" /> : <FiPlus />}
			{showLabel && (
				<span aria-live={mounted ? "polite" : undefined}>
					{following ? "Tracking" : "Track filmography"}
				</span>
			)}
		</button>
	);
}
