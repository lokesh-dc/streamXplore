"use client";

import React from "react";

import PeopleRail, { PersonCard } from "@/components/ui/detail/PeopleRail";

interface CrewMember {
	id: number;
	name: string;
	job?: string | null;
	department?: string | null;
	profile_path?: string | null;
}

interface CrewSectionProps {
	crew?: Array<CrewMember>;
	createdBy?: Array<{ id: number; name: string; profile_path?: string | null }>;
}

const MAX_CREW = 30;

// Higher-signal roles float to the front; anything unranked trails behind.
const JOB_ORDER = [
	"Director",
	"Creator",
	"Screenplay",
	"Writer",
	"Story",
	"Teleplay",
	"Producer",
	"Executive Producer",
	"Co-Producer",
	"Line Producer",
	"Casting",
	"Director of Photography",
	"Original Music Composer",
	"Music",
	"Editor",
	"Production Design",
	"Art Direction",
	"Costume Design",
];

const rankJob = (job?: string | null) => {
	const index = job ? JOB_ORDER.indexOf(job) : -1;
	return index === -1 ? JOB_ORDER.length : index;
};

const buildCrew = (
	crew: CrewMember[],
	createdBy: CrewSectionProps["createdBy"],
): PersonCard[] => {
	const seen = new Map<number, PersonCard>();

	const consider = (person: PersonCard) => {
		if (!person?.id || !person?.name) return;
		const existing = seen.get(person.id);
		if (!existing || rankJob(person.meta) < rankJob(existing.meta)) {
			seen.set(person.id, person);
		}
	};

	(createdBy || []).forEach((creator) =>
		consider({
			id: creator.id,
			name: creator.name,
			imagePath: creator.profile_path ?? null,
			meta: "Creator",
		}),
	);

	(crew || []).forEach((member) =>
		consider({
			id: member.id,
			name: member.name,
			imagePath: member.profile_path ?? null,
			meta: member.job || member.department || null,
		}),
	);

	return Array.from(seen.values())
		.sort((a, b) => rankJob(a.meta) - rankJob(b.meta))
		.slice(0, MAX_CREW);
};

const CrewSection = ({ crew = [], createdBy = [] }: CrewSectionProps) => {
	const people = buildCrew(crew, createdBy);

	if (!people.length) return null;

	return (
		<PeopleRail
			eyebrow="Behind the scenes"
			title="Crew"
			countLabel={`${people.length} in crew`}
			people={people}
		/>
	);
};

export default CrewSection;
