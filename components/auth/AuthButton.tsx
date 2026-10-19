"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { BiUser, BiLogOut } from "react-icons/bi";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link href="/login" className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:text-primary transition-colors">
        <BiUser size={20} />
        <span className="hidden md:inline">Sign In</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary hidden lg:inline truncate max-w-[120px]">
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
        title="Sign out"
      >
        <BiLogOut size={20} />
        <span className="hidden md:inline">Sign Out</span>
      </button>
    </div>
  );
}
