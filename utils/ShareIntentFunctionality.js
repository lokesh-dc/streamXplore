const { useRouter } = require("next/router");

const shareIntent = async () => {
	const router = useRouter();
	const currentPath = `${process.env.NEXT_PUBLIC_API_BASELINK}${router?.asPath}`;
	const shareData = {
		url: `${currentPath}`,
	};
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

export default shareIntent;
