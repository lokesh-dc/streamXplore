import getPersonDetails from "@/dataFetchings/getPersonDetails";

export const runtime = "nodejs";

const json = (body: object, status: number) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

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

const JOB_PRIORITY = [
	"Director",
	"Creator",
	"Writer",
	"Screenplay",
	"Story",
	"Producer",
	"Executive Producer",
	"Director of Photography",
	"Original Music Composer",
	"Editor",
	"Casting",
];

const jobRank = (job: string | null) => {
	if (!job) return JOB_PRIORITY.length;
	const i = JOB_PRIORITY.indexOf(job);
	return i === -1 ? JOB_PRIORITY.length : i;
};

/**
 * GET /api/person/credits?id=123
 * Returns a deduped, normalized filmography for the filmography tracker.
 * Cast + directing/crew jobs merged so one title appears once.
 */
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");

	if (!id || !/^\d+$/.test(id)) {
		return json({ error: "A numeric person id is required." }, 400);
	}

	const data = await getPersonDetails(
		id,
		"movie_credits,tv_credits",
	);

	if (!data || data.success === false) {
		return json({ error: "Person not found." }, 404);
	}

	const films: Credit[] = [];
	const series: Credit[] = [];

	const push = (
		mediaType: "movie" | "tv",
		item: any,
		role: "cast" | "crew",
	) => {
		const title = item.title || item.name;
		if (!title || !item.id) return;
		const date = item.release_date || item.first_air_date || null;
		(mediaType === "movie" ? films : series).push({
			mediaType,
			id: item.id,
			title,
			posterPath: item.poster_path || null,
			date,
			year: date ? String(date).slice(0, 4) : null,
			rating: typeof item.vote_average === "number" ? item.vote_average : 0,
			voteCount: typeof item.vote_count === "number" ? item.vote_count : 0,
			role,
			character: item.character || null,
			job: item.job || null,
			department: item.department || null,
		});
	};

	(data.movie_credits?.cast || []).forEach((c: any) => push("movie", c, "cast"));
	(data.movie_credits?.crew || []).forEach((c: any) => push("movie", c, "crew"));
	(data.tv_credits?.cast || []).forEach((c: any) => push("tv", c, "cast"));
	(data.tv_credits?.crew || []).forEach((c: any) => push("tv", c, "crew"));

	// Dedupe: same title may appear as both cast + crew (e.g. actor-director).
	const dedupe = (items: Credit[]): Credit[] => {
		const groups = new Map<string, Credit[]>();
		for (const item of items) {
			const key = `${item.mediaType}-${item.id}`;
			const g = groups.get(key);
			if (g) g.push(item);
			else groups.set(key, [item]);
		}
		const merged: Credit[] = [];
		for (const group of Array.from(groups.values())) {
			if (group.length === 1) {
				merged.push(group[0]);
				continue;
			}
			const cast = group.find((c: Credit) => c.role === "cast");
			const crew = group
				.filter((c: Credit) => c.role === "crew" && c.job)
				.sort((a: Credit, b: Credit) => jobRank(a.job) - jobRank(b.job))[0];
			const base = cast || crew || group[0];
			merged.push({
				...base,
				role: cast ? "cast" : "crew",
				character: group.map((c: Credit) => c.character).find(Boolean) ?? null,
				job: group.map((c: Credit) => c.job).find(Boolean) ?? null,
				department: group.map((c: Credit) => c.department).find(Boolean) ?? null,
				rating: Math.max(...group.map((c: Credit) => c.rating)),
				voteCount: Math.max(...group.map((c: Credit) => c.voteCount)),
			});
		}
		return merged;
	};

	const sortDesc = (a: Credit, b: Credit) => {
		if (a.date && b.date) return String(b.date).localeCompare(String(a.date));
		if (a.date) return -1;
		if (b.date) return 1;
		return b.voteCount - a.voteCount;
	};

	const dedupedFilms = dedupe(films).sort(sortDesc);
	const dedupedSeries = dedupe(series).sort(sortDesc);

	return json(
		{
			id: Number(id),
			name: data.name ?? null,
			films: dedupedFilms,
			series: dedupedSeries,
			total: dedupedFilms.length + dedupedSeries.length,
		},
		200,
	);
}
