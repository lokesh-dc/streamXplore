import "@/styles/globals.css";
import "@/styles/v2/globals.css";
import "@/styles/responsive.css";
import "@/styles/youtube-embed.css";
import { Poppins } from "next/font/google";
import NavigationBar from "@/components/layout/navigation";

const poppins = Poppins({
	weight: ["400", "500", "600"],
	subsets: ["latin"],
	variable: "--font-poppins",
});

export const metadata = {
	title: {
		default: "MovieSearch",
		template: "%s | MovieSearch",
	},
	description: "Discover the latest movies and TV series.",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
	},
};

export const viewport = {
	themeColor: "#000000",
	colorScheme: "dark",
	viewportFit: "cover",
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			data-theme="dark"
			className={`${poppins.variable} font-sans`}
		>
			<body className={poppins.className}>
				<NavigationBar />
				<main>{children}</main>
			</body>
		</html>
	);
}
