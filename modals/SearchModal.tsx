"use client";

import { getImageBaseLink } from "@/constants";
import { searchedDataEntry } from "@/constants/typescript";
import Image from "next/image";
import React, { ReactElement, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { AiFillStar } from "react-icons/ai";
import { BiSearch, BiLoaderAlt } from "react-icons/bi";
import Link from "next/link";
import { decorateLink } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useBodyLock } from "@/hooks/useBodyLock";

interface props {
	toggleModalVisibility: () => void;
	handleQueryChange: (query: string) => void;
	resultData: Array<searchedDataEntry>;
	isSearching?: boolean;
}

const SearchModal: React.FC<props> = ({
	toggleModalVisibility,
	handleQueryChange,
	resultData = [],
	isSearching = false,
}): ReactElement => {
	const inputRef = useRef<HTMLInputElement>(null);

	// Lock body scroll when search is open
	useBodyLock(true);

	useEffect(() => {
		// Auto-focus the input on mount
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex flex-col items-center pt-24 px-4 sm:px-10"
			onClick={toggleModalVisibility}
		>
			<motion.div 
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className="w-full max-w-3xl flex flex-col gap-6"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Search Header */}
				<div className="flex items-center justify-between border-b border-white/10 pb-4">
					<div className="flex items-center gap-4 flex-1">
						<BiSearch className="text-3xl text-primary" />
						<input
							ref={inputRef}
							type="text"
							className="bg-transparent border-none text-2xl md:text-3xl text-white outline-none w-full placeholder-white/20 font-bold tracking-tight"
							placeholder="What are you looking for?"
							onChange={(event) => handleQueryChange(event.target.value)}
						/>
						{isSearching && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="animate-spin text-primary"
							>
								<BiLoaderAlt className="text-2xl" />
							</motion.div>
						)}
					</div>
					<button 
						onClick={toggleModalVisibility}
						className="p-2 hover:bg-white/10 rounded-full transition-colors group"
					>
						<IoMdClose className="text-3xl text-gray-500 group-hover:text-white" />
					</button>
				</div>

				{/* Results Section */}
				<div className="flex flex-col gap-4 overflow-y-auto max-h-[65vh] pr-2 custom-scrollbar pb-10">
					{resultData?.length > 0 ? (
						resultData.map((item, index) => {
							if (!["tv", "movie"].includes(item.media_type)) return null;
							
							const title = item.name || item.title;
							const year = (item.first_air_date || item.release_date)?.split("-")[0];
							const rating = item.vote_average?.toFixed(1);

							return (
								<motion.div
									key={item.id}
									initial={{ x: -10, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ delay: index * 0.03 }}
								>
									<Link
										href={`/${item.media_type}/${decorateLink(title)}/${item.id}`}
										className="group flex gap-5 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-all"
										onClick={toggleModalVisibility}
									>
										<div className="w-16 h-24 relative rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
											<Image
												unoptimized
												src={getImageBaseLink({
													path: item.poster_path || item.profile_path,
													type: "poster",
													quality: "sm",
												})}
												fill
												alt=""
												className="object-cover group-hover:scale-110 transition-transform duration-500"
											/>
										</div>
										<div className="flex flex-col justify-center gap-1">
											<h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
												{title}
											</h3>
											<div className="flex items-center gap-3 text-sm text-gray-400">
												<span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
													{item.media_type}
												</span>
												{year && <span>{year}</span>}
												<div className="flex items-center gap-1 text-primary font-bold">
													<AiFillStar className="text-sm" />
													<span>{rating}</span>
												</div>
											</div>
										</div>
									</Link>
								</motion.div>
							);
						})
					) : (
						<div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
							<BiSearch className="text-6xl opacity-10" />
							<p className="text-lg font-medium opacity-50 italic">Start typing to find magic...</p>
						</div>
					)}
				</div>
			</motion.div>
		</motion.div>
	);
};

export default SearchModal;
