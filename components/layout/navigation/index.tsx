"use client";
import Link from "next/link";

import { BiMenuAltRight } from "react-icons/bi";
import { BiUser } from "react-icons/bi";

import styles from "@/styles/Navigation.module.css";
import { decorateLink } from "@/utils";

import SideNav from "./Sidenav";
import { useEffect, useState } from "react";
import SearchIconWithModal from "@/components/functional-components/SearchIconWithModal";
const menu = ["movies", "tv series", "popular", "upcoming"];

const NavigationBar = () => {
	const [sidebarStatus, toggleSidebar] = useState(true);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 0);
		};

		window.addEventListener("scroll", onScroll);
		onScroll();

		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<>
			<div
				// className={` ${styles.NavigationBar}`}
				className={`flex p-5 items-center justify-between fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-smooth,
					${scrolled ? "glass glass-lg" : "bg-transparent"} ${styles.NavigationBar}`}
			>
				<h2 className={`${styles.brand}`}>
					<Link href={"/"}>ON_SCREEN</Link>
				</h2>
				<div className="gap-5 hidden md:flex content-center items-center glass glass-card rounded-md px-3 py-2">
					{menu?.map((item, index) => (
						<h3 key={index} className="uppercase">
							<Link href={decorateLink(`/${item}`)}>{item}</Link>
						</h3>
					))}
				</div>

				<div className="flex gap-3 glass glass-lg rounded-md px-3 py-2 border border-white/40">
					<SearchIconWithModal />
					<BiUser style={{ fontSize: "20px" }} />

					<button
						className="md:hidden"
						data-te-sidenav-toggle-ref
						data-te-target="#sidenav"
						aria-controls="#sidenav"
						aria-haspopup="true"
						onClick={() => toggleSidebar(!sidebarStatus)}
					>
						<BiMenuAltRight className={`${styles.menu}`} />
					</button>
				</div>
			</div>
			<SideNav status={sidebarStatus} toggleStatus={toggleSidebar} />
		</>
	);
};

export default NavigationBar;
