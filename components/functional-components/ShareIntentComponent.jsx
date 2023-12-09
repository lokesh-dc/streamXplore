import { useRouter } from "next/router";
import { IoShareSocialOutline } from "react-icons/io5";

export default function ShareIntentComponent() {
	const router = useRouter();
	const shareIntent = async () => {
		const currentPath = `${process.env.NEXT_PUBLIC_API_BASELINK}${router?.asPath}`;
		const shareData = {
			url: `${currentPath}`,
		};
		console.log(shareData);
		if (navigator?.share) {
			try {
				await navigator?.share(shareData);
				console.log("shared");
			} catch (error) {
				// @ts-ignore
				console.log(`Error: ${error.message}`);
			}
		} else {
			console.log("Share is not present in navigator");
		}
	};

	return (
		<button
			className="md:hidden border-dotted rounded-sm border-2 px-2 py-1"
			onClick={() => shareIntent()}
		>
			<IoShareSocialOutline />
		</button>
	);
}
