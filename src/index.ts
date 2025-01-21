import { getDataFromCache } from './utils/db';
import { getAllBlogs } from './utils/getAllBlogs';
import { mapCategoryToBlog } from './utils/mapCategoryToBlog';
import { Env } from './utils/types';
import { getAllCollections, getCollectionData, getWebflowClient } from './utils/webflow';

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

		//getting only blogs and category collection
		const blogCollection = collections?.find((cl) => cl.displayName === 'Blogs');
		const categoryCollection = collections?.find((cl) => cl.displayName === 'Categories');

		//fetching blogs and category collections data
		const blogs = await getAllBlogs(client, blogCollection?.id!);
		const categories = (await getCollectionData(client, categoryCollection?.id!)).items;

		//mapping blogs single main category with category name
		const modifiedBlogs = mapCategoryToBlog(categories!, blogs);
		console.log(modifiedBlogs[0]);

		return new Response('hello from server...');
	},
} satisfies ExportedHandler<Env>;
