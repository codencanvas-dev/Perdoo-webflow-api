import { CollectionItem } from 'webflow-api/api';

/**
 * Maps categories to their corresponding blogs by matching their IDs
 * and returns a new array of blogs with the updated `single-main-category` field.
 *
 * @param {CollectionItem[]} categories - The array of category objects.
 * Each category object contains an `id` and `fieldData` with a `name` property.
 * @param {CollectionItem[]} blogs - The array of blog objects.
 * Each blog object contains an `id` and `fieldData` where the `single-main-category` will be added.
 * @returns {CollectionItem[]} A new array of blogs with the updated `single-main-category` field.
 */
export const mapCategoryToBlog = (
	categories: CollectionItem[],
	blogs: CollectionItem[],
	authors: CollectionItem[],
	collectionSlug: string
): CollectionItem[] | undefined => {
	// if (!blogs[0].fieldData.category) return undefined;

	const hasCategory = blogs[0].fieldData.category;

	// Create a lookup map for categories by ID for efficient access
	const categoryMap = new Map(categories.map((category) => [category.id, category.fieldData.name]));
	const authorMap = new Map(authors.map((au) => [au.id, au.fieldData]));

	// Return a new array of blogs with the updated field
	const response = blogs.map((blog) => {
		const category = hasCategory && blog.fieldData.category.map((id: string) => categoryMap.get(id));
		const author = authorMap.get(blog.fieldData.author);

		return {
			...blog,
			fieldData: {
				...blog.fieldData,
				author,
				category,
				slug: `/resources/${collectionSlug}/${blog.fieldData.slug}`,
			},
		};
	});

	return response;
};

/**
 *
 * @param categories list of categories
 * @param items list of items to be mapped with cateogries
 * @returns mapped items if there is category otherwise items itself
 */
export const mergeWithCategoryMapping = (
	categories: CollectionItem[],
	items: CollectionItem[],
	authors: CollectionItem[],
	collectionSlug: string
) => {
	const modifiedItems = mapCategoryToBlog(categories, items, authors, collectionSlug);
	return modifiedItems ? modifiedItems : items;
};
