import React, { ReactElement } from "react";

type props = {
	title: string;
	eyebrow?: string;
	description?: string;
};

const PageTitle: React.FC<props> = ({
	title,
	eyebrow = "Browse",
	description,
}): ReactElement => {
	return (
		<header className="shell flex flex-col gap-3 pb-6 pt-28">
			<span className="eyebrow">{eyebrow}</span>
			<h1 className="font-display text-balance text-5xl leading-none text-text-primary md:text-6xl">
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
