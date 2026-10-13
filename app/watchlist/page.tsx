import { Metadata } from "next";

import PageTitle from "@/components/ui/PageTitle";
import WatchlistView from "@/components/ui/watchlist/WatchlistView";

export const metadata: Metadata = {
	title: "My Watchlist",
	description: "Films and series you've saved to watch later.",
	alternates: {
		canonical: "/watchlist",
	},
};

const WatchlistPage = () => (
	<>
		<PageTitle
			title="My Watchlist"
			eyebrow="Your library"
			description="Everything you've saved, in one place. Add titles from any film or series page."
		/>
		<section className="shell pb-24 pt-4">
			<WatchlistView />
		</section>
	</>
);

export default WatchlistPage;
