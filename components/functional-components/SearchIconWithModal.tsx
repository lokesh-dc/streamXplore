import { useEffect, useRef, useState } from "react";

import { FiSearch } from "react-icons/fi";

import SearchModal from "@/modals/SearchModal";

import searchMulti from "@/dataFetchings/searchMulti";

const SearchIconWithModal = () => {
	const [isModalOpen, changeModalVisibility] = useState(false);

	const toggleModalVisibility = () => {
		changeModalVisibility(!isModalOpen);
	};

	const [query, setQuery] = useState("");
	const handleQueryChange = (value: string) => {
		setQuery(value);
	};

	const [resultData, setResultData] = useState([]);
	useEffect(() => {
		if (!query) return;
		const timeOut = setTimeout(() => searchForMovies(query), 300);

		return () => {
			clearTimeout(timeOut);
		};
	}, [query]);

	const searchForMovies = (query: string) => {
		searchMulti(query).then((res) => setResultData(res?.data));
	};

	return (
		<>
			<button onClick={() => toggleModalVisibility()}>
				<FiSearch style={{ fontSize: "30px" }} />
			</button>
			{isModalOpen ? (
				<SearchModal
					handleQueryChange={handleQueryChange}
					toggleModalVisibility={toggleModalVisibility}
					resultData={resultData}
				/>
			) : null}
		</>
	);
};

export default SearchIconWithModal;
