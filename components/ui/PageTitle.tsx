import React, { ReactElement } from "react";

type props = {
	title: string;
	eyebrow?: string;
	description?: string;
	size?: "default" | "sm" | "md";
};

const PageTitle: React.FC<props> = ({
	title,
	eyebrow = "Browse",
	description,
	size = "default",
}): ReactElement => {
	const headingSizeClass =
		size === "sm"
			? "text-xl md:text-2xl"
			: size === "md"
				? "text-2xl md:text-3xl lg:text-4xl"
				: "text-5xl md:text-6xl";

	return (
		<header className="shell flex flex-col gap-3 pb-6 pt-28">
			<span className="eyebrow">{eyebrow}</span>
			<h1 className={`font-display text-balance leading-none text-text-primary ${headingSizeClass}`}>
				{title}
			</h1>
			{description ? (
				<p className="max-w-xl text-sm leading-relaxed text-text-secondary">
					{description}
				</p>
			) : null}
		</header>
	);
};

export default PageTitle;
