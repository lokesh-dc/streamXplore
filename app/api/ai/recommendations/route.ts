import { generateText, tool, zodSchema } from "ai";
import { z } from "zod";

import { reasoningModel } from "@/lib/ai/models";
import { resolveMoodGenres, MOODS } from "@/lib/ai/moods";
import { MOVIE_GENRES, TV_GENRES } from "@/lib/ai/tmdb-context";
import type { AiPick, CurationRequest, CurationResponse } from "@/lib/ai/types";
import discoverMovies from "@/dataFetchings/discoverMovies";
import discoverTV from "@/dataFetchings/discoverTV";
import getMethod from "@/utils/methods/get";

export const runtime = "nodejs";
export const maxDuration = 60;

const json = (body: object, status: number) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

const REVERSE_MOVIE_GENRES: Record<number, string> = Object.fromEntries(
	Object.entries(MOVIE_GENRES).map(([name, id]) => [id, name])
);
const REVERSE_TV_GENRES: Record<number, string> = Object.fromEntries(
	Object.entries(TV_GENRES).map(([name, id]) => [id, name])
);

const YEAR_LABELS: [string, string][] = [
	["", "any era"],
	["2020", "2020 or newer"],
	["2010", "2010 or newer"],
	["2000", "2000 or newer"],
	["1990", "1990 or newer"],
];

interface Candidate {
	candidateId: number;
	id: number;
	title: string;
	mediaType: "movie" | "tv";
	year: string | null;
	voteAverage: number | null;
	popularity: number | null;
	genres: string[];
	overview: string | null;
	posterPath: string | null;
	backdropPath: string | null;
}

const toCandidates = (items: any[], mediaType: "movie" | "tv"): Candidate[] =>
	(items || [])
		.filter((item: any) => item.poster_path || item.backdrop_path)
		.map((item: any) => {
			const raw: number[] = (item.genre_ids || item.genres || []).map(
				(g: any) => (typeof g === "object" && g !== null ? g.id : g)
			);
			const reverse = mediaType === "tv" ? REVERSE_TV_GENRES : REVERSE_MOVIE_GENRES;
			const genres = raw
				.filter((id) => Number.isInteger(id))
				.map((id) => reverse[id])
				.filter(Boolean);

			return {
				candidateId: 0,
				id: item.id,
				title: item.title || item.name || "Unknown",
				mediaType,
				year: (item.release_date || item.first_air_date || "").split("-")[0] || null,
				voteAverage: typeof item.vote_average === "number" ? item.vote_average : null,
				popularity: typeof item.popularity === "number" ? item.popularity : null,
				genres,
				overview: item.overview || null,
				posterPath: item.poster_path || null,
				backdropPath: item.backdrop_path || null,
			};
		});

const buildPool = async (req: CurationRequest): Promise<Candidate[]> => {
	const pool: Candidate[] = [];
	const seen = new Set<string>();
	const pushUnique = (items: Candidate[]) => {
		for (const candidate of items) {
			const key = `${candidate.mediaType}-${candidate.id}`;
			if (seen.has(key)) continue;
			seen.add(key);
			pool.push(candidate);
		}
	};

	// Seed recommendations: titles the user already loves.
	if (req.seeds?.length) {
		await Promise.all(
			req.seeds.slice(0, 3).map(async (seed) => {
				try {
					const base = seed.mediaType === "tv" ? "/tv" : "/movie";
					const res = await getMethod({
						path: `${base}/${seed.id}/recommendations`,
					});
					pushUnique(toCandidates(res.data, seed.mediaType));
				} catch (error) {
					console.error("Seed recommendations failed:", error);
				}
			})
		);
	}

	// General discovery to fill the pool (mood + era + sort).
	try {
		const genreIds = resolveMoodGenres(req.moods);
		const genreParams = genreIds.length ? genreIds.join("|") : undefined;
		const [movieRes, tvRes] = await Promise.all([
			discoverMovies({
				genre: genreParams,
				sort_by: req.sort || "popularity.desc",
				year_gte: req.year || null,
			}),
			discoverTV({
				genre: genreParams,
				sort_by: req.sort || "popularity.desc",
				year_gte: req.year || null,
			}),
		]);
		pushUnique(toCandidates(movieRes.data, "movie"));
		pushUnique(toCandidates(tvRes.data, "tv"));
	} catch (error) {
		console.error("Discovery failed:", error);
	}

	// Shuffle so the model doesn't just pick the first items, then cap for tokens.
	pool.sort(() => Math.random() - 0.5);
	return pool.slice(0, 30);
};

const CuratePicksArgs = z.object({
	summary: z
		.string()
		.describe(
			"A single playful one-liner summarizing the kind of night this shortlist sets up (e.g. 'Gritty heist energy with a sci-fi twist')."
		),
	picks: z
		.array(
			z.object({
				candidateId: z
					.number()
					.int()
					.min(0)
					.describe(
						"The exact candidateId from the provided candidate list. Never invent an id that isn't in the list."
					),
				reason: z
					.string()
					.describe(
						"One punchy sentence (max ~20 words) explaining why this pick fits the user's moods, era and favorite titles."
					),
			})
		)
		.min(3)
		.max(6),
});

const pickFromCandidate = (candidate: Candidate): AiPick => ({
	id: candidate.id,
	title: candidate.title,
	mediaType: candidate.mediaType,
	year: candidate.year,
	voteAverage: candidate.voteAverage,
	genres: candidate.genres,
	overview: candidate.overview,
	posterPath: candidate.posterPath,
	backdropPath: candidate.backdropPath,
	reason: "",
});

export async function POST(req: Request) {
	let body: CurationRequest;
	try {
		body = (await req.json()) as CurationRequest;
	} catch {
		return json({ error: "Invalid request body." }, 400);
	}

	const moods = Array.isArray(body?.moods) ? body.moods : [];
	const seeds = Array.isArray(body?.seeds) ? body.seeds.slice(0, 3) : [];
	const year = typeof body?.year === "string" ? body.year : "";
	const sort = typeof body?.sort === "string" ? body.sort : "popularity.desc";

	const pool = await buildPool({ moods, seeds, year, sort });

	if (!pool.length) {
		return json(
			{ aiGenerated: false, summary: "Nothing in the vault matched tonight.", picks: [] },
			200
		);
	}

	const moodLabel =
		moods.length > 0
			? MOODS.filter((m) => moods.includes(m.id))
					.map((m) => m.name)
					.join(", ")
			: "open to anything";
	const seedLabel =
		seeds.map((s) => s.title).filter(Boolean).join(", ") || "no favorites shared";
	const eraLabel = YEAR_LABELS.find(([value]) => value === year)?.[1] || "any era";

	const candidateIndex = new Map<number, Candidate>();
	pool.forEach((candidate, index) => {
		candidate.candidateId = index;
		candidateIndex.set(index, candidate);
	});

	const candidateSnapshot = pool.map((c) => ({
		candidateId: c.candidateId,
		title: c.title,
		type: c.mediaType,
		year: c.year,
		rating: c.voteAverage,
		genres: c.genres.slice(0, 3),
		overview: (c.overview || "").slice(0, 110),
	}));

	const userPrompt = `User brief:
- Moods: ${moodLabel}
- Favorites (seeds): ${seedLabel}
- Era: ${eraLabel}

Candidate pool (${pool.length} titles):
${JSON.stringify(candidateSnapshot)}

Curate the best shortlist of 3-6 titles by calling curate_picks exactly once. Pick genuinely great, distinct titles that fit the brief — never choose something just because it's popular. Choose variety across the pool. For every pick use the exact candidateId from the list above and write one punchy reason tied to their moods/era/favorites.`;

	let summary = "";
	let chosen: { candidateId: number; reason: string }[] = [];

	if (process.env.GROQ_API_KEY) {
		try {
			const result = await generateText({
				model: reasoningModel(),
				tools: {
					curate_picks: tool({
						description:
							"Submit the final human-readable curation: a one-line summary plus the ranked picks (candidateId + reason). Call exactly once.",
						inputSchema: zodSchema(CuratePicksArgs),
						execute: async () => ({ ok: true }),
					}),
				},
				messages: [
					{
						role: "system",
						content:
							"You are the curation brain behind Hooked AI. You rank titles for a user based on a brief. RULES: only pick titles from the candidate pool using their exact candidateId; never fabricate titles or ids; make the reasons specific and personal, one punchy sentence each; cap at 6 picks and prefer 5-6. Respond ONLY by calling curate_picks.",
					},
					{ role: "user", content: userPrompt },
				],
			});

			const toolResult = result.toolResults?.find((r) => r.toolName === "curate_picks");
			const parsed = toolResult?.input as unknown as {
				summary?: string;
				picks?: { candidateId: number; reason: string }[];
			};
			if (parsed?.picks) {
				summary = parsed.summary || "";
				chosen = parsed.picks;
			}
		} catch (error) {
			console.error("AI curation failed:", error);
		}
	}

	const picks: AiPick[] = [];
	for (const entry of chosen) {
		const candidate = candidateIndex.get(entry.candidateId);
		if (!candidate) continue;
		const pick = pickFromCandidate(candidate);
		pick.reason = entry.reason || "";
		picks.push(pick);
	}

	const aiGenerated = picks.length >= 3;

	if (!aiGenerated) {
		const fallbackReasons = [
			"Top-rated pick that matches your vibe.",
			"Crowd favorite — great entry point.",
			"Fresh, critically loved, and fits the brief.",
			"Premium pick with a killer cast.",
			"Underrated gem worth your night.",
			"High-octane standout the algorithm loves too.",
		];
		const fallback = pool
			.slice()
			.sort((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0))
			.slice(0, 6)
			.map((candidate, index) => {
				const pick = pickFromCandidate(candidate);
				pick.reason = fallbackReasons[index] || fallbackReasons[0];
				return pick;
			});
		summary = `Night of ${moodLabel.toLowerCase()}`;
		return json(
			{ aiGenerated: false, summary, picks: fallback } as CurationResponse,
			200
		);
	}

	const response: CurationResponse = { aiGenerated: true, summary: summary || `A night of ${moodLabel.toLowerCase()}`, picks: picks.slice(0, 6) };
	return json(response, 200);
}