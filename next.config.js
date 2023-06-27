/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ["image.tmdb.org"],
	},
	staticPageGenerationTimeout: 1000,
};

module.exports = nextConfig;
