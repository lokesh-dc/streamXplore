"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  type MotionProps,
} from "framer-motion";
import { FiArrowRight, FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";

import { createClient } from "@/lib/supabase/client";
import { getImageBaseLink } from "@/constants";
import { motionTokens } from "@/lib/motion";
import type { AuthVisual } from "@/dataFetchings/authVisuals";

const EMPTY_VISUAL: AuthVisual = { posters: [], backdrop: null };

/* Slight filmstrip stagger so the poster row reads as a shelf, not a grid. */
const TILT = [-4, 3, -2, 4, -3, 2];
const LIFT = [10, 0, 14, 4, 12, 2];

const fieldStyles =
  "w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-text-primary placeholder:text-white/45 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40";

const pillButton =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0908] disabled:pointer-events-none disabled:opacity-60";

/**
 * Login / signup screen.
 * Split layout: a cinematic panel with real TMDB artwork on the left,
 * the form on the right. Falls back to type-only when artwork is missing.
 * Radius rule for this screen: controls are 16px (rounded-md), the
 * password reveal control is a full pill, matching the app's chip style.
 */
export default function AuthForm({
  mode,
  visuals = EMPTY_VISUAL,
}: {
  mode: "login" | "signup";
  visuals?: AuthVisual;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();
  const reduce = useReducedMotion();

  const emailId = useId();
  const passwordId = useId();
  const passwordHelpId = useId();

  const isLogin = mode === "login";
  const { posters, backdrop } = visuals;

  const enter = (delay: number): MotionProps =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: {
            opacity: 1,
            y: 0,
            transition: {
              duration: motionTokens.durations.slow,
              delay,
              ease: motionTokens.easings.smooth,
            },
          },
        };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        setNotice("Check your email for the confirmation link.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-[100dvh] w-full overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
      {/* ------------------------------ artwork panel ------------------------------ */}
      <div className="relative isolate flex min-h-[36vh] flex-col justify-end overflow-hidden lg:min-h-full">
        {backdrop ? (
          <Image
            unoptimized
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            src={getImageBaseLink({
              type: "backdrop",
              quality: "lg",
              path: backdrop,
            })}
            alt=""
            className="object-cover object-[center_28%]"
          />
        ) : null}

        {/* Scrims: bottom-up for type legibility, plus a right-edge blend on desktop. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,#0a0908_3%,rgba(10,9,8,0.74)_34%,rgba(10,9,8,0.32)_78%,rgba(10,9,8,0.45)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden lg:block bg-[linear-gradient(to_right,transparent_54%,rgba(10,9,8,0.86)_86%,#0a0908_100%)]"
        />

        <div className="relative z-10 flex flex-col gap-5 px-6 pb-10 pt-28 sm:px-10 lg:px-14 lg:pb-16 lg:pt-32">
          <motion.p
            {...enter(0.05)}
            className="max-w-[15ch] font-display text-[2.6rem] leading-[0.92] text-text-primary sm:text-6xl lg:text-7xl">
            {isLogin
              ? "Pick up where you left off."
              : "Your watchlist, in one place."}
          </motion.p>

          <motion.p
            {...enter(0.12)}
            className="max-w-sm text-sm leading-relaxed text-text-secondary">
            {isLogin
              ? "Your saved titles, the people you follow, and every credit you have ticked off follow you to any device."
              : "Save films and series, follow actors, and tick off every credit on their filmography."}
          </motion.p>

          {posters.length ? (
            <motion.ul
              {...enter(0.18)}
              aria-hidden="true"
              className="mt-3 flex gap-2.5 overflow-hidden">
              {posters.map((poster, index) => (
                <li
                  key={`${poster.src}-${index}`}
                  style={{
                    transform: `rotate(${TILT[index % TILT.length]}deg) translateY(${LIFT[index % LIFT.length]}px)`,
                  }}
                  className={`h-[7.5rem] w-20 shrink-0 overflow-hidden rounded-md border border-white/10 shadow-lg shadow-black/50 lg:h-36 lg:w-24 ${
                    index > 3 ? "hidden sm:block" : ""
                  }`}>
                  <Image
                    unoptimized
                    width={96}
                    height={144}
                    src={getImageBaseLink({
                      type: "poster",
                      quality: "md",
                      path: poster.src,
                    })}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </li>
              ))}
            </motion.ul>
          ) : null}
        </div>
      </div>

      {/* -------------------------------- form panel -------------------------------- */}
      <div className="relative flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 lg:py-16 lg:pt-[calc(var(--nav-h,72px)+2.5rem)]">
        <motion.div {...enter(0.1)} className="mx-auto w-full max-w-[26rem]">
          <span className="eyebrow">Account</span>

          <h1 className="mt-3 font-display text-5xl leading-none text-text-primary sm:text-6xl">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
            {isLogin
              ? "Sign in to reach your watchlist and tracking."
              : "One account, synced across every device you watch on."}
          </p>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className={`${pillButton} group mt-8 flex w-full items-center justify-center gap-3 rounded-md border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-white/25 hover:bg-white/[0.07] active:scale-[0.99]`}>
            <svg
              className="h-[18px] w-[18px] shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-7" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <div className="hairline w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0f0d0c] px-3 text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">
                or
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor={emailId}
                className="text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                id={emailId}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={fieldStyles}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={passwordId}
                className="text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={reveal ? "text" : "password"}
                  name="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  aria-describedby={isLogin ? undefined : passwordHelpId}
                  className={`${fieldStyles} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setReveal((v) => !v)}
                  aria-label={reveal ? "Hide password" : "Show password"}
                  aria-pressed={reveal}
                  className={`${pillButton} absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary`}>
                  {reveal ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {isLogin ? null : (
                <p id={passwordHelpId} className="text-xs text-text-secondary">
                  At least 6 characters.
                </p>
              )}
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-200">
                {error}
              </p>
            ) : notice ? (
              <p
                role="status"
                className="rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm leading-relaxed text-[#ffb59a]">
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className={`${pillButton} mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-[#0a0908] transition-colors hover:bg-[#ff5f27] active:scale-[0.99]`}>
              {loading ? (
                <>
                  <FiRefreshCw className="animate-spin" aria-hidden="true" />
                  {isLogin ? "Signing in" : "Creating account"}
                </>
              ) : (
                <>
                  {isLogin ? "Sign in" : "Create account"}
                  <FiArrowRight aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-text-secondary">
            {isLogin ? "New to HookedOnMovies?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="font-semibold text-primary underline-offset-4 transition-colors hover:text-[#ff7a4d] hover:underline">
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
