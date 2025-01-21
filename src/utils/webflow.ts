import { WebflowClient } from 'webflow-api';
import { CollectionItemList, CollectionList } from 'webflow-api/api';
import { Env } from './types';

/**
 * Creates and returns a WebflowClient instance.
 *
 * @param {Env} env - Environment configuration object containing the Webflow access token.
 * @returns An instance of WebflowClient configured with the provided access token.
 */
export const getWebflowClient = (env: Env): WebflowClient => {
	return new WebflowClient({
		accessToken: env.WEBFLOW_ACCESS_TOKEN,
	});
};

/**
 * Fetches all collections for a given site ID using the Webflow client.
 *
 * @param {WebflowClient} client - The WebflowClient instance for API interaction.
 * @param {string} siteId - The ID of the site for which collections are fetched.
 * @returns A promise resolving to an object containing an array of WebflowCollection.
 */
export const getAllCollections = async (client: WebflowClient, siteId: string): Promise<CollectionList> => {
	return await client.collections.list(siteId);
};

/**
 *
 * @param {WebflowClient} client
 * @param {string} collectionId
 * @returns A promise resolving to an object containing an array of WebflowCollection data.
 */
export const getCollectionData = async (
	client: WebflowClient,
	collectionId: string,
	offset: number = 0,
	limit: number = 100
): Promise<CollectionItemList> => {
	return await client.collections.items.listItemsLive(collectionId, { offset: offset, limit: limit });
};
