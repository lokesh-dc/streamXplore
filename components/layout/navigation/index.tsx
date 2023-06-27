import Link from "next/link";

import { decorateLink } from "@/utils";

const menu = ["movies", "tv series", "popular", "upcoming"];

const NavigationBar = () => {
	return (
		<div className="flex p-5 justify-between bg-transparent">
			<h2>
				<Link href={"/"}>ON_SCREEN</Link>
			</h2>
			<div className="flex gap-5">
				{menu?.map((item) => (
					<h3 className="uppercase">
						<Link href={decorateLink(`/${item}`)}>{item}</Link>
					</h3>
				))}
			</div>
		</div>
	);
};

export default NavigationBar;
