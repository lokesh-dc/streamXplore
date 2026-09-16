"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { UIMessage } from "@ai-sdk/react";

import { getImageBaseLink } from "@/constants";
import { decorateLink } from "@/utils";
import { AiFillStar, AiOutlineRobot } from "react-icons/ai";

interface ToolOutputItem {
	id: number;
	title: string | null;
	mediaType: "movie" | "tv";
	year: string | null;
	voteAverage: number | null;
	posterPath: string | null;
}

interface ToolOutput {
	count?: number;
	items?: ToolOutputItem[];
	filters?: Record<string, unknown>;
}

const isToolPart = (part: any) =>
	part && typeof part.type === "string" && part.type.startsWith("tool");

const PosterCards = ({ items }: { items: ToolOutputItem[] }) => (
	<div className="flex gap-3 w-full">
		{items.map((item) => {
			if (!item.id) return null;
			const link = `/${item.mediaType}/${decorateLink(item.title)}/${item.id}`;
			return (
				<Link
					key={`${item.mediaType}-${item.id}`}
					href={link}
					className="w-[300px] flex-shrink-0 group">
					<div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-zinc-800 border border-white/10 group-hover:border-primary/50 transition-colors">
						{item.posterPath ? (
							<Image
								unoptimized
								src={getImageBaseLink({
									type: "poster",
									quality: "lg",
									path: item.posterPath,
								})}
								fill
								sizes="300px"
								alt={item.title || ""}
								className="object-cover group-hover:scale-105 transition-transform duration-500"
							/>
						) : null}
					</div>
					<div className="mt-2 flex flex-col gap-0.5 min-w-0">
						<p className="text-sm font-semibold text-white truncate">
							{item.title}
						</p>
						<div className="flex items-center gap-2 text-xs text-gray-400">
							<span className="uppercase text-[10px] tracking-wider bg-white/10 px-1.5 py-0.5 rounded">
								{item.mediaType}
							</span>
							{item.year ? <span>{item.year}</span> : null}
							{typeof item.voteAverage === "number" ? (
								<span className="flex items-center gap-1 text-primary font-semibold">
									<AiFillStar />
									{item.voteAverage?.toFixed(1)}
								</span>
							) : null}
						</div>
					</div>
				</Link>
			);
		})}
	</div>
);

const ToolResultGrid = ({ output }: { output: ToolOutput }) => {
	const items = output?.items?.slice(0, 6) || [];
	if (!items.length) return null;

	return (
		<div className="flex gap-3 overflow-x-auto w-[calc(100%+2rem)] -ml-4 px-4 pb-2 custom-scrollbar">
			<PosterCards items={items} />
		</div>
	);
};

/* ── Lightweight markdown-ish renderer ─────────────────────────────────────── */

const renderInline = (text: string) => {
	const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
	return parts.map((seg, i) => {
		if (seg.startsWith("**") && seg.endsWith("**"))
			return (
				<strong key={i} className="font-bold text-white">
					{seg.slice(2, -2)}
				</strong>
			);
		if (seg.startsWith("*") && seg.endsWith("*"))
			return (
				<em key={i} className="italic text-gray-300">
					{seg.slice(1, -1)}
				</em>
			);
		if (seg.startsWith("`") && seg.endsWith("`"))
			return (
				<code key={i} className="px-1 py-0.5 rounded bg-white/10 text-primary/90 text-[13px] font-mono">
					{seg.slice(1, -1)}
				</code>
			);
		return <span key={i}>{seg}</span>;
	});
};

const parseTableRow = (line: string) =>
	line
		.trim()
		.replace(/^\|/, "")
		.replace(/\|$/, "")
		.split("|")
		.map((cell) => cell.trim());

const isSeparatorRow = (line: string) =>
	line.includes("-") &&
	parseTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));

const renderTable = (header: string[], rows: string[][]) => (
	<div className="overflow-x-auto w-full rounded-lg border border-white/10 bg-white/[0.02]">
		<table className="w-full text-xs sm:text-sm text-gray-200 border-collapse">
			<thead>
				<tr className="bg-white/10">
					{header.map((cell, index) => (
						<th
							key={index}
							className="text-left px-3 py-2 font-semibold text-white whitespace-nowrap">
							{renderInline(cell)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, rIndex) => (
					<tr key={rIndex} className="border-t border-white/10 align-top">
						{row.map((cell, cIndex) => (
							<td key={cIndex} className="px-3 py-2 whitespace-pre-wrap">
								{renderInline(cell)}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

const renderText = (text: string) => {
	const lines = text.split("\n");
	const blocks: ReactNode[] = [];
	let i = 0;
	let blockIndex = 0;

	const flushHeading = (line: string) => {
		const match = line.match(/^(#{1,3})\s+(.*)/);
		if (!match) return false;
		const level = match[1].length;
		const cls = [
			"text-base",
			"text-[15px]",
			"text-[13px]",
		][level - 1];
		blocks.push(
			<p key={blockIndex++} className={`${cls} font-bold text-white`}>
				{renderInline(match[2])}
			</p>,
		);
		return true;
	};

	while (i < lines.length) {
		const raw = lines[i];
		const trimmed = raw.trim();

		if (!trimmed) {
			i++;
			continue;
		}

		if (flushHeading(raw)) {
			i++;
			continue;
		}

		// Markdown table
		if (trimmed.startsWith("|") && i + 1 < lines.length && isSeparatorRow(lines[i + 1].trim())) {
			const header = parseTableRow(trimmed);
			i += 2;
			const rows: string[][] = [];
			while (i < lines.length) {
				const rowLine = lines[i].trim();
				if (!rowLine.startsWith("|") || isSeparatorRow(rowLine)) break;
				rows.push(parseTableRow(rowLine));
				i++;
			}
			blocks.push(
				<div key={blockIndex++} className="w-full">
					{renderTable(header, rows)}
				</div>,
			);
			continue;
		}

		// Unordered list
		if (/^[-•*]\s+/.test(trimmed)) {
			const items: ReactNode[] = [];
			while (i < lines.length) {
				const t = lines[i].trim();
				const match = t.match(/^[-•*]\s+(.*)/);
				if (!match) break;
				items.push(
					<li key={i} className="pl-1 mb-0.5">
						{renderInline(match[1])}
					</li>,
				);
				i++;
			}
			blocks.push(
				<ul key={blockIndex++} className="list-disc list-outside ml-4 flex flex-col gap-0.5 text-sm text-gray-200">
					{items}
				</ul>,
			);
			continue;
		}

		// Ordered list
		if (/^\d+[.)]\s+/.test(trimmed)) {
			const items: ReactNode[] = [];
			while (i < lines.length) {
				const t = lines[i].trim();
				const match = t.match(/^\d+[.)]\s+(.*)/);
				if (!match) break;
				items.push(
					<li key={i} className="pl-1 mb-0.5">
						{renderInline(match[1])}
					</li>,
				);
				i++;
			}
			blocks.push(
				<ol key={blockIndex++} className="list-decimal list-outside ml-4 flex flex-col gap-0.5 text-sm text-gray-200">
					{items}
				</ol>,
			);
			continue;
		}

		// Paragraph
		blocks.push(
			<p key={blockIndex++} className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
				{renderInline(trimmed)}
			</p>,
		);
		i++;
	}

	return blocks;
};

/* ── Message bubbles ───────────────────────────────────────────────────────── */

const AssistantBody = ({ message }: { message: UIMessage }) => {
	return (
		<div className="flex flex-col gap-3">
			{message.parts.map((part, index) => {
				if (part.type === "text") {
					return (
						<div key={index} className="flex flex-col gap-2">
							{renderText(part.text)}
						</div>
					);
				}
				if (isToolPart(part)) {
					const tool = (part as any).tool || part;
					if (tool?.state === "output-available" || tool?.output) {
						return <ToolResultGrid key={index} output={tool.output as ToolOutput} />;
					}
					if (tool?.state === "output-error") {
						return (
							<p key={index} className="text-xs text-red-400/80">
								Oops, I hit a snag looking that up. Try rephrasing.
							</p>
						);
					}
					if (tool?.state === "input-available" || tool?.state === "input-streaming") {
						return (
							<div
								key={index}
								className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
								<span>Looking that up…</span>
							</div>
						);
					}
					return null;
				}
				return null;
			})}
		</div>
	);
};

const ChatMessage = ({ message }: { message: UIMessage }) => {
	const isUser = message.role === "user";
	const hasPosters =
		!isUser &&
		message.parts.some(
			(part) =>
				isToolPart(part) &&
				((part as any).tool?.state === "output-available" ||
					(part as any).tool?.output)
		);

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, ease: "easeOut" }}
			className={`flex w-full gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
			{!isUser && !hasPosters ? (
				<div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary flex-shrink-0 mt-1">
					<AiOutlineRobot className="text-sm" />
				</div>
			) : null}
			<div
				className={
					hasPosters
						? "w-[calc(100%+2rem)] -ml-4 px-4 py-1 text-left"
						: `max-w-[85%] rounded-2xl px-4 py-3 ${
								isUser
									? "bg-primary/90 text-white rounded-br-sm"
									: "bg-white/5 border border-white/10 text-left rounded-bl-sm"
							}`
				}>
				<AssistantBody message={message} />
			</div>
		</motion.div>
	);
};

export default ChatMessage;
