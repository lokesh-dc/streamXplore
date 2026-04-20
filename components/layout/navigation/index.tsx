"use client";
import Link from "next/link";

import { BiMenuAltRight } from "react-icons/bi";
import { BiUser, BiSearch } from "react-icons/bi";

import SideNav from "./Sidenav";
import { useEffect, useState, useCallback } from "react";
import SearchModal from "@/modals/SearchModal";
import searchMulti from "@/dataFetchings/searchMulti";
import { searchedDataEntry } from "@/constants/typescript";

const NavigationBar = () => {
	const [sidebarStatus, toggleSidebar] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<searchedDataEntry[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 0);
		};
		window.addEventListener("scroll", onScroll);
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Keyboard shortcut for search (CMD+K or CTRL+K)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setIsSearchOpen(true);
			}
			if (e.key === "Escape") {
				setIsSearchOpen(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleSearch = useCallback(async (query: string) => {
		setSearchQuery(query);
		if (query.length > 2) {
			setIsSearching(true);
			try {
				const results: any = await searchMulti(query);
				setSearchResults(results.data || []);
			} catch (error) {
				console.error("Search failed:", error);
			} finally {
				setIsSearching(false);
			}
		} else {
			setSearchResults([]);
		}
	}, []);

	return (
		<>
			<div
				className={`flex px-6 py-4 items-center justify-between fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled || isSearchOpen ? "bg-[#121212]/95 backdrop-blur-md border-b border-white/10" : "bg-transparent"
					}`}>
				<h2 className="text-2xl font-bold tracking-tight">
					<Link href={"/"}>
						ON_SCREEN
					</Link>
				</h2>

				<div className="hidden md:flex flex-1 max-w-md mx-8">
					<button
						onClick={() => setIsSearchOpen(true)}
						className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 flex items-center justify-between text-gray-400 hover:bg-white/10 hover:border-primary/30 transition-all group"
					>
						<div className="flex items-center gap-3">
							<BiSearch className="text-xl group-hover:text-primary" />
							<span>Search movies, TV shows...</span>
						</div>
						<kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium opacity-100">
							<span className="text-xs">⌘</span>K
						</kbd>
					</button>
				</div>

				<div className="flex items-center gap-6">
					<div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
						<Link href="/movies" className="hover:text-white transition-colors">Movies</Link>
						<Link href="/tv-series" className="hover:text-white transition-colors">TV Series</Link>
					</div>

					<div className="flex items-center gap-4">
						<button className="md:hidden p-2 text-gray-400 hover:text-white" onClick={() => setIsSearchOpen(true)}>
							<BiSearch className="text-2xl" />
						</button>
						<div className="w-[1px] h-6 bg-white/10 mx-2 hidden md:block"></div>
						<BiUser className="text-2xl text-gray-400 hover:text-primary cursor-pointer transition-colors" />
						<button
							onClick={() => toggleSidebar(!sidebarStatus)}>
							<BiMenuAltRight className="text-3xl text-gray-400 hover:text-white transition-colors" />
						</button>
					</div>
				</div>
			</div>

			<SideNav status={sidebarStatus} toggleStatus={toggleSidebar} />

			{isSearchOpen && (
				<SearchModal
					toggleModalVisibility={() => setIsSearchOpen(false)}
					handleQueryChange={handleSearch}
					resultData={searchResults}
					isSearching={isSearching}
				/>
			)}
		</>
	);
};

export default NavigationBar;
