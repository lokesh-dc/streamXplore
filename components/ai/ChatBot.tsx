"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import ChatMessage from "./ChatMessage";
import { BiSolidBot, BiSend, BiX, BiLoaderAlt } from "react-icons/bi";

const SUGGESTIONS = [
	"What should I watch tonight?",
	"Funny 90s comedy movies",
	"Best sci-fi TV series from the 2020s",
	"I loved The Dark Knight, what's similar?",
];

interface ChatBotProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ChatBot = ({ open, onOpenChange }: ChatBotProps) => {
	const [input, setInput] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	const { messages, sendMessage, status, error, stop } = useChat({
		transport: new DefaultChatTransport({ api: "/api/chat" }),
	});

	/* Lock body scroll only on mobile (sidebar is fine on desktop). */
	useEffect(() => {
		if (!open) return;
		const mq = window.matchMedia("(min-width: 1024px)");
		const apply = () => {
			if (mq.matches) {
				document.body.style.overflow = "";
				document.body.style.overscrollBehavior = "";
				document.body.classList.remove("body-locked");
			} else {
				document.body.style.overflow = "hidden";
				document.body.style.overscrollBehavior = "none";
				document.body.classList.add("body-locked");
			}
		};
		apply();
		mq.addEventListener("change", apply);
		return () => {
			mq.removeEventListener("change", apply);
			document.body.style.overflow = "";
			document.body.style.overscrollBehavior = "";
			document.body.classList.remove("body-locked");
		};
	}, [open]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
				e.preventDefault();
				onOpenChange(!open);
			}
			if (e.key === "Escape") onOpenChange(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, onOpenChange]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, open]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const value = input.trim();
		if (!value) return;
		sendMessage({ text: value });
		setInput("");
	};

	const isStreaming = status === "streaming" || status === "submitted";

	return (
		<>
			{/* Launcher button — hidden while the panel is open */}
			{!open && (
				<motion.button
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					whileHover={{ scale: 1.08 }}
					whileTap={{ scale: 0.94 }}
					transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 22 }}
					onClick={() => onOpenChange(true)}
					aria-label="Open AI assistant"
					className="fixed bottom-5 right-5 z-[150] w-14 h-14 rounded-full bg-primary text-white shadow-[0_8px_30px_rgba(230,80,27,0.45)] flex items-center justify-center">
					<BiSolidBot className="text-3xl" />
				</motion.button>
			)}

			<AnimatePresence>
				{open && (
					<>
						{/* Click-away backdrop */}
						<motion.div
							key="chat-backdrop"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							onClick={() => onOpenChange(false)}
							className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-[2px]"
						/>

						{/* Panel — full-screen on mobile, 500px overlay on the right on desktop */}
						<motion.div
							key="chat-panel"
							initial={{ x: 40, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: 40, opacity: 0 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							className="fixed inset-0 z-[140] flex flex-col overflow-hidden bg-[#101010] lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[500px] lg:shadow-[-20px_0_60px_rgba(0,0,0,0.6)] lg:border-l lg:border-white/10">

							{/* Header */}
							<div className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:pt-3 pb-3 border-b border-white/10 bg-white/5">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
										<BiSolidBot className="text-xl" />
									</div>
									<div>
										<p className="text-sm font-bold text-white">Hooked AI</p>
										<p className="flex items-center gap-1.5 text-[11px] text-gray-400">
											<span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? "bg-primary animate-pulse" : "bg-emerald-400"}`} />
											{isStreaming ? "Thinking…" : "Online • Groq"}
										</p>
									</div>
								</div>
								<button
									onClick={() => onOpenChange(false)}
									className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
									<BiX className="text-2xl" />
								</button>
							</div>

							{/* Messages */}
							<div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 custom-scrollbar">
								{messages.length === 0 ? (
									<div className="flex flex-col gap-4 my-auto">
										<div className="text-center flex flex-col items-center gap-2">
											<BiSolidBot className="text-5xl text-primary/40" />
											<p className="text-sm text-gray-400">
												Ask me anything about movies & TV —
												I can search the whole catalog in real time.
											</p>
										</div>
										<div className="flex flex-col gap-2">
											{SUGGESTIONS.map((suggestion) => (
												<button
													key={suggestion}
													onClick={() => sendMessage({ text: suggestion })}
													className="text-left text-sm px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10 text-gray-300 transition-all">
													{suggestion}
												</button>
											))}
										</div>
									</div>
								) : (
									<>
										{messages.map((message) => (
											<ChatMessage key={message.id} message={message} />
										))}
										{status === "streaming" && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="flex items-center gap-2 text-gray-400 text-xs">
												<BiLoaderAlt className="animate-spin" />
												<span>Typing…</span>
											</motion.div>
										)}
									</>
								)}

								{error && (
									<div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
										<span>{error.message || "Something went wrong. Please try again."}</span>
									</div>
								)}
							</div>

							{/* Input */}
							<form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:pb-3 pt-3 border-t border-white/10 bg-white/5">
								<input
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Ask about movies or TV…"
									className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500 px-2 py-2 rounded-lg focus:bg-white/5 transition-colors"
								/>
								{isStreaming ? (
									<button
										type="button"
										onClick={stop}
										className="p-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
										<BiX className="text-xl" />
									</button>
								) : (
									<button
										type="submit"
										disabled={!input.trim()}
										className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
										<BiSend className="text-xl" />
									</button>
								)}
							</form>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default ChatBot;