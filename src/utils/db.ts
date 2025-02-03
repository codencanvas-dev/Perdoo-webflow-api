/**
 *
 * @param {string} key
 * @param {KVNamespace} KV
 * @returns {Promise<any>}
 */
export const getDataFromCache = async (key: string, KV: KVNamespace): Promise<any> => {
	const cachedData = await KV.get(key);
	if (cachedData) return JSON.parse(cachedData);
	return null;
};

/**
 *
 * @param {string} key
 * @param {any} data
 * @param {KVNamespace} KV
 */
export const setDataToCache = async (key: string, data: any, KV: KVNamespace): Promise<any> => {
	await KV.put(key, JSON.stringify(data), { expirationTtl: 120 });
};
