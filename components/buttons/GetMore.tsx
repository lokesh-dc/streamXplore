import React from "react";

type props = {
	clickevent: Function;
};
const getMoreButton: React.FC<props> = ({ clickevent }) => {
	return (
		<button
			className="w-full flex justify-center mt-7 text-center bg-slate-800 text-slate-200 tracking-wider p-2"
			onClick={() => clickevent()}
		>
			See More
		</button>
	);
};

export default getMoreButton;
