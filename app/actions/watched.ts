"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
