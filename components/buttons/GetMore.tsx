import React from "react";

type props = {
	clickevent: Function;
};
const getMoreButton: React.FC<props> = ({ clickevent }) => {
	return (
		<button
			className="w-full flex justify-center mt-7 text-center bg-slate-400 p-2"
			onClick={() => clickevent()}
		>
			SEE MORE
		</button>
	);
};

export default getMoreButton;
