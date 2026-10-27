import { Metadata } from "next";

import getPersonDetails from "@/dataFetchings/getPersonDetails";
import PersonDetail from "@/components/ui/person/PersonDetail";
import TitleNotFound from "@/components/ui/TitleNotFound";
import { getImageBaseLink } from "@/constants";

interface PageProps {
	params: Promise<{
		title: string;
		id: string;
	}>;
}

const APPEND_TO_RESPONSE = "external_ids,movie_credits,tv_credits";

/**
 * Fetches person details with combined credits for the server component.
 */
async function getPageData(id: string) {
	const data = await getPersonDetails(id, APPEND_TO_RESPONSE);

	if (!data || data.success === false) return null;
	return data;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id, title: urlTitle } = await params;
	const data = await getPersonDetails(id, APPEND_TO_RESPONSE);

	if (!data || data.success === false) {
		return {
			title: "Person Not Found",
		};
	}

	const name = data.name || "Unknown";
	const description =
		data.biography?.slice(0, 160) ||
		`Films and series featuring ${name}.`;
	const image = data.profile_path
		? getImageBaseLink({
				type: "profile",
				quality: "lg",
				path: data.profile_path,
			})
		: null;

	return {
		title: name,
		description: description,
		alternates: {
			canonical: `/person/${urlTitle}/${id}`,
		},
		openGraph: {
			title: name,
			description: description,
			type: "profile",
			url: `/person/${urlTitle}/${id}`,
			images: image
				? [
						{
							url: image,
							width: 632,
							height: 948,
							alt: name,
						},
					]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title: name,
			description: description,
			images: image ? [image] : [],
		},
	};
}

const PersonPage = async ({ params }: PageProps) => {
	const { id } = await params;
	const data = await getPageData(id);

	if (!data) {
		return <TitleNotFound kind="person" />;
	}

	const name = data.name || "Unknown";

	const jsonLd: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: name,
		image: data.profile_path
			? getImageBaseLink({
					type: "profile",
					quality: "lg",
					path: data.profile_path,
				})
			: undefined,
		description: data.biography?.slice(0, 500),
		birthDate: data.birthday || undefined,
	};
	if (data.deathday) jsonLd.deathDate = data.deathday;
	if (data.place_of_birth) jsonLd.birthPlace = data.place_of_birth;
	if (data.homepage) jsonLd.url = data.homepage;

	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://hookedonmovies-app.vercel.app",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: name,
				item: `https://hookedonmovies-app.vercel.app/person/${encodeURIComponent(name)}/${id}`,
			},
		],
	};

	return (
		<div className="flex flex-col pb-5">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>
			<PersonDetail data={data} />
		</div>
	);
};

export default PersonPage;