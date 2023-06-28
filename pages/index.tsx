import HeroSection from "@/components/HeroSection";
import MovieContainer from "@/components/containers/MovieContainer";
import { api_baseLink } from "@/constants";
import { movieDetails } from "@/constants/typescript";

interface props {
	page: number | null;
	results: Array<movieDetails> | null;
	total_pages: number | null;
	total_results: number | null;
}

const HomePage = ({ page, results, total_pages, total_results }: props) => {
	return (
		<>
			<HeroSection data={results} />
			<MovieContainer data={results} title="Popular Movies" />
		</>
	);
};

export default HomePage;

export async function getServerSideProps() {
	try {
		const options = {
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
			},
		};

		const randomPage = Math.floor(Math.random() * 10 + 1);
		const response = await fetch(
			`${api_baseLink}/movie/popular?language=en-US&page=${randomPage}`,
			options
		)
			.then((response) => response.json())
			.then((response) => response)
			.catch((err) => console.error(err));

		return {
			props: {
				page: response?.page,
				results: response?.results,
				total_pages: response?.total_pages,
				total_results: response?.total_results,
			},
		};
	} catch (e) {
		console.log("Error", e);
	}
}
