import { NextResponse } from "next/server";

// Aggressive bot/crawler block — stops search indexers, AI scrapers,
// SEO tools, and generic http clients to protect Vercel free-tier usage.
// (Next 16 `proxy` convention; replaces deprecated `middleware` file.)
export default function proxy(request) {
	const ua = request.headers.get("user-agent") || "";

	const BOT_PATTERN =
		/bot|crawl|spider|slurp|scrape|archiver|mediapartners|baidu|yandex|sogou|exabot|facebot|ia_archiver|ahrefs|semrush|mj12bot|dotbot|serpstat|screaming|dataforseo|gptbot|chatgpt|gpt-actions|ccbot|anthropic|claudebot|cohere|bytespider|perplexity|google-extended|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|outbrain|pinterest|slackbot|discordbot|telegrambot|whatsapp|skype|amazonbot|shapbot|oai-searchbot|duckassistbot|applebot|java\/|curl|wget|python-requests|python-urllib|go-http-client|httpclient|axios|node-fetch|libwww|mechanize|phantomjs|headlesschrome.*bot|adsbot|mediatoolkit/i;

	// Block empty user-agents (almost always bots/scripts) and known crawlers.
	if (!ua || BOT_PATTERN.test(ua)) {
		return new NextResponse("Forbidden", {
			status: 403,
			headers: {
				"X-Robots-Tag": "noindex, nofollow, noarchive",
				"Cache-Control": "no-store",
			},
		});
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|favicon.ico).*)"],
};
