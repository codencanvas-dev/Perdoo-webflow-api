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
	collectionSlug: string
): CollectionItem[] | undefined => {
	if (!blogs.length) return undefined;

	const categoryMap = new Map(categories.map((category) => [category.id, category.fieldData.name]));
	const authorMap = new Map(authors.map((author) => [author.id, author.fieldData]));

	const response = blogs.map((blog) => {
		// Match any field that looks like categories / categories-2 / category etc.
		const categoryFields = Object.keys(blog.fieldData).filter((key) =>
			key.match(/^categories?(-\d+)?$/)
		);

		// Collect all category IDs
		const categoryIds: string[] = categoryFields.flatMap((field) => {
			const value = blog.fieldData[field];
			if (Array.isArray(value)) return value;
			if (typeof value === 'string') return [value];
			return [];
		});

		const categoryNames = categoryIds.map((id) => categoryMap.get(id)).filter(Boolean);
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
	authors: CollectionItem[],
	collectionSlug: string
): CollectionItem[] => {
	const modifiedItems = mapCategoryToBlog(categories, items, authors, collectionSlug);
	return modifiedItems ?? items;
};
