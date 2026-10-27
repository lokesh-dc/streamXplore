"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FiExternalLink } from "react-icons/fi";

import { getImageBaseLink } from "@/constants";
import {
	DEFAULT_WATCH_REGION,
	REGION_COOKIE,
} from "@/constants/streaming";

interface WatchProvider {
	provider_id: number;
	provider_name: string;
	logo_path: string;
	display_priority?: number;
}

interface ProviderRegion {
	link?: string;
	flatrate?: WatchProvider[];
	free?: WatchProvider[];
	ads?: WatchProvider[];
	rent?: WatchProvider[];
	buy?: WatchProvider[];
}

interface WhereToWatchProps {
	providers?: Record<string, ProviderRegion>;
}

const REGION_LABEL = (code: string) => {
	try {
		return (
			new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code
		);
	} catch {
		return code;
	}
};

const dedupe = (lists: Array<WatchProvider[] | undefined>) => {
	const seen = new Map<number, WatchProvider>();
	lists.forEach((list) =>
		(list || []).forEach((provider) => {
			if (provider?.provider_id && !seen.has(provider.provider_id)) {
				seen.set(provider.provider_id, provider);
			}
		}),
	);
	return Array.from(seen.values());
};

const ProviderTile = ({
	provider,
	href,
}: {
	provider: WatchProvider;
	href?: string;
}) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		title={provider.provider_name}
		className="group flex w-16 flex-col items-center gap-2 text-center sm:w-[72px]">
		<span className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 ease-smooth group-hover:scale-105 group-hover:border-primary/50">
			<Image
				unoptimized
				fill
				sizes="56px"
				src={getImageBaseLink({
					type: "logo",
					quality: "sm",
					path: provider.logo_path,
				})}
				alt={provider.provider_name}
				className="object-cover"
			/>
		</span>
		<span className="line-clamp-2 text-[10px] font-medium leading-tight text-text-secondary transition-colors group-hover:text-text-primary">
			{provider.provider_name}
		</span>
	</a>
);

const Group = ({
	label,
	providers,
	href,
}: {
	label: string;
	providers: WatchProvider[];
	href?: string;
}) => {
	if (!providers.length) return null;
	return (
		<div className="flex flex-col gap-3">
			<span className="eyebrow">{label}</span>
			<div className="flex flex-wrap gap-x-4 gap-y-5">
				{providers.map((provider) => (
					<ProviderTile
						key={provider.provider_id}
						provider={provider}
						href={href}
					/>
				))}
			</div>
		</div>
	);
};

const WhereToWatch = ({ providers }: WhereToWatchProps) => {
	const [region, setRegion] = useState(DEFAULT_WATCH_REGION);

	// The streaming page stores the selected country so title pages show the
	// same availability instead of always defaulting to India.
	useEffect(() => {
		const match = document.cookie.match(
			new RegExp(`(?:^|;\\s*)${REGION_COOKIE}=([A-Za-z]{2})`),
		);
		const code = match?.[1]?.toUpperCase();
		if (code) setRegion(code);
	}, []);

	const active = providers?.[region];
	const regionLabel = REGION_LABEL(region);

	if (!active) return null;

	const stream = dedupe([active.flatrate]);
	const free = dedupe([active.free, active.ads]);
	const rent = dedupe([active.rent]);
	const buy = dedupe([active.buy]);
	const link = active.link;
	const isEmpty = !stream.length && !free.length && !rent.length && !buy.length;

	if (isEmpty && !link) return null;

	return (
		<section className="flex flex-col gap-5">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div className="flex flex-col gap-2">
					<span className="eyebrow">Availability</span>
					<h2 className="font-display text-2xl leading-none text-text-primary md:text-3xl">
						Where to watch
					</h2>
				</div>
				<span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
					{regionLabel}
				</span>
			</header>

			{isEmpty ? (
				<p className="text-sm text-text-secondary">
					Not available to stream in {regionLabel} right now.{" "}
					<a
						href={link}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80">
						Check on TMDB
						<FiExternalLink className="text-xs" />
					</a>
				</p>
			) : (
				<div className="flex flex-col gap-7">
					<Group label="Stream" providers={stream} href={link} />
					<Group label="Free" providers={free} href={link} />
					<Group label="Rent" providers={rent} href={link} />
					<Group label="Buy" providers={buy} href={link} />
				</div>
			)}

			{link && !isEmpty ? (
				<a
					href={link}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary">
					Powered by JustWatch
					<FiExternalLink className="text-xs" />
				</a>
			) : null}
		</section>
	);
};

export default WhereToWatch;
