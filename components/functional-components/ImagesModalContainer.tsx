"use client";
import { movieImages } from "@/constants/typescript";
import Modal from "@/modals/ImagesModal";
import dynamic from "next/dynamic";
import React, { ReactElement, useState } from "react";

const MovieImagesContainer = dynamic(
	() => import("@/components/containers/MovieImagesContainer")
);

interface imageModalProps {
	src: string;
	position: number;
}

interface props {
	backdrops: movieImages[];
	title: string;
	// stateChange: Function;
}

const ImagesModalContainer: React.FC<props> = ({ backdrops }): ReactElement => {
	const [modalImage, setModalImage] = useState<imageModalProps>({
		position: 0,
		src: "",
	});
	const changeModalImage = (position: number, imgSrc: string) => {
		setModalImage({ position, src: imgSrc });
	};

	return (
		<>
			{backdrops && backdrops?.length > 0 ? (
				<MovieImagesContainer
					title="title"
					data={backdrops}
					stateChange={changeModalImage}
				/>
			) : null}
			{backdrops && backdrops?.length > 0 && modalImage?.src ? (
				<>
					<Modal
						bodyType={"image"}
						mediaSource={modalImage?.src}
						position={modalImage?.position}
						changeModalImage={changeModalImage}
						data={backdrops}
					/>
				</>
			) : null}
		</>
	);
};

export default ImagesModalContainer;
