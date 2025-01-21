import { WebflowClient } from 'webflow-api';
import { getCollectionData } from './webflow';
import { CollectionItem } from 'webflow-api/api';

/**
 * Retrieves all blog entries from a Webflow collection using pagination.
 *
 * This function fetches blogs from a Webflow collection in batches of 100 items per request
 * until all items are retrieved. The function ensures that large datasets are handled efficiently.
 *
 * @param {WebflowClient} client - The Webflow client instance used to make API requests.
 * @param {string} id - The ID of the Webflow collection from which blogs are retrieved.
 * @returns {Promise<CollectionItem[]>} A promise that resolves to an array of all blog entries (`CollectionItem[]`).
 *
 * @throws {Error} If there is an issue with fetching collection data from the Webflow API.
 */
export async function getAllBlogs(client: WebflowClient, id: string): Promise<CollectionItem[]> {
	let allBlogs: CollectionItem[] = []; // Initialize as an empty array
	let offset = 0;
	const limit = 100;

	while (true) {
		const response = await getCollectionData(client, id, offset, limit);
		const blogs: CollectionItem[] = response?.items!;
		allBlogs = [...allBlogs, ...blogs];

		// Check if fewer than 100 items are returned (indicating we've reached the end of the data)
		if (blogs!.length < limit) {
			break;
		}

		// Increment offset for the next set of results
		offset += limit;
	}
	return allBlogs;
}
