"use client";

import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Shared auth state. Reads from the single AuthProvider mounted in the root
 * layout — one `getUser()` network call per app session, not per component.
 */
export function useUser() {
	return useAuth();
}
