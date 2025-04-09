import { CollectionItem } from 'webflow-api/api';
import { getAllBlogs } from './utils/getAllBlogs';
import { mergeWithCategoryMapping } from './utils/mapCategoryToBlog';
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
			Ebooks: collections?.find((cl) => cl.displayName === 'Ebooks & Downloads')?.id,
			Videos: collections?.find((cl) => cl.displayName === 'Videos')?.id,
			Podcasts: collections?.find((cl) => cl.displayName === 'Podcasts & Interviews')?.id,
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
			...mergeWithCategoryMapping(categories!, blogs, authors!, 'blog'),
			...mergeWithCategoryMapping(categories!, onlineGuides, authors!, 'online-guides'),
			...mergeWithCategoryMapping(categories!, ebooks, authors!, 'ebooks-downloads'),
			...mergeWithCategoryMapping(categories!, videos, authors!, 'videos'),
			...mergeWithCategoryMapping(categories!, podcasts, authors!, 'podcasts'),
		];

		const finalData = allModified
			.sort((a, b) => {
				const bDate = b.fieldData['publishing-date'] ? new Date(b.fieldData['publishing-date']).getTime() : 0;
				const aDate = a.fieldData['publishing-date'] ? new Date(a.fieldData['publishing-date']).getTime() : 0;
				return bDate - aDate;
			})
			.map((blog) => ({
				readTime: blog.fieldData['read-time'],
				altFeaturedImage: blog.fieldData['alt-featured-image'],
				featuredImage: blog.fieldData['featured-image'],
				name: blog.fieldData.name,
				author: blog.fieldData.author,
				category: blog.fieldData.category,
				slug: blog.fieldData.slug,
				hideOnListing: blog.fieldData['hide-it-on-listings'] || undefined,
				videoSlug: blog.fieldData['video-src'] || undefined,
			}));

		// setting data to cache
		await setDataToCache(cacheKey, finalData, KV);

		return new Response(JSON.stringify(finalData), { headers: headerOptions });
	},
} satisfies ExportedHandler<Env>;
