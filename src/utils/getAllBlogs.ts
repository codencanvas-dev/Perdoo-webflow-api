import { WebflowClient } from 'webflow-api';
import { getCollectionData } from './webflow';
import { CollectionItem } from 'webflow-api/api';

export async function getAllBlogs(client: WebflowClient, id: string): Promise<CollectionItem[]> {
	let allBlogs: CollectionItem[] = []; // Initialize as an empty array
	let offset = 0;
	const limit = 100;

	while (true) {
		const response = await getCollectionData(client, id, offset, limit);
		const blogs = response.items;
		allBlogs = [...allBlogs, ...(blogs as CollectionItem[])];

		// Check if fewer than 100 items are returned (indicating we've reached the end of the data)
		if (blogs!.length < limit) {
			break;
		}

		// Increment offset for the next set of results
		offset += limit;
	}
	return allBlogs;
}
