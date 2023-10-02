import Link from "next/link";

import styles from "@/styles/Navigation.module.css";
import { decorateLink } from "@/utils";
import { BiMenuAltRight } from "react-icons/bi";
import SideNav from "./Sidenav";
import { useState } from "react";
const menu = ["movies", "tv series", "popular", "upcoming"];

const NavigationBar = () => {
	const [sidebarStatus, toggleSidebar] = useState(true);

	return (
		<>
			<div className={`flex p-5 justify-between ${styles.NavigationBar}`}>
				<h2>
					<Link href={"/"}>ON_SCREEN</Link>
				</h2>
				<div className="gap-5 hidden md:flex content-center items-center">
					{menu?.map((item, index) => (
						<h3 key={index} className="uppercase">
							<Link href={decorateLink(`/${item}`)}>{item}</Link>
						</h3>
					))}
				</div>

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
			<SideNav status={sidebarStatus} toggleStatus={toggleSidebar} />
		</>
	);
};

export default NavigationBar;
