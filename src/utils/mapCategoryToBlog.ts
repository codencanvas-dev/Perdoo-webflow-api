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
export const mapCategoryToBlog = (categories: CollectionItem[], blogs: CollectionItem[]): CollectionItem[] => {
	// Create a lookup map for categories by ID for efficient access
	const categoryMap = new Map(categories.map((category) => [category.id, category.fieldData.name]));

	// Return a new array of blogs with the updated field
	return blogs.map((blog) => {
		const categoryName = categoryMap.get(blog.fieldData['single-main-category']);
		return {
			...blog,
			fieldData: {
				...blog.fieldData,
				'single-main-category': categoryName || null,
			},
		};
	});
};
