import Link from "next/link";
import { ReactElement } from "react";

type props = {
	status: boolean | undefined;
	toggleStatus: Function;
};

const sideNavData = [
	{
		text: "Popular",
		href: "/popular",
	},
	{
		text: "Upcoming",
		href: "/upcoming",
	},
	{
		text: "TV Series",
		href: "/tv-series",
	},
];
const SideNav: React.FC<props> = ({ status, toggleStatus }): ReactElement => {
	return (
		<div
			id="sidenav"
			className="fixed left-0 top-0 z-[1035] h-screen w-screen -translate-x-full bg-black/60 shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.05)] data-[te-sidenav-hidden='false']:translate-x-0"
			data-te-sidenav-init
			data-te-sidenav-hidden={`${status}`}
			data-te-sidenav-mode="side"
			data-te-sidenav-content="#content"
			onClick={() => toggleStatus(!status)}
		>
			<nav className="bg-black/80 h-screen w-60">
				<ul
					className="relative m-0 list-none px-[0.2rem] text-white"
					data-te-sidenav-menu-ref
				>
					<div className="py-5 px-3">
						<h2 className="text-3xl">
							<Link href={"/"}>ON_SCREEN</Link>
						</h2>
					</div>
					{sideNavData.map((item, index) => (
						<li
							key={index}
							className="relative"
							onClick={() => toggleStatus(!status)}
						>
							<Link
								href={item.href}
								className="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
								data-te-sidenav-link-ref
							>
								<span>{item.text}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

			<div>X</div>
		</div>
	);
};

export default SideNav;
