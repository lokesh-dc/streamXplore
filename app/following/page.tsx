import { Metadata } from "next";

import PageTitle from "@/components/ui/PageTitle";
import FollowingView from "@/components/ui/following/FollowingView";

export const metadata: Metadata = {
	title: "Tracking",
	description:
		"People you follow — tick off every film and series until you hit 100%.",
	alternates: {
		canonical: "/following",
	},
};

const FollowingPage = () => (
	<>
		<PageTitle
			title="Tracking"
			eyebrow="Filmography tracker"
			description="Follow anyone — actors, directors, writers, composers — then mark titles watched right on their film and series posters. Not a watchlist — a completion run."
		/>
		<section className="shell pb-24 pt-4">
			<FollowingView />
		</section>
	</>
);

export default FollowingPage;
