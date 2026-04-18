import { Metadata } from "next";
import { redirect } from "next/navigation";

import getTvSeriesDetails from "@/dataFetchings/getTVSeriesDetails";
import DetailV2 from "@/components/ui/detail/DetailV2";
import MoviesContainer from "@/components/containers/MoviesContainer";

interface PageProps {
	params: Promise<{
		title: string;
		id: string;
	}>;
}

/**
 * Fetches and transforms TV series details for the server component.
 */
async function getPageData(id: string) {
	const details = await getTvSeriesDetails(
		id,
		"videos,credits,images,recommendations",
	);

	if (!details || details.success === false) return null;

	if (details.adult) {
		redirect("/popular");
	}

	return details;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { title } = await params;
	return {
		title: decodeURIComponent(title),
	};
}

const TVSeriesPage = async ({ params }: PageProps) => {
	const { id } = await params;
	const data = await getPageData(id);

	if (!data) {
		return <div className="p-10 text-center">Series not found</div>;
	}

	const {
		credits,
		videos,
		recommendations,
	} = data;

	return (
		<div className="flex flex-col gap-3 pb-5 bg-[#121212]">
			<DetailV2 
				data={data} 
				credits={credits} 
				videos={videos?.results} 
				isTv={true}
			/>
			<div className="default_screen_padding mb-4">
				<MoviesContainer
					data={recommendations?.results}
					title="Recommendations"
				/>
			</div>
		</div>
	);
};

export default TVSeriesPage;
