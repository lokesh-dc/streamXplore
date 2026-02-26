import { genresType } from "@/constants/typescript";
import Link from "next/link";
import React, { ReactElement } from "react";

interface props {
	data: Array<genresType>;
	title?: string;
	pageType?: string;
	variant?: string;
}

const Tags: React.FC<props> = ({
	data,
	title,
	pageType = "movies",
	variant = "bordered",
}): ReactElement => {

	const variantStyle = {
		bordered: "border-dotted border rounded-sm border-zinc-500",
		glassy: "glass-card"
	}

	{/* @ts-ignore */ }
	const tagsClasses = variantStyle[variant] || ""

	return (
		<>
			{title ? <h2 className="text-xl uppercase">{title} </h2> : null}
			<div className="flex flex-wrap gap-2 text-zinc-700 h-full">
				{/* @ts-ignore */}
				{data?.map(({ name, id }, index) => (
					<div
						key={index}
						className={`text-current px-2 py-1 ${tagsClasses}`}
					>
						<Link href={`/${pageType}?genre=${id}`}>{name}</Link>
					</div>
				))}
			</div>
		</>
	);
};
export default Tags;
