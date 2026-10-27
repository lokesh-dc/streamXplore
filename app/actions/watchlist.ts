"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface WatchlistInput {
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
}

export async function getWatchlist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("watchlist_items")
    .select("*")
    .order("added_at", { ascending: false });

  return data || [];
}

export async function isInWatchlist(mediaType: "movie" | "tv", tmdbId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("watchlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("media_type", mediaType)
    .eq("tmdb_id", tmdbId)
    .maybeSingle();
  return !!data;
}

export async function toggleWatchlist(input: WatchlistInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("media_type", input.mediaType)
    .eq("tmdb_id", input.tmdbId)
    .maybeSingle();

  if (existing) {
    await supabase.from("watchlist_items").delete().eq("id", existing.id);
    revalidatePath("/watchlist");
    return false;
  } else {
    await supabase.from("watchlist_items").insert({
      user_id: user.id,
      media_type: input.mediaType,
      tmdb_id: input.tmdbId,
      title: input.title,
      poster_path: input.posterPath,
      backdrop_path: input.backdropPath || null,
    });
    revalidatePath("/watchlist");
    return true;
  }
}

export async function removeFromWatchlist(mediaType: "movie" | "tv", tmdbId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("watchlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("media_type", mediaType)
    .eq("tmdb_id", tmdbId);
  revalidatePath("/watchlist");
}

export async function clearWatchlist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("watchlist_items").delete().eq("user_id", user.id);
  revalidatePath("/watchlist");
}
