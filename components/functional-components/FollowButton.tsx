"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { FiPlus, FiCheck } from "react-icons/fi";
import {
	FOLLOWING_EVENT,
	isFollowing,
	subscribeFollowing,
	toggleFollow,
} from "@/lib/following";
import { useUser } from "@/lib/hooks/useUser";
import { isFollowingPerson, toggleFollowPerson } from "@/app/actions/following";

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
 * Uses Supabase when signed in, falls back to localStorage otherwise.
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
	const [busy, setBusy] = useState(false);
	const { user, loading } = useUser();
	const router = useRouter();

	useEffect(() => {
		setMounted(true);
	}, []);

	// Load state: DB when signed in, localStorage otherwise.
	useEffect(() => {
		if (loading) return;
		let cancelled = false;

		const sync = async () => {
			if (user) {
				try {
					const res = await isFollowingPerson(id);
					if (!cancelled) setFollowing(res);
				} catch {
					/* ignore */
				}
			} else if (!cancelled) {
				setFollowing(isFollowing(id));
			}
		};
		sync();

		if (user) return () => { cancelled = true; };
		return () => { cancelled = true; };
	}, [id, user, loading]);

	// Cross-tab updates only apply to the localStorage mode.
	useEffect(() => {
		if (user || loading) return;
		const sync = () => setFollowing(isFollowing(id));
		return subscribeFollowing(sync);
	}, [id, user, loading]);

	const handleClick = async () => {
		if (busy) return;
		if (!user) {
			router.push("/login");
			return;
		}
		setBusy(true);
		try {
			const next = await toggleFollowPerson({
				personId: id,
				name,
				profilePath,
				department,
			});
			setFollowing(next);
			// Notify parent views (e.g. PersonDetail) to re-read state.
			if (typeof window !== "undefined") {
				window.dispatchEvent(new Event(FOLLOWING_EVENT));
			}
		} catch (err) {
			console.error(err);
		} finally {
			setBusy(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={following}
			disabled={busy}
			title={
				!user
					? `Sign in to track ${name}`
					: following
						? `Stop tracking ${name}`
						: `Track ${name}'s filmography`
			}
			className={clsx(
				"inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md border px-5 text-base font-medium transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60",
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
