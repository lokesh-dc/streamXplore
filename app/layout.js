import "@/styles/globals.css";
import "@/styles/v2/globals.css";
import "@/styles/responsive.css";
import "@/styles/youtube-embed.css";
import { Poppins, Bebas_Neue, Oswald } from "next/font/google";
import NavigationBar from "@/components/layout/navigation";

const poppins = Poppins({
	weight: ["400", "500", "600"],
	subsets: ["latin"],
	variable: "--font-poppins",
});

const bebasNeue = Bebas_Neue({
	weight: ["400"],
	subsets: ["latin"],
	variable: "--bebas-nueve",
});

const oswald = Oswald({
	weight: ["400", "500", "600"],
	subsets: ["latin"],
	variable: "--oswald",
});

export const metadata = {
	title: {
		default: "MovieSearch",
		template: "%s | MovieSearch",
	},
	description: "Discover the latest movies and TV series.",
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			data-theme="dark"
			className={`${poppins.variable} ${bebasNeue.variable} ${oswald.variable} font-sans`}
		>
			<body className={poppins.className}>
				<NavigationBar />
				<main>{children}</main>
			</body>
		</html>
	);
}
