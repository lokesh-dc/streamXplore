import HeroSection from "@/components/HeroSection";
import { api_baseLink } from "@/constants";

interface props {
	page: number | null;
	results: Array<movieDetails> | null;
	total_pages: number | null;
	total_results: number | null;
}

interface movieDetails {
	adult: boolean | null;
	backdrop_path: string | null;
	genre_id: Array<number> | null;
	id: number | null;
	original_language: string | null;
	original_title: string | null;
	overview: string | null;
	popularity: number | null;
	poster_path: string | null;
	release_date: string | null;
	title: string | null;
	video: boolean | string | null;
	vote_average: number | null;
	vote_count: number | null;
}
const HomePage = ({ page, results, total_pages, total_results }: props) => {
	return (
		<>
			<HeroSection data={results} />
			
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
		console.log(randomPage);
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
