import Link from "next/link";

import styles from "@/styles/Navigation.module.css";
import { decorateLink } from "@/utils";
import { BiMenuAltRight } from "react-icons/bi";
const menu = ["movies", "tv series", "popular", "upcoming"];

const NavigationBar = () => {
	return (
		<div className={`flex p-5 justify-between ${styles.NavigationBar}`}>
			<h2>
				<Link href={"/"}>ON_SCREEN</Link>
			</h2>
			<div className=" gap-5 hidden md:flex">
				{menu?.map((item, index) => (
					<h3 key={index} className="uppercase">
						<Link href={decorateLink(`/${item}`)}>{item}</Link>
					</h3>
				))}
			</div>
			<div className="block md:hidden">
				<BiMenuAltRight className={`${styles.menu}`} />
			</div>
		</div>
	);
};

export default NavigationBar;
