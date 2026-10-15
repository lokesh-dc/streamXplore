/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: false,
	images: {
		remotePatterns: [{ hostname: "image.tmdb.org" }],
	},
	staticPageGenerationTimeout: 1000,
	transpilePackages: ["swiper"],
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-Robots-Tag",
						value: "noindex, nofollow, noarchive, nosnippet, noimageindex, nocache",
					},
				],
			},
		];
	},
};

module.exports = nextConfig;
