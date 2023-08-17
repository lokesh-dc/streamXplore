import NextNProgress from "nextjs-progressbar";
import NavigationBar from "@/components/layout/navigation";
import "@/styles/globals.css";
import "@/styles/responsive.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<NavigationBar />
			<NextNProgress />
			<Component {...pageProps} />
		</>
	);
}
