import { useEffect } from "react";

/**
 * Hook to lock body scroll when a modal is open.
 * Handles multiple simultaneous locks using a counter.
 */
let lockedCount = 0;

export const useBodyLock = (isLocked: boolean = true) => {
	useEffect(() => {
		if (!isLocked) return;

		lockedCount++;
		const originalStyle = window.getComputedStyle(document.body).overflow;
		document.body.style.overflow = "hidden";
		
		// Also prevent overscroll/chaining on mobile
		document.body.style.overscrollBehavior = "none";

		return () => {
			lockedCount--;
			if (lockedCount <= 0) {
				document.body.style.overflow = "auto";
				document.body.style.overscrollBehavior = "auto";
			}
		};
	}, [isLocked]);
};
