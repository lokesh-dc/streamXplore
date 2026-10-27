import Image from "next/image";

import { getImageBaseLink } from "@/constants";
import type { WatchProvider } from "@/dataFetchings/getWatchProviders";

type ProviderLogoSize = "xs" | "sm" | "md" | "lg";

const SIZE_STYLES: Record<ProviderLogoSize, string> = {
	xs: "h-7 w-7 rounded-md p-1",
	sm: "h-9 w-9 rounded-lg p-1",
	md: "h-14 w-14 rounded-xl p-2",
	lg: "h-20 w-20 rounded-2xl p-2.5",
};

const IMAGE_SIZES: Record<ProviderLogoSize, string> = {
	xs: "28px",
	sm: "36px",
	md: "56px",
	lg: "80px",
};

interface ProviderLogoProps {
	provider: WatchProvider;
	size?: ProviderLogoSize;
	className?: string;
}

const ProviderLogo = ({
	provider,
	size = "md",
	className = "",
}: ProviderLogoProps) => (
	<span
		aria-hidden="true"
		className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white ${SIZE_STYLES[size]} ${className}`}>
		{provider.logo_path ? (
			<Image
				unoptimized
				fill
				sizes={IMAGE_SIZES[size]}
				src={getImageBaseLink({
					type: "logo",
					quality: "md",
					path: provider.logo_path,
				})}
				alt=""
				className="object-contain"
			/>
		) : (
			<span className="font-display text-lg leading-none text-black">
				{provider.provider_name.slice(0, 1)}
			</span>
		)}
	</span>
);

export default ProviderLogo;
