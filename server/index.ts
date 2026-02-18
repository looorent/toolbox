import { logger } from "@utils/logger"

export default {
	fetch(request) {
		const url = new URL(request.url);

		logger.info("Incoming request: %s %s", request.method, url.pathname);

		if (url.pathname.startsWith("/api/")) {
			logger.debug("API route hit: %s", url.pathname);
			return Response.json({
				name: "I still need to implement this part, hello!",
			});
		}
		
		logger.warn("Route not found: %s", url.pathname);
		return new Response(null, { status: 404 });
	},
} satisfies ExportedHandler<Env>;
