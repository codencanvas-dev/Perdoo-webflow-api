import { CollectionItem } from 'webflow-api/api';

/**
 * Maps categories to their corresponding blogs by matching their IDs
 * and returns a new array of blogs with the updated `category` field.
 *
 * @param {CollectionItem[]} categories - The array of category objects.
 * Each category object contains an `id` and `fieldData` with a `name` property.
 * @param {CollectionItem[]} blogs - The array of blog objects.
 * Each blog object contains an `id` and `fieldData` where category fields may exist.
 * @returns {CollectionItem[]} A new array of blogs with the updated `category` field.
 */
export const mapCategoryToBlog = (
	categories: CollectionItem[],
	blogs: CollectionItem[],
	authors: CollectionItem[],
	collectionSlug: string,
	categoryFieldKey: string = 'category' // default to 'category' for blogs
): CollectionItem[] | undefined => {
	// Return early if the category field is missing
	if (!blogs[0].fieldData[categoryFieldKey]) return undefined;


	const categoryMap = new Map(categories.map((category) => [category.id, category.fieldData.name]));
	const authorMap = new Map(authors.map((author) => [author.id, author.fieldData]));

	const response = blogs.map((blog) => {
    
		const categoryIds = blog.fieldData[categoryFieldKey];
		const category = Array.isArray(categoryIds)
		? categoryIds.map((id: string) => categoryMap.get(id))
		: []; // fallback to empty array if not an array		const author = authorMap.get(blog.fieldData.author);

		const author = authorMap.get(blog.fieldData.author);

		return {
			...blog,
			fieldData: {
				...blog.fieldData,
				author,
				category: categoryNames,
				slug: `/resources/${collectionSlug}/${blog.fieldData.slug}`,
			},
		};
	});

	return response;
};


/**
 * Merges blog items with category and author mapping if categories exist.
 *
 * @param categories List of categories
 * @param items List of items to be mapped with categories
 * @param authors List of authors
 * @param collectionSlug Slug used to build resource URL
 * @returns Mapped items with enriched fields
 */
export const mergeWithCategoryMapping = (
	categories: CollectionItem[],
	items: CollectionItem[],
	collectionSlug: string,
	categoryFieldKey: string = 'category'
) => {
	const modifiedItems = mapCategoryToBlog(categories, items, authors, collectionSlug, categoryFieldKey);
	return modifiedItems ? modifiedItems : items;

};
