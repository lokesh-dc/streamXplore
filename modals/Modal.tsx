import { getImageBaseLink } from "@/constants";
import { movieImages } from "@/constants/typescript";
import Image from "next/image";
import React, { ReactElement } from "react";

import { IoMdClose } from "react-icons/io";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";

interface props {
	position: number;
	bodyType?: string;
	mediaSource?: string | string[] | undefined;
	changeModalImage: Function;
	data: Array<movieImages>;
}

const Modal: React.FC<props> = ({
	position,
	mediaSource,
	changeModalImage,
	data,
}): ReactElement => {
	const handleModalImageChange = (event: any, incre: number) => {
		event.stopPropagation();
		if (position + incre < data.length && position + incre > 0)
			changeModalImage(position + incre, data[position + incre]?.file_path);
	};

	return (
		<div
			className="fixed top-0 z-[2055] h-screen w-screen bg-black/90 flex flex-col justify-center items-center gap-2 default_screen_adjust"
			style={{ padding: "0 10px", overflowY: "hidden", zIndex: 2055 }}
			onClick={(event) => {
				event.stopPropagation();
				changeModalImage("");
			}}
		>
			<div
				className="w-full text-white flex cursor-pointer"
				style={{ justifyContent: "end" }}
				onClick={() => changeModalImage("")}
			>
				<IoMdClose style={{ fontSize: "30px" }} />
			</div>
			<div className="h-fit">
				<Image
					unoptimized
					src={getImageBaseLink({
						path: mediaSource,
						type: "backdrop",
						quality: "lg",
					})}
					width={900}
					height={500}
					alt={`image`}
				/>
			</div>
			<div
				className="w-72 flex justify-between"
				style={{ margin: "20px auto" }}
			>
				<div
					className="p-3 flex items-center cursor-pointer"
					onClick={(event) => handleModalImageChange(event, -1)}
					style={{
						color: position == 0 ? "rgba(255,255,255,0.4)" : "white",
					}}
				>
					<RiArrowLeftSLine />
					previous
				</div>
				<p className="p-3" style={{ color: "rgba(255,255,255,0.4)" }}>
					{position + 1} / {data?.length}
				</p>

				<div
					className="p-3 flex items-center cursor-pointer"
					style={{
						color:
							position == data?.length - 1 ? "rgba(255,255,255,0.4)" : "white",
					}}
					onClick={(event) => handleModalImageChange(event, 1)}
				>
					next
					<RiArrowRightSLine style={{ fontSize: "18px" }} />
				</div>
			</div>
		</div>
	);
};
export default Modal;
