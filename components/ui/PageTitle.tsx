import React, { ReactElement } from "react";

type props = {
	title: string;
};

const PageTitle: React.FC<props> = ({ title }): ReactElement => {
	return (
		<div>
			<h1 className="px-2 md:px-9 py-1  md:py-5 text-3xl md:text-5xl uppercase bebas-nueve">
				{title}
			</h1>
		</div>
	);
};

export default PageTitle;
