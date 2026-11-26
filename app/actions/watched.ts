"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import getMovieDetails from "@/dataFetchings/getMovieDetails";
import getTvSeriesDetails from "@/dataFetchings/getTVSeriesDetails";
import { decodeSharedIds, type WatchedEntry } from "@/lib/watched";

export interface WatchedTitleInput {
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
}

export async function isWatchedTitle(mediaType: "movie" | "tv", tmdbId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    const { data } = await supabase
      .from("watched_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("media_type", mediaType)
      .eq("tmdb_id", tmdbId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function toggleWatchedTitle(input: WatchedTitleInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  try {
    const { data: existing } = await supabase
      .from("watched_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("media_type", input.mediaType)
      .eq("tmdb_id", input.tmdbId)
      .maybeSingle();

    if (existing) {
      await supabase.from("watched_items").delete().eq("id", existing.id);
      revalidatePath(`/${input.mediaType}/[title]/[id]`);
      return false;
    } else {
      await supabase.from("watched_items").insert({
        user_id: user.id,
        media_type: input.mediaType,
        tmdb_id: input.tmdbId,
        title: input.title,
        poster_path: input.posterPath,
        backdrop_path: input.backdropPath || null,
      });
      revalidatePath(`/${input.mediaType}/[title]/[id]`);
      return true;
    }
  } catch (err) {
    console.error("Watched item database sync error:", err);
    throw err;
  }
}

export async function getWatchedTitles() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data } = await supabase
      .from("watched_items")
      .select("*")
      .order("added_at", { ascending: false });

    return data || [];
  } catch {
    return [];
  }
}

export async function getPublicWatchedTitles(userId: string) {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("watched_items")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    return data || [];
  } catch (err) {
    console.error("Error fetching public watched titles:", err);
    return [];
  }
}

/** Resolves compact shared ID list (e.g. "m550,t1399") into full TMDB titles for public shared view. */
export async function resolveSharedTitles(listParam: string): Promise<WatchedEntry[]> {
  const parsedIds = decodeSharedIds(listParam);
  if (!parsedIds.length) return [];

  const fetched = await Promise.all(
    parsedIds.slice(0, 100).map(async ({ id, mediaType }) => {
      try {
        if (mediaType === "movie") {
          const movie = await getMovieDetails(id);
          if (!movie || movie.success === false) return null;
          return {
            id,
            mediaType: "movie" as const,
            title: movie.title || movie.original_title || "Untitled",
            posterPath: movie.poster_path || null,
            addedAt: Date.now(),
          };
        } else {
          const tv = await getTvSeriesDetails(id);
          if (!tv || tv.success === false) return null;
          return {
            id,
            mediaType: "tv" as const,
            title: tv.name || tv.original_name || "Untitled",
            posterPath: tv.poster_path || null,
            addedAt: Date.now(),
          };
        }
      } catch {
        return null;
      }
    }),
  );

  return fetched.filter((item): item is WatchedEntry => item !== null);
}

export async function clearWatchedTitles() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("watched_items").delete().eq("user_id", user.id);
    revalidatePath("/watched");
  } catch (err) {
    console.error("Clear watched error:", err);
  }
}

export async function removeFromWatchedTitle(mediaType: "movie" | "tv", tmdbId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase
      .from("watched_items")
      .delete()
      .eq("user_id", user.id)
      .eq("media_type", mediaType)
      .eq("tmdb_id", tmdbId);
    revalidatePath(`/${mediaType}/[title]/[id]`);
  } catch (err) {
    console.error("Remove from watched error:", err);
  }
}

export async function getWatchedCredits(personId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("person_watched_credits")
    .select("media_type, tmdb_id")
    .eq("user_id", user.id)
    .eq("person_id", personId);

  if (!data) return [];
  return data.map((d) => `${d.media_type}-${d.tmdb_id}`);
}

export async function toggleWatchedCredit(
  personId: number,
  mediaType: "movie" | "tv",
  tmdbId: number,
  title: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const key = `${mediaType}-${tmdbId}`;
  const { data: existing } = await supabase
    .from("person_watched_credits")
    .select("id")
    .eq("user_id", user.id)
    .eq("person_id", personId)
    .eq("media_type", mediaType)
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (existing) {
    await supabase.from("person_watched_credits").delete().eq("id", existing.id);
    revalidatePath(`/person/[title]/[id]`);
    revalidatePath("/following");
    return false;
  } else {
    await supabase.from("person_watched_credits").insert({
      user_id: user.id,
      person_id: personId,
      media_type: mediaType,
      tmdb_id: tmdbId,
      title,
    });
    revalidatePath(`/person/[title]/[id]`);
    revalidatePath("/following");
    return true;
  }
}

export async function setAllWatched(
  personId: number,
  credits: Array<{ mediaType: "movie" | "tv"; tmdbId: number; title: string }>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("person_watched_credits")
    .select("media_type, tmdb_id")
    .eq("user_id", user.id)
    .eq("person_id", personId);

  const existingSet = new Set(
    (existing || []).map((e) => `${e.media_type}-${e.tmdb_id}`)
  );
  const toInsert = credits
    .filter((c) => !existingSet.has(`${c.mediaType}-${c.tmdbId}`))
    .map((c) => ({
      user_id: user.id,
      person_id: personId,
      media_type: c.mediaType,
      tmdb_id: c.tmdbId,
      title: c.title,
    }));

  if (toInsert.length > 0) {
    await supabase.from("person_watched_credits").insert(toInsert);
  }
  revalidatePath(`/person/[title]/[id]`);
  revalidatePath("/following");
}
