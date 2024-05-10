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

import type { ProducerManagerInterface } from "./kafka/producer";
import { ProducerManagerUpstash } from "./kafka/producer";
import type { ExRateData } from "./vcb-ex-rate";
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
		const exData: ExRateData[] = await getExRate();

		const myProducer: ProducerManagerInterface = new ProducerManagerUpstash({
			url: env.UPSTASH_KAFKA_REST_URL,
			username: env.UPSTASH_KAFKA_REST_USERNAME,
			password: env.UPSTASH_KAFKA_REST_PASSWORD,
			clientId: 'vcb-ex-rate-producer',
		});

		console.log('myProducer==>', exData)

		try {
			const TOPIC = 'vcb-exchange-rate';
			let jobs: Promise<any>[] = [];

			exData.forEach((item) => {
				jobs.push(myProducer.produceOne(
					TOPIC,
					{
						...item,
						'timestamp': Date.now().toString(),
					},
					item.CurrencyCode,
				))
			});

			// * wait for all jobs to finish
			let res = await Promise.all(jobs);
			console.log('All jobs done:', res);

		} catch (error) {
			console.error('Error while producing message:', error);
		}
		

		// You could store this result in KV, write to a D1 Database, or publish to a Queue.
		// In this template, we'll just log the result:
		console.log(`trigger fired at ${event.cron}: OK`);
	},
};
