import { CollectionItem } from 'webflow-api/api';
import { getAllBlogs } from './utils/getAllBlogs';
import { mapCategoryToBlog, mergeWithCategoryMapping } from './utils/mapCategoryToBlog';
import { Env } from './utils/types';
import { getAllCollections, getCollectionData, getWebflowClient } from './utils/webflow';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		let allModified: CollectionItem[] = [];

		// instantiating webflow client & KV storage
		const client = getWebflowClient(env as Env);

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

		console.log(allModified[0].fieldData.author);

		return new Response('hello from server...');
	},
} satisfies ExportedHandler<Env>;
