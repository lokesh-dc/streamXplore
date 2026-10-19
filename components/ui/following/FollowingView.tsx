"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiX } from "react-icons/fi";
import { BsPersonPlus } from "react-icons/bs";

import {
	getFollowed,
	getWatchedForPerson,
	removeFollowed,
	subscribeFollowing,
	type FollowedPerson,
} from "@/lib/following";
import { useUser } from "@/lib/hooks/useUser";
import {
	getFollowedPeople,
	removeFollowedPerson,
} from "@/app/actions/following";
import { getWatchedCredits } from "@/app/actions/watched";
import { decorateLink } from "@/utils";
import { getImageBaseLink } from "@/constants";

type Credit = {
	mediaType: "movie" | "tv";
	id: number;
	title: string;
	posterPath: string | null;
	date: string | null;
	year: string | null;
	rating: number;
	voteCount: number;
	role: "cast" | "crew";
	character: string | null;
	job: string | null;
	department: string | null;
};

type CreditsResponse = {
	id: number;
	name: string | null;
	films: Credit[];
	series: Credit[];
	total: number;
};

type DeptFilter = string;
const ALL_DEPTS = "all";

const personHref = (p: FollowedPerson) =>
	`/person/${decorateLink(p.name)}/${p.id}`;

function ProgressBar({ pct }: { pct: number }) {
	return (
		<div
			className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
			role="progressbar"
			aria-valuenow={Math.round(pct)}
			aria-valuemin={0}
			aria-valuemax={100}>
			<div
				className="h-full rounded-full bg-primary transition-all duration-500"
				style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
			/>
		</div>
	);
}

/**
 * Read-only progress card. The watched checklist lives on the
 * person's own page — this card just links out to it.
 */
function PersonCard({
	person,
	watchedTick,
	watchedCount: watchedCountProp,
	onUnfollow,
}: {
	person: FollowedPerson;
	watchedTick: number;
	watchedCount?: number;
	onUnfollow: (id: number) => void;
}) {
	const [total, setTotal] = useState<number | null>(null);
	const [failed, setFailed] = useState(false);
	const [nonce, setNonce] = useState(0);

	useEffect(() => {
		let cancelled = false;
		setFailed(false);
		fetch(`/api/person/credits?id=${person.id}`)
			.then(async (res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return (await res.json()) as CreditsResponse;
			})
			.then((data) => {
				if (!cancelled) setTotal(data.total);
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, [person.id, nonce]);

	// When the parent supplies the count (DB mode), prefer it.
	const watchedCount = useMemo(
		() =>
			watchedCountProp !== undefined
				? watchedCountProp
				: getWatchedForPerson(person.id).length,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[person.id, watchedTick, watchedCountProp],
	);

	const pct = total ? (watchedCount / total) * 100 : 0;

	const avatar = person.profilePath
		? getImageBaseLink({
				type: "profile",
				quality: "md",
				path: person.profilePath,
			})
		: null;

	return (
		<article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
			<div className="flex items-center gap-4 p-4 sm:p-5">
				<Link
					href={personHref(person)}
					className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border border-white/10 bg-white/5 sm:h-20 sm:w-20">
					{avatar ? (
						<Image
							unoptimized
							src={avatar}
							alt={`${person.name} portrait`}
							fill
							sizes="80px"
							className="object-cover"
						/>
					) : (
						<span className="flex h-full w-full items-center justify-center font-display text-2xl text-text-secondary">
							{person.name.slice(0, 1)}
						</span>
					)}
				</Link>

				<div className="flex min-w-0 flex-1 flex-col gap-2">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
						<Link
							href={personHref(person)}
							className="truncate font-display text-xl leading-none text-text-primary transition-colors hover:text-primary sm:text-2xl">
							{person.name}
						</Link>
						{person.department ? (
							<span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
								{person.department}
							</span>
						) : null}
					</div>

					{total !== null ? (
						<>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
								<span className="tabular text-text-primary">
									{watchedCount}/{total}
								</span>{" "}
								watched · {Math.round(pct)}%
								{watchedCount >= total && total > 0
									? " · Complete 🎬"
									: ""}
							</p>
							<ProgressBar pct={pct} />
						</>
					) : failed ? (
						<p className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
							Couldn&apos;t load filmography total.
							<button
								type="button"
								onClick={() => setNonce((n) => n + 1)}
								className="font-bold uppercase tracking-[0.16em] text-primary hover:text-primary/80">
								Retry
							</button>
						</p>
					) : (
						<div className="flex animate-pulse flex-col gap-2">
							<div className="h-3 w-32 rounded-full bg-white/[0.06]" />
							<div className="h-1.5 w-full rounded-full bg-white/[0.06]" />
						</div>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<button
						type="button"
						onClick={() => onUnfollow(person.id)}
						aria-label={`Stop tracking ${person.name}`}
						title="Stop tracking"
						className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-text-secondary transition-colors hover:border-red-500/40 hover:text-red-400">
						<FiX className="text-sm" />
					</button>
					<Link
						href={personHref(person)}
						className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-text-primary transition-colors hover:border-white/25">
						Open
						<FiArrowRight />
					</Link>
				</div>
			</div>
		</article>
	);
}

const FollowingView = () => {
	const [people, setPeople] = useState<FollowedPerson[]>([]);
	const [mounted, setMounted] = useState(false);
	const [dept, setDept] = useState<DeptFilter>(ALL_DEPTS);
	const [query, setQuery] = useState("");
	// Increment on any watched toggle so all trackers re-read progress.
	const [watchedTick, setWatchedTick] = useState(0);
	// DB mode: per-person watched counts keyed by person id.
	const [dbWatched, setDbWatched] = useState<Record<number, number>>({});
	const { user, loading } = useUser();

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
					const rows = await getFollowedPeople();
					if (cancelled) return;
					const list: FollowedPerson[] = (rows || []).map((r: any) => ({
						id: r.person_id,
						name: r.name,
						profilePath: r.profile_path,
						department: r.known_for_department,
						addedAt: new Date(r.added_at).getTime() || 0,
					}));
					setPeople(list);

					const counts: Record<number, number> = {};
					await Promise.all(
						list.map(async (p) => {
							const w = await getWatchedCredits(p.id);
							counts[p.id] = w.length;
						}),
					);
					if (!cancelled) {
						setDbWatched(counts);
						setWatchedTick((t) => t + 1);
					}
				} catch {
					/* ignore */
				}
			} else if (!cancelled) {
				setPeople([...getFollowed()].sort((a, b) => b.addedAt - a.addedAt));
				setWatchedTick((t) => t + 1);
			}
		};
		sync();
		return () => {
			cancelled = true;
		};
	}, [user, loading]);

	// Cross-tab updates only apply to the localStorage mode.
	useEffect(() => {
		if (user || loading) return;
		const sync = () => {
			setPeople([...getFollowed()].sort((a, b) => b.addedAt - a.addedAt));
			setWatchedTick((t) => t + 1);
		};
		return subscribeFollowing(sync);
	}, [user, loading]);

	const handleUnfollow = async (id: number) => {
		if (user) {
			await removeFollowedPerson(id);
			setPeople((prev) => prev.filter((p) => p.id !== id));
			setDbWatched((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
		} else {
			removeFollowed(id);
		}
	};

	const visible = useMemo(() => {
		let list = people;
		if (dept !== ALL_DEPTS)
			list = list.filter((p) => (p.department || "Other") === dept);
		const q = query.trim().toLowerCase();
		if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
		return list;
	}, [people, dept, query]);

	const departments = useMemo(
		() =>
			Array.from(
				new Set(people.map((p) => p.department || "Other")),
			).sort(),
		[people],
	);

	const deptCount = useCallback(
		(d: string) =>
			people.filter((p) => (p.department || "Other") === d).length,
		[people],
	);

	if (!mounted || (user && loading)) {
		return (
			<div className="flex flex-col gap-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="flex animate-pulse items-center gap-4 rounded-2xl border border-white/5 p-5">
						<div className="h-16 w-16 rounded-[10px] bg-white/[0.06]" />
						<div className="flex flex-1 flex-col gap-2">
							<div className="h-4 w-1/3 rounded-full bg-white/[0.06]" />
							<div className="h-2 w-full rounded-full bg-white/[0.06]" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (!people.length) {
		return (
			<div className="flex flex-col items-center gap-5 py-20 text-center">
				<span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl text-text-secondary">
					<BsPersonPlus />
				</span>
				<h2 className="font-display text-4xl leading-none md:text-5xl">
					No one tracked yet
				</h2>
				<p className="max-w-sm text-sm leading-relaxed text-text-secondary">
					Hit “Track filmography” on anyone’s page — actor, director,
					writer, composer, anyone. Then open their page to tick off
					every film and series until you hit 100%.
				</p>
				<div className="mt-1 flex flex-wrap items-center justify-center gap-3">
					<Link
						href="/movies"
						className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
						Browse movies
					</Link>
					<Link
						href="/watchlist"
						className="inline-flex items-center gap-2 rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
						My watchlist
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => setDept(ALL_DEPTS)}
						aria-pressed={dept === ALL_DEPTS}
						className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
							dept === ALL_DEPTS
								? "border-primary/50 bg-primary/15 text-white"
								: "border-white/10 bg-white/5 text-text-secondary hover:text-text-primary"
						}`}>
						All
						<span className="tabular opacity-60">{people.length}</span>
					</button>
					{departments.map((d) => (
						<button
							key={d}
							type="button"
							onClick={() => setDept(d)}
							aria-pressed={dept === d}
							className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
								dept === d
									? "border-primary/50 bg-primary/15 text-white"
									: "border-white/10 bg-white/5 text-text-secondary hover:text-text-primary"
							}`}>
							{d}
							<span className="tabular opacity-60">{deptCount(d)}</span>
						</button>
					))}
				</div>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Filter by name…"
					aria-label="Filter tracked people by name"
					className="h-10 w-full max-w-xs rounded-full border border-white/10 bg-white/5 px-4 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary/50 focus:outline-none"
				/>
			</div>

			{visible.length ? (
				<div className="flex flex-col gap-4">
					{visible.map((p) => (
						<PersonCard
							key={p.id}
							person={p}
							watchedTick={watchedTick}
							watchedCount={user ? dbWatched[p.id] : undefined}
							onUnfollow={handleUnfollow}
						/>
					))}
				</div>
			) : (
				<p className="py-16 text-center text-sm text-text-secondary">
					No tracked people match this filter.
				</p>
			)}
		</div>
	);
};

export default FollowingView;
