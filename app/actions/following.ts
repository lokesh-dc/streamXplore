"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FollowedPersonInput {
  personId: number;
  name: string;
  profilePath: string | null;
  department: string | null;
}

export async function getFollowedPeople() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("followed_people")
    .select("*")
    .order("added_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function isFollowingPerson(personId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("followed_people")
    .select("id")
    .eq("user_id", user.id)
    .eq("person_id", personId)
    .maybeSingle();
  return !!data;
}

export async function toggleFollowPerson(input: FollowedPersonInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("followed_people")
    .select("id")
    .eq("user_id", user.id)
    .eq("person_id", input.personId)
    .maybeSingle();

  if (existing) {
    await supabase.from("followed_people").delete().eq("id", existing.id);
    revalidatePath("/following");
    revalidatePath(`/person/[title]/[id]`);
    return false;
  } else {
    await supabase.from("followed_people").insert({
      user_id: user.id,
      person_id: input.personId,
      name: input.name,
      profile_path: input.profilePath,
      known_for_department: input.department,
    });
    revalidatePath("/following");
    revalidatePath(`/person/[title]/[id]`);
    return true;
  }
}

export async function removeFollowedPerson(personId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("followed_people")
    .delete()
    .eq("user_id", user.id)
    .eq("person_id", personId);
  revalidatePath("/following");
}
