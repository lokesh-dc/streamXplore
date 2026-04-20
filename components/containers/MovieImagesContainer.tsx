"use client";

import React, { ReactElement, useRef, useEffect } from "react";
import MovieImageCard from "@/components/cards/MovieImageCard";
import { movieImages } from "@/constants/typescript";

interface props {
	data: movieImages[];
	title: string;
	stateChange: Function;
}

const MovieImages: React.FC<props> = ({
	data,
	title,
	stateChange,
}): ReactElement => {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = scrollRef.current;
		if (el) {
			const onWheel = (e: WheelEvent) => {
				if (e.deltaY === 0) return;
				const isScrollingLeft = e.deltaY < 0;
				const canScrollLeft = el.scrollLeft > 0;
				const canScrollRight = el.scrollLeft < (el.scrollWidth - el.clientWidth);

				if ((isScrollingLeft && canScrollLeft) || (!isScrollingLeft && canScrollRight)) {
					e.preventDefault();
					el.scrollLeft += e.deltaY;
				}
			};
			el.addEventListener('wheel', onWheel, { passive: false });
			return () => el.removeEventListener('wheel', onWheel);
		}
	}, []);

	return (
		<div className="mt-8 mb-4">
			<h2 className="py-1 text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3 mb-6">
				<span className="w-1.5 h-6 bg-primary rounded-full"></span>
				Images
			</h2>
			<div
				ref={scrollRef}
				className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 overscroll-x-contain no-scrollbar scrollbar-hide"
			>
				{data.map(({ file_path }, index) => (
					<MovieImageCard
						position={index}
						imgSrc={file_path}
						key={index}
						title={title}
						// @ts-ignore
						stateChange={stateChange}
					/>
				))}
			</div>
		</div>
	);
};

export default MovieImages;
