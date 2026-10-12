import Link from "next/link";
import { ReactElement } from "react";
import { FaArrowRight } from "react-icons/fa";

interface SectionHeaderProps {
	index?: number | string;
	eyebrow?: string;
	title: string;
	subtitle?: string;
	href?: string;
	linkLabel?: string;
	className?: string;
}

const SectionHeader = ({
	index,
	eyebrow,
	title,
	subtitle,
	href,
	linkLabel = "View all",
	className = "",
}: SectionHeaderProps): ReactElement => {
	return (
		<header
			className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${className}`}>
			<div className="flex min-w-0 flex-col gap-2">
				<span className="eyebrow flex items-center gap-3">
					{index != null && (
						<span className="text-accent">
							{String(index).padStart(2, "0")}
						</span>
					)}
					{eyebrow && <span>{eyebrow}</span>}
				</span>

				<h2 className="font-display text-4xl leading-none text-text-primary md:text-5xl">
					{title}
				</h2>

				{subtitle && (
					<p className="max-w-xl text-sm text-text-secondary">{subtitle}</p>
				)}
			</div>

			{href && (
				<Link
					href={href}
					className="group inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
					{linkLabel}
					<FaArrowRight className="transition-transform duration-300 ease-smooth group-hover:translate-x-1" />
				</Link>
			)}
		</header>
	);
};

export default SectionHeader;
