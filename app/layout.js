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
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hookedonmovies-app.vercel.app"),
	title: {
		default: "HookedOnMovies - Your Ultimate Movie & TV Guide",
		template: "%s | HookedOnMovies",
	},
	description: "Discover trending movies and TV series, search for your favorites, and get personalized recommendations. Your comprehensive guide to the world of cinema and television.",
	keywords: ["hookedonmovies", "movie search", "tv series", "movie database", "trending movies", "upcoming releases", "movie recommendations"],
	authors: [{ name: "HookedOnMovies Team" }],
	creator: "HookedOnMovies",
	publisher: "HookedOnMovies",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://hookedonmovies-app.vercel.app",
		siteName: "HookedOnMovies",
		title: "HookedOnMovies - Ultimate Movie & TV Guide",
		description: "Discover the latest movies and TV series with detailed info, cast, trailers, and ratings.",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "HookedOnMovies",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "HookedOnMovies - Ultimate Movie & TV Guide",
		description: "Discover the latest movies and TV series with detailed info, cast, trailers, and ratings.",
		images: ["/og-image.jpg"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "HookedOnMovies",
	},
};

export const viewport = {
	themeColor: "#000000",
	colorScheme: "dark",
	viewportFit: "cover",
	width: "device-width",
	initialScale: 1,
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
