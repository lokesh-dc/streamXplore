import { Metadata } from "next";

import PageTitle from "@/components/ui/PageTitle";
import WatchedView from "@/components/ui/watched/WatchedView";
import {
	getWatchedTitles,
	getPublicWatchedTitles,
	resolveSharedTitles,
} from "@/app/actions/watched";
import {
	decodeSharedWatched,
	formatCleanDisplayName,
	type WatchedEntry,
} from "@/lib/watched";

interface PageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
	const params = await searchParams;
	const listParam = typeof params?.list === "string" ? params.list : null;
	const sharedUser = typeof params?.u === "string" ? params.u : null;
	const sharedData = typeof params?.data === "string" ? params.data : null;
	const nameParam = typeof params?.name === "string" ? params.name : null;

	const isShared = Boolean(listParam || sharedUser || sharedData);
	const cleanName = formatCleanDisplayName(nameParam);

	if (isShared) {
		const title = cleanName ? `${cleanName}'s Shared List` : "Shared List";
		return {
			title: `${title} | HookedOnMovies`,
			description: `Explore the shared list of movies and series${cleanName ? ` from ${cleanName}` : ""} on HookedOnMovies.`,
		};
	}

	return {
		title: "Watched Titles | HookedOnMovies",
		description: "Films and TV series you've completed. Filter, search, and share your list with friends.",
		alternates: {
			canonical: "/watched",
		},
	};
}

const WatchedPage = async ({ searchParams }: PageProps) => {
	const params = await searchParams;
	const listParam = typeof params?.list === "string" ? params.list : null;
	const sharedUserId = typeof params?.u === "string" ? params.u : null;
	const sharedData = typeof params?.data === "string" ? params.data : null;
	const nameParam = typeof params?.name === "string" ? params.name : null;

	let initialEntries: WatchedEntry[] = [];
	let isSharedView = false;
	const cleanName = formatCleanDisplayName(nameParam);

	// Case 1: Shared via clean ID string (e.g. ?list=m550,t1399) - NO whole titles/descriptions in URL!
	if (listParam) {
		isSharedView = true;
		initialEntries = await resolveSharedTitles(listParam);
	}
	// Case 2: Shared via User ID from Supabase
	else if (sharedUserId) {
		isSharedView = true;
		try {
			const rows = await getPublicWatchedTitles(sharedUserId);
			initialEntries = (rows || []).map((r: any) => ({
				id: r.tmdb_id,
				mediaType: r.media_type,
				title: r.title,
				posterPath: r.poster_path,
				addedAt: new Date(r.added_at).getTime() || 0,
			}));
		} catch {
			/* fallback to empty */
		}
	}
	// Case 3: Legacy shared data fallback
	else if (sharedData) {
		isSharedView = true;
		const decoded = decodeSharedWatched(sharedData);
		if (decoded) {
			initialEntries = decoded.items;
		}
	}
	// Case 4: Owner viewing their own watched collection
	else {
		try {
			const rows = await getWatchedTitles();
			initialEntries = (rows || []).map((r: any) => ({
				id: r.tmdb_id,
				mediaType: r.media_type,
				title: r.title,
				posterPath: r.poster_path,
				addedAt: new Date(r.added_at).getTime() || 0,
			}));
		} catch {
			/* guest or unauthenticated */
		}
	}

	const pageTitle = isSharedView
		? (cleanName ? `${cleanName}'s Shared List` : "Shared List")
		: "Watched Titles";

	const pageEyebrow = isSharedView ? "Shared collection" : "Your completed titles";

	const pageDescription = isSharedView
		? `Browse films and TV series completed by ${cleanName || "your friend"}.`
		: "Every movie and series you've marked as watched. Filter by category, search by title, or share your collection with friends.";

	return (
		<>
			<PageTitle
				title={pageTitle}
				eyebrow={pageEyebrow}
				description={pageDescription}
				size="md"
			/>
			<section className="shell pb-24 pt-4">
				<WatchedView
					initialEntries={initialEntries}
					isSharedView={isSharedView}
					sharedOwnerName={cleanName}
					listParam={listParam || undefined}
				/>
			</section>
		</>
	);
};

export default WatchedPage;
