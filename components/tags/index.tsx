import { genresType } from "@/constants/typescript";
import React, { ReactElement } from "react";

interface props {
	data: Array<genresType>;
}

const Tags: React.FC<props> = ({ data }): ReactElement => {
	console.log(data);
	return (
		<div className="flex gap-2 text-zinc-700">
			{/* @ts-ignore */}
			{data?.map(({ name }, index) => (
				<div
					key={index}
					className="text-current px-2 py-1 border-dotted border border-zinc-500"
				>
					{name}
				</div>
			))}
		</div>
	);
};
export default Tags;
