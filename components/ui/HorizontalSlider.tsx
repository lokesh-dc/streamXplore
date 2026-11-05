"use client";

import React, {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "@/styles/MovieContainer.module.css";

export interface HorizontalSliderProps {
	children: ReactNode;
	/** Gap between items in pixels (default: 18) */
	gap?: number;
	/** Extra class names for the outer wrapper */
	className?: string;
	/** Extra class names for the scrollable track */
	trackClassName?: string;
	/** Extra class names for each item wrapper */
	itemClassName?: string;
	/** Whether to fade the left/right edges when scrollable in that direction (default: true) */
	fadeEdges?: boolean;
	/** Whether to show Prev/Next arrow buttons on desktop hover (default: true) */
	showArrows?: boolean;
	/** Accessible label for the slider region */
	ariaLabel?: string;
}

const DRAG_THRESHOLD_PX = 6;
const FRICTION = 0.94;
const MIN_VELOCITY = 0.35;

const HorizontalSlider: React.FC<HorizontalSliderProps> = ({
	children,
	gap = 18,
	className = "",
	trackClassName = "",
	itemClassName = "",
	fadeEdges = true,
	showArrows = true,
	ariaLabel,
}) => {
	const scrollerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const stateRef = useRef({
		canLeft: false,
		canRight: false,
		pointerDown: false,
		dragged: false,
		suppressClick: false,
		startX: 0,
		startScrollLeft: 0,
		lastX: 0,
		lastTime: 0,
		velocity: 0,
		rafId: 0 as number,
		scrollEndTimer: 0 as number,
	});

	const stopMomentum = useCallback(() => {
		if (stateRef.current.rafId) {
			cancelAnimationFrame(stateRef.current.rafId);
			stateRef.current.rafId = 0;
		}
	}, []);

	const updateEdges = useCallback(() => {
		const el = scrollerRef.current;
		if (!el) return;
		const maxScroll = el.scrollWidth - el.clientWidth;
		const nextLeft = el.scrollLeft > 4;
		const nextRight = maxScroll - el.scrollLeft > 4;

		if (stateRef.current.canLeft !== nextLeft) {
			stateRef.current.canLeft = nextLeft;
			setCanScrollLeft(nextLeft);
		}
		if (stateRef.current.canRight !== nextRight) {
			stateRef.current.canRight = nextRight;
			setCanScrollRight(nextRight);
		}
	}, []);

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;

		updateEdges();

		const supportsScrollEnd = "onscrollend" in window;

		const onScroll = () => {
			updateEdges();
			if (!supportsScrollEnd) {
				window.clearTimeout(stateRef.current.scrollEndTimer);
				stateRef.current.scrollEndTimer = window.setTimeout(() => {
					el.dispatchEvent(new CustomEvent("scrollend"));
				}, 100);
			}
		};

		const onScrollEnd = () => {
			updateEdges();
		};

		el.addEventListener("scroll", onScroll, { passive: true });
		el.addEventListener("scrollend", onScrollEnd, { passive: true });

		const ro = new ResizeObserver(() => {
			updateEdges();
		});
		ro.observe(el);

		return () => {
			el.removeEventListener("scroll", onScroll);
			el.removeEventListener("scrollend", onScrollEnd);
			window.clearTimeout(stateRef.current.scrollEndTimer);
			ro.disconnect();
			stopMomentum();
		};
	}, [updateEdges, stopMomentum, children]);

	useEffect(() => {
		const onWindowPointerMove = (e: PointerEvent) => {
			const st = stateRef.current;
			if (!st.pointerDown) return;
			const el = scrollerRef.current;
			if (!el) return;

			const dx = e.clientX - st.startX;
			if (!st.dragged && Math.abs(dx) > DRAG_THRESHOLD_PX) {
				st.dragged = true;
				st.suppressClick = true;
				setIsDragging(true);
			}

			if (st.dragged) {
				const now = performance.now();
				const dt = Math.max(1, now - st.lastTime);
				const stepX = e.clientX - st.lastX;
				// Exponential moving average of velocity in px/frame (~16ms)
				const instantVel = (stepX / dt) * 16;
				st.velocity = st.velocity * 0.4 + instantVel * 0.6;
				st.lastX = e.clientX;
				st.lastTime = now;

				el.scrollLeft = st.startScrollLeft - dx;
			}
		};

		const onWindowPointerUp = () => {
			const st = stateRef.current;
			if (!st.pointerDown) return;
			st.pointerDown = false;

			if (st.dragged) {
				st.dragged = false;
				setIsDragging(false);

				// Apply smooth inertia coasting for mouse drag flicks
				const now = performance.now();
				if (now - st.lastTime > 80) {
					st.velocity = 0;
				}

				const stepMomentum = () => {
					const el = scrollerRef.current;
					if (!el || Math.abs(st.velocity) < MIN_VELOCITY) {
						st.rafId = 0;
						updateEdges();
						return;
					}
					const prev = el.scrollLeft;
					el.scrollLeft -= st.velocity;
					st.velocity *= FRICTION;

					// Stop if we hit either scroll boundary
					if (Math.abs(el.scrollLeft - prev) < 0.5 && Math.abs(st.velocity) > 1) {
						st.velocity = 0;
						st.rafId = 0;
						updateEdges();
						return;
					}
					st.rafId = requestAnimationFrame(stepMomentum);
				};

				if (Math.abs(st.velocity) >= MIN_VELOCITY) {
					st.rafId = requestAnimationFrame(stepMomentum);
				}

				// Clear click suppression on next tick after click phase
				window.setTimeout(() => {
					st.suppressClick = false;
				}, 50);
			}
		};

		window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
		window.addEventListener("pointerup", onWindowPointerUp, { passive: true });
		window.addEventListener("pointercancel", onWindowPointerUp, { passive: true });

		return () => {
			window.removeEventListener("pointermove", onWindowPointerMove);
			window.removeEventListener("pointerup", onWindowPointerUp);
			window.removeEventListener("pointercancel", onWindowPointerUp);
		};
	}, [updateEdges]);

	const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		stopMomentum();
		// Let touch & pen use 100% native OS compositor scrolling
		if (e.pointerType !== "mouse" || e.button !== 0) return;

		const el = scrollerRef.current;
		if (!el) return;

		const st = stateRef.current;
		st.pointerDown = true;
		st.dragged = false;
		st.suppressClick = false;
		st.startX = e.clientX;
		st.lastX = e.clientX;
		st.lastTime = performance.now();
		st.velocity = 0;
		st.startScrollLeft = el.scrollLeft;
	};

	const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
		if (stateRef.current.suppressClick) {
			e.preventDefault();
			e.stopPropagation();
			stateRef.current.suppressClick = false;
		}
	};

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const scrollByPage = (direction: -1 | 1) => {
		stopMomentum();
		const el = scrollerRef.current;
		if (!el) return;
		const distance = Math.max(240, Math.round(el.clientWidth * 0.78));
		el.scrollBy({
			left: direction * distance,
			behavior: "smooth",
		});
	};

	const maskClass = fadeEdges
		? canScrollLeft && canScrollRight
			? styles.maskBoth
			: canScrollLeft
				? styles.maskLeft
				: canScrollRight
					? styles.maskRight
					: ""
		: "";

	const items = React.Children.toArray(children);

	return (
		<div
			className={`${styles.rowMaskWrap} group/slider ${className}`}
			aria-label={ariaLabel}>
			<div
				ref={scrollerRef}
				onPointerDown={handlePointerDown}
				onWheel={stopMomentum}
				onClickCapture={handleClickCapture}
				onDragStart={handleDragStart}
				style={{ gap: `${gap}px` }}
				className={`${styles.sliderTrack} ${maskClass} ${
					isDragging ? styles.sliderDragging : ""
				} ${trackClassName}`}>
				{items.map((child, idx) => (
					<div
						key={(child as React.ReactElement)?.key ?? idx}
						className={`${styles.sliderItem} ${itemClassName}`}>
						{child}
					</div>
				))}
			</div>

			{showArrows && canScrollLeft ? (
				<button
					type="button"
					onClick={() => scrollByPage(-1)}
					aria-label="Scroll left"
					className={`${styles.sliderNavBtn} ${styles.sliderNavLeft}`}>
					<FaChevronLeft />
				</button>
			) : null}

			{showArrows && canScrollRight ? (
				<button
					type="button"
					onClick={() => scrollByPage(1)}
					aria-label="Scroll right"
					className={`${styles.sliderNavBtn} ${styles.sliderNavRight}`}>
					<FaChevronRight />
				</button>
			) : null}
		</div>
	);
};

export default HorizontalSlider;

