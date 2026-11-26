import { Metadata } from "next";

import PageTitle from "@/components/ui/PageTitle";
import WatchlistView from "@/components/ui/watchlist/WatchlistView";
import { getWatchlist } from "@/app/actions/watchlist";
import type { WatchlistEntry } from "@/lib/watchlist";

export const metadata: Metadata = {
	title: "My Watchlist",
	description: "Films and series you've saved to watch later.",
	alternates: {
		canonical: "/watchlist",
	},
};

const WatchlistPage = async () => {
	let initialEntries: WatchlistEntry[] = [];
	try {
		const rows = await getWatchlist();
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

	return (
		<>
			<PageTitle
				title="My Watchlist"
				eyebrow="Your library"
				description="Everything you've saved, in one place. Add titles from any film or series page."
			/>
			<section className="shell pb-24 pt-4">
				<WatchlistView initialEntries={initialEntries} />
			</section>
		</>
	);
};

export default WatchlistPage;
