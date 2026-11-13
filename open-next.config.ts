// Every page is prerendered, so the incremental cache is read straight from static assets
// (no R2 bucket needed).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
	enableCacheInterception: true,
});
