import { genresType } from "@/constants/typescript";
import Link from "next/link";
import React, { ReactElement } from "react";

interface props {
	data: Array<genresType>;
	title: string;
	pageType: string;
}

const Tags: React.FC<props> = ({
	data,
	title,
	pageType = "movies",
}): ReactElement => {

	return (
		<>
			<h2 className="text-xl uppercase">{title} </h2>
			<div className="flex flex-wrap gap-2 text-zinc-700">
				{/* @ts-ignore */}
				{data?.map(({ name, id }, index) => (
					<div
						key={index}
						className="text-current px-2 py-1 border-dotted border border-zinc-500"
					>
						<Link href={`/${pageType}?genre=${id}`}>{name}</Link>
					</div>
				))}
			</div>
		</>
	);
};
export default Tags;
