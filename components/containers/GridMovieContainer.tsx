import { movieDetails } from "@/constants/typescript";
import MovieCard from "../cards/MovieCard";
import React, { ReactElement, useEffect, useState } from "react";
import getMethod from "@/utils/methods/get";

import GetMoreButton from "@/components/buttons/GetMore";
import InfiniteScroll from "react-infinite-scroll-component";

interface props {
	upcoming: Array<movieDetails> | null;
	title?: string;
	apiPath: string;
}

const GridMovieContainer: React.FC<props> = ({
	upcoming,
	apiPath,
}): ReactElement => {
	const [data, setData] = useState(upcoming || []);
	const [page, setPage] = useState(2);
	const [totalPages, setTotalPages] = useState(10);

	const getMoreUpcomingMovies = async () => {
		const { data, totalPages } = await getMethod({
			path: `${apiPath}?language=en-US&page=${page}`,
			params: "",
		});
		setData((prev): Array<movieDetails> => [...prev, ...data]);
		setPage((page) => page + 1);
		setTotalPages(totalPages);
	};

	useEffect(() => {
		if (page === 2 || page === totalPages) return;
		getMoreUpcomingMovies();
	}, [page]);

	function handlePageChange() {
		setPage((page) => page + 1);
	}

	console.log(page);

	return (
		<>
			<div className="my-3">
				<InfiniteScroll
					dataLength={data.length}
					next={getMoreUpcomingMovies}
					hasMore={totalPages >= page}
					loader={<h3> Loading...</h3>}
					className="w-100 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-y-8 justify-center"
				>
					{data.map((item, index) => (
						<MovieCard
							key={index}
							imgSrc={`${item.poster_path}`}
							title={`${item.title}`}
						/>
					))}
				</InfiniteScroll>
			</div>
		</>
	);
};

export default GridMovieContainer;
