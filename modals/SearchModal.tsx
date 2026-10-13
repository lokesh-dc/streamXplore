"use client";

import { getImageBaseLink } from "@/constants";
import { searchedDataEntry } from "@/constants/typescript";
import Image from "next/image";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { AiFillStar } from "react-icons/ai";
import { BiSearch, BiLoaderAlt } from "react-icons/bi";
import { FiArrowUpRight } from "react-icons/fi";
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

const SUGGESTIONS = [
	"Dune",
	"Oppenheimer",
	"The Bear",
	"Succession",
	"Interstellar",
	"Severance",
];

const TypeBadge = ({ label }: { label: string }) => (
	<span className="rounded-[4px] border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-text-secondary">
		{label}
	</span>
);

const RatingPill = ({ value }: { value: number }) =>
	value > 0 ? (
		<span className="tabular absolute bottom-1.5 right-1.5 inline-flex items-center gap-0.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
			<AiFillStar className="text-[10px] text-primary" />
			{value.toFixed(1)}
		</span>
	) : null;

const SearchModal: React.FC<props> = ({
	toggleModalVisibility,
	handleQueryChange,
	resultData = [],
	isSearching = false,
}): ReactElement => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState("");

	useBodyLock(true);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const onInput = (next: string) => {
		setValue(next);
		handleQueryChange(next);
	};

	const pickSuggestion = (suggestion: string) => {
		onInput(suggestion);
		inputRef.current?.focus();
	};

	const hasQuery = value.trim().length > 0;
	const hasResults = resultData?.length > 0;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-[200] flex flex-col items-center bg-[#0a0908]/80 px-4 pt-[9vh] backdrop-blur-md sm:px-6 sm:pt-[12vh]"
			onClick={toggleModalVisibility}>
			{/* Warm primary glow behind the palette */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(230,80,27,0.07),transparent)]" />

			<motion.div
				initial={{ y: -24, opacity: 0, scale: 0.985 }}
				animate={{ y: 0, opacity: 1, scale: 1 }}
				exit={{ y: -16, opacity: 0 }}
				transition={{ type: "spring", stiffness: 320, damping: 30 }}
				className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#121110]/95 shadow-[0_50px_140px_-40px_rgba(0,0,0,0.95)] backdrop-blur-md"
				onClick={(e) => e.stopPropagation()}>
				{/* Input row */}
				<div className="flex items-center gap-4 border-b border-white/[0.08] px-5 py-4">
					<BiSearch className="shrink-0 text-2xl text-primary" />
					<input
						ref={inputRef}
						type="text"
						value={value}
						onChange={(e) => onInput(e.target.value)}
						placeholder="Search films, series, people…"
						className="min-w-0 flex-1 bg-transparent text-lg font-medium tracking-tight text-text-primary outline-none placeholder:text-text-secondary/50 md:text-xl"
						autoComplete="off"
						spellCheck={false}
						enterKeyHint="search"
					/>
					<AnimatePresence>
						{isSearching && (
							<motion.span
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className="shrink-0 animate-spin text-primary">
								<BiLoaderAlt className="text-xl" />
							</motion.span>
						)}
					</AnimatePresence>
					<button
						onClick={toggleModalVisibility}
						aria-label="Close search"
						className="group -mr-1 shrink-0 rounded-lg p-2 transition-colors hover:bg-white/[0.06]">
						<IoMdClose className="text-xl text-text-secondary transition-colors group-hover:text-text-primary" />
					</button>
				</div>

				{/* Results / empty states */}
				<div className="custom-scrollbar max-h-[58vh] overflow-y-auto p-2.5">
					{hasResults ? (
						<ul className="flex flex-col gap-1">
							{resultData.map((item, index) => {
								const isPerson = item.media_type === "person";

								if (isPerson) {
									const knownFor: any = (item as any)?.known_for;
									const knownTitle =
										knownFor?.[0]?.title || knownFor?.[0]?.name || null;
									const personName = item.name || item.title;

									return (
										<motion.li
											key={`person-${item.id}`}
											initial={{ opacity: 0, y: 6 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: Math.min(index * 0.02, 0.2) }}>
											<Link
												href={`/person/${decorateLink(personName)}/${item.id}`}
												onClick={toggleModalVisibility}
												className="group flex items-center gap-4 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-white/[0.05]">
												<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 ring-1 ring-white/5">
													{item.profile_path ? (
														<Image
															unoptimized
															fill
															sizes="56px"
															src={getImageBaseLink({
																path: item.profile_path,
																type: "profile",
																quality: "md",
															})}
															alt={personName || "Person"}
															className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.08]"
														/>
													) : (
														<span className="flex h-full w-full items-center justify-center font-display text-lg text-text-secondary">
															{personName?.slice(0, 1).toUpperCase()}
														</span>
													)}
												</div>
												<div className="min-w-0 flex-1">
													<h3 className="truncate text-[15px] font-semibold text-text-primary transition-colors group-hover:text-primary">
														{personName}
													</h3>
													<div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
														<TypeBadge label="Person" />
														{item.known_for_department ? (
															<span className="truncate">
																{item.known_for_department}
															</span>
														) : null}
													</div>
													{knownTitle ? (
														<p className="mt-1 truncate text-xs text-text-secondary">
															Known for{" "}
															<span className="text-text-primary/80">
																{knownTitle}
															</span>
														</p>
													) : null}
												</div>
												<FiArrowUpRight className="shrink-0 text-lg text-text-secondary opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
											</Link>
										</motion.li>
									);
								}

								if (!["tv", "movie"].includes(item.media_type)) return null;

								const title = item.name || item.title;
								const year = (
									item.first_air_date || item.release_date
								)?.split("-")[0];
								const rating = item.vote_average ?? 0;
								const poster = item.poster_path || item.profile_path;

								return (
									<motion.li
										key={`${item.media_type}-${item.id}`}
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: Math.min(index * 0.02, 0.2) }}>
										<Link
											href={`/${item.media_type}/${decorateLink(title)}/${item.id}`}
											onClick={toggleModalVisibility}
											className="group flex items-center gap-4 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-white/[0.05]">
											<div className="relative h-[76px] w-[52px] shrink-0 overflow-hidden rounded-[5px] border border-white/10 bg-white/5">
												{poster ? (
													<Image
														unoptimized
														fill
														sizes="52px"
														src={getImageBaseLink({
															path: poster,
															type: "poster",
															quality: "sm",
														})}
														alt={title || ""}
														className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
													/>
												) : (
													<span className="flex h-full w-full items-center justify-center font-display text-2xl text-text-secondary">
														{title?.slice(0, 1).toUpperCase()}
													</span>
												)}
												<RatingPill value={rating} />
											</div>
											<div className="min-w-0 flex-1">
												<h3 className="truncate text-[15px] font-semibold text-text-primary transition-colors group-hover:text-primary">
													{title}
												</h3>
												<div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
													<TypeBadge label={item.media_type} />
													{year ? (
														<span className="tabular">{year}</span>
													) : null}
												</div>
											</div>
											<FiArrowUpRight className="shrink-0 text-lg text-text-secondary opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
										</Link>
									</motion.li>
								);
							})}
						</ul>
					) : hasQuery && !isSearching ? (
						<div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
							<BiSearch className="text-5xl text-text-secondary/15" />
							<p className="text-sm font-medium text-text-primary">
								No matches for &ldquo;{value.trim()}&rdquo;
							</p>
							<p className="text-xs text-text-secondary">
								Try another title, or search for a person by name.
							</p>
						</div>
					) : isSearching ? (
						<div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
							<BiLoaderAlt className="animate-spin text-3xl text-primary" />
							<p className="eyebrow">Searching the archive</p>
						</div>
					) : (
						<div className="flex flex-col items-center gap-6 px-6 py-12 text-center">
							<div className="flex flex-col gap-1.5">
								<span className="eyebrow">Search</span>
								<p className="max-w-sm text-sm text-text-secondary">
									Find films, series and the people who make them.
								</p>
							</div>
							<div className="flex flex-wrap items-center justify-center gap-2">
								{SUGGESTIONS.map((suggestion) => (
									<button
										key={suggestion}
										type="button"
										onClick={() => pickSuggestion(suggestion)}
										className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary/40 hover:bg-white/[0.06] hover:text-text-primary">
										{suggestion}
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Footer hints */}
				<div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3 text-[11px] text-text-secondary">
					<span className="inline-flex items-center gap-1.5">
						<kbd className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] leading-none">
							Esc
						</kbd>
						to close
					</span>
					{hasQuery && !isSearching ? (
						<span className="tabular">
							{resultData.length}{" "}
							{resultData.length === 1 ? "result" : "results"}
						</span>
					) : (
						<span className="eyebrow">Powered by TMDB</span>
					)}
				</div>
			</motion.div>
		</motion.div>
	);
};

export default SearchModal;
