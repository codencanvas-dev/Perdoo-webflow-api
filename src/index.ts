import { getDataFromCache } from './utils/db';
import { Env } from './utils/types';
import { getAllCollections, getWebflowClient } from './utils/webflow';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// instantiating webflow client & KV storage
		const client = getWebflowClient(env as Env);
		const KV = (env as Env).perdooCache;

		// check if data is cached already and if it exists return that data from the cache itself
		const cacheKey = `blogs_${(env as Env).PERDOO_SITE_ID}`;
		const cachedBlogs = await getDataFromCache(cacheKey, KV);

		const headerOptions = {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
		};
		if (cachedBlogs) return new Response(JSON.stringify(cachedBlogs), { headers: headerOptions });

		//getting all collections
		const { collections } = await getAllCollections(client, (env as Env).PERDOO_SITE_ID);

		return new Response('Working on it');
	},
} satisfies ExportedHandler<Env>;
