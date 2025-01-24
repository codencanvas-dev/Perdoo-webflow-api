import { CollectionItem } from 'webflow-api/api';
import { getAllBlogs } from './utils/getAllBlogs';
import { mapCategoryToBlog, mergeWithCategoryMapping } from './utils/mapCategoryToBlog';
import { Env } from './utils/types';
import { getAllCollections, getCollectionData, getWebflowClient } from './utils/webflow';
import { getDataFromCache, setDataToCache } from './utils/db';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		let allModified: CollectionItem[] = [];

		// instantiating webflow client & KV storage
		const client = getWebflowClient(env as Env);
		const KV = env.perdooCache;

		// checking if data exists in cache
		const cacheKey = `perdo_${env.PERDOO_SITE_ID}`;
		const cachedBlogs = await getDataFromCache(cacheKey, KV);
		const headerOptions = {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
		};
		if (cachedBlogs) return new Response(JSON.stringify(cachedBlogs), { headers: headerOptions });

		//getting all collections
		const { collections } = await getAllCollections(client, (env as Env).PERDOO_SITE_ID);

		// Map display names to collection IDs for easier reference
		const collectionIds = {
			Blogs: collections?.find((cl) => cl.displayName === 'Blogs')?.id,
			OnlineGuides: collections?.find((cl) => cl.displayName === 'Online guides')?.id,
			Ebooks: collections?.find((cl) => cl.displayName === 'Ebooks and Downloads')?.id,
			Videos: collections?.find((cl) => cl.displayName === 'Videos')?.id,
			Podcasts: collections?.find((cl) => cl.displayName === 'Podcasts')?.id,
			Categories: collections?.find((cl) => cl.displayName === 'Categories')?.id,
			Authors: collections?.find((cl) => cl.displayName === 'Authors')?.id,
		};

		// Fetch data for blogs, guides, etc.
		const [blogs, onlineGuides, ebooks, videos, podcasts] = await Promise.all([
			getAllBlogs(client, collectionIds.Blogs!),
			getAllBlogs(client, collectionIds.OnlineGuides!),
			getAllBlogs(client, collectionIds.Ebooks!),
			getAllBlogs(client, collectionIds.Videos!),
			getAllBlogs(client, collectionIds.Podcasts!),
		]);

		// Fetch category collection data
		const categories = (await getCollectionData(client, collectionIds.Categories!)).items;
		const authors = (await getCollectionData(client, collectionIds.Authors!)).items;

		//mapping blogs single main category with category name
		allModified = [
			...allModified,
			...mergeWithCategoryMapping(categories!, blogs, authors!),
			...mergeWithCategoryMapping(categories!, onlineGuides, authors!),
			...mergeWithCategoryMapping(categories!, ebooks, authors!),
			...mergeWithCategoryMapping(categories!, videos, authors!),
			...mergeWithCategoryMapping(categories!, podcasts, authors!),
		];

		const sortedBlogs = allModified.sort((a, b) => {
			const bDate = b.createdOn ? new Date(b.createdOn).getTime() : 0;
			const aDate = a.createdOn ? new Date(a.createdOn).getTime() : 0;
			return bDate - aDate;
		});

		// setting data to cache
		await setDataToCache(cacheKey, allModified, KV);

		return new Response(JSON.stringify(sortedBlogs));
	},
} satisfies ExportedHandler<Env>;
