"use client";

import Link from "next/link";
import { ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FiFilm,
	FiTrendingUp,
	FiCalendar,
	FiTv,
	FiHeart,
	FiX,
	FiInstagram,
	FiTwitter,
	FiGithub,
} from "react-icons/fi";

type props = {
	status: boolean | undefined;
	toggleStatus: Function;
};

const sideNavData = [
	{
		text: "Discover Movies",
		href: "/movies",
		icon: <FiFilm />,
	},
	{
		text: "Popular Movies",
		href: "/popular",
		icon: <FiTrendingUp />,
	},
	{
		text: "Upcoming Movies",
		href: "/upcoming",
		icon: <FiCalendar />,
	},
	{
		text: "Trending TV Series",
		href: "/tv-series",
		icon: <FiTv />,
	},
	{
		text: "Recommendations",
		href: "/recommendations",
		icon: <FiHeart />,
	},
];

const SideNav: React.FC<props> = ({ status, toggleStatus }): ReactElement => {
	return (
		<AnimatePresence>
			{status && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => toggleStatus(false)}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1034]"
					/>

					{/* Sidebar */}
					<motion.div
						initial={{ x: "-100%" }}
						animate={{ x: 0 }}
						exit={{ x: "-100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className="fixed left-0 top-0 z-[1035] h-screen w-80 bg-[#0B0B0B] border-r border-white/10 shadow-2xl flex flex-col"
					>
						<div className="p-8 flex justify-between items-center">
							<h2 className="text-2xl font-bold tracking-tighter uppercase bebas_nueve">
								HookedOnMovies
							</h2>
							<button
								onClick={() => toggleStatus(false)}
								className="p-2 hover:bg-white/10 rounded-full transition-colors"
							>
								<FiX size={24} className="text-gray-400" />
							</button>
						</div>

						<nav className="flex-1 px-4 py-4">
							<ul className="space-y-2">
								{sideNavData.map((item, index) => (
									<motion.li
										key={index}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
									>
										<Link
											href={item.href}
											onClick={() => toggleStatus(false)}
											className="flex items-center gap-4 px-4 py-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
										>
											<span className="text-xl group-hover:text-primary transition-colors">
												{item.icon}
											</span>
											<span className="text-lg font-medium tracking-wide">
												{item.text}
											</span>
										</Link>
									</motion.li>
								))}
							</ul>
						</nav>

						<div className="p-8 border-t border-white/5">
							<div className="flex gap-6 mb-8">
								<a href="#" className="text-gray-500 hover:text-white transition-colors">
									<FiInstagram size={20} />
								</a>
								<a href="#" className="text-gray-500 hover:text-white transition-colors">
									<FiTwitter size={20} />
								</a>
								<a href="#" className="text-gray-500 hover:text-white transition-colors">
									<FiGithub size={20} />
								</a>
							</div>
							<p className="text-xs text-gray-600 uppercase tracking-widest font-bold">
								© 2026 HookedOnMovies
							</p>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};

export default SideNav;
