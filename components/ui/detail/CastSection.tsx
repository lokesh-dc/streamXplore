"use client";

import React from "react";

import PeopleRail, { PersonCard } from "@/components/ui/detail/PeopleRail";

interface CastMember {
	id: number;
	name: string;
	character?: string | null;
	profile_path?: string | null;
}

interface CastSectionProps {
	cast: Array<CastMember>;
}

const CastSection = ({ cast }: CastSectionProps) => {
	if (!cast?.length) return null;

	const people: PersonCard[] = cast.map((person) => ({
		id: person.id,
		name: person.name,
		imagePath: person.profile_path,
		meta: person.character,
	}));

	return (
		<PeopleRail
			eyebrow="Top billed"
			title="Cast"
			countLabel={`${people.length} ${people.length === 1 ? "credit" : "credits"}`}
			people={people}
		/>
	);
};

export default CastSection;
