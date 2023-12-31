import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import React, { ReactElement } from "react";
interface props {
	bodyType?: string;
	mediaSource?: string | string[] | undefined;
	closeModal: Function;
}

const Modal: React.FC<props> = ({
	bodyType,
	mediaSource,
	closeModal,
}): ReactElement => {
	return (
		<div
			className="fixed top-0 z-[2035] h-screen w-screen bg-black/90 flex items-center"
			onClick={() => closeModal("")}
		>
			<div className="h-fit">
				<Image
					unoptimized
					src={getImageBaseLink({
						path: mediaSource,
						type: "backdrop",
						quality: "lg",
					})}
					width={480}
					height={300}
					alt={`image`}
				/>
			</div>
		</div>
	);
};
export default Modal;
