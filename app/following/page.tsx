import { Metadata } from "next";

import PageTitle from "@/components/ui/PageTitle";
import FollowingView from "@/components/ui/following/FollowingView";
import { getFollowedPeople } from "@/app/actions/following";
import type { FollowedPerson } from "@/lib/following";

export const metadata: Metadata = {
	title: "Tracking",
	description:
		"People you follow — tick off every film and series until you hit 100%.",
	alternates: {
		canonical: "/following",
	},
};

const FollowingPage = async () => {
	let initialPeople: FollowedPerson[] = [];
	try {
		const rows = await getFollowedPeople();
		initialPeople = (rows || []).map((r: any) => ({
			id: r.person_id,
			name: r.name,
			profilePath: r.profile_path,
			department: r.known_for_department,
			addedAt: new Date(r.added_at).getTime() || 0,
		}));
	} catch {
		/* guest or unauthenticated */
	}

	return (
		<>
			<PageTitle
				title="Tracking"
				eyebrow="Filmography tracker"
				description="Follow anyone — actors, directors, writers, composers — then mark titles watched right on their film and series posters. Not a watchlist — a completion run."
			/>
			<section className="shell pb-24 pt-4">
				<FollowingView initialPeople={initialPeople} />
			</section>
		</>
	);
};

export default FollowingPage;
