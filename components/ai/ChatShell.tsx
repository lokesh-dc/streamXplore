"use client";

import { useState } from "react";
import ChatBot from "./ChatBot";

const ChatShell = ({ children }: { children: React.ReactNode }) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<main>{children}</main>
			<ChatBot open={open} onOpenChange={setOpen} />
		</>
	);
};

export default ChatShell;