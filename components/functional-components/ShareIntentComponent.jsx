import shareIntentFunctionality from "@/utils/ShareIntentFunctionality";

import { IoShareSocialOutline } from "react-icons/io5";

export default function ShareIntentComponent() {
	return (
		<button
			className="border-dotted rounded-sm border-2 px-2 py-1"
			onClick={() => shareIntentFunctionality()}
		>
			<IoShareSocialOutline />
		</button>
	);
}
