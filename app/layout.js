import "@/styles/globals.css";
import "@/styles/v2/globals.css";
import "@/styles/responsive.css";
import "@/styles/youtube-embed.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
	weight: ["400", "500", "600"],
	subsets: ["latin"],
});

export default function Document({ children }) {
	return (
		<html className={poppins.className} lang="en" data-theme="dark">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com"></link>
				<link rel="preconnect" href="https://fonts.gstatic.com"></link>
				<link
					href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
					rel="stylesheet"
				></link>
				<link
					href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&display=swap"
					rel="stylesheet"
				></link>
			</head>
			<body>{children}</body>
		</html>
	);
}
