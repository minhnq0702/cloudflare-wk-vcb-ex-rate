/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import getExRate from "./vcb-ex-rate";

export default {
	// * The fetch handler is invoked when the Worker receives an HTTP request.
	// ! Only for development testing purposes, not used in production.
	async fetch(event: FetchEvent, env: Env, ctx: ExecutionContext): Promise<Response> { 
		return new Response('Hello, world! This is a scheduled Worker.', {
			headers: { 'content-type': 'text/plain' },
		});
	},

	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	// * To run on development, use `yarn start` or `npm run start` and make request to /__scheduled?cron=*+*+*+*+*
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		// We'll keep it simple and make an API call to a Cloudflare API:
		// const resp = await fetch('https://api.cloudflare.com/client/v4/ips');
		// const wasSuccessful = resp.ok ? 'success' : 'fail';
		const wasSuccessful: String = await getExRate();

		// You could store this result in KV, write to a D1 Database, or publish to a Queue.
		// In this template, we'll just log the result:
		console.log(`trigger fired at ${event.cron}: ${wasSuccessful}`);
	},
};
