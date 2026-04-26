import { buildCrudControllers } from "./crudFactory.js";
import Course from "../models/Course.js";
import SearchQueryAnalytics from "../models/SearchQueryAnalytics.js";

const coursesController = buildCrudControllers("courses");

export const getAllCourses = coursesController.getAll;
export const getCourseById = coursesController.getById;
export const createCourse = coursesController.create;
export const updateCourse = coursesController.update;
export const deleteCourse = coursesController.delete;

function parseList(value) {
	if (!value) return [];
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter(Boolean);
	}
	return String(value)
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}

function parseSort(sortBy, hasQuery) {
	const normalized = String(sortBy || "").toLowerCase();
	if (normalized === "rating" || normalized === "time") return normalized;
	return hasQuery ? "relevance" : "rating";
}

function parsePagination(query) {
	const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
	const pageSize = Math.min(24, Math.max(4, Number.parseInt(query.pageSize, 10) || 8));
	return { page, pageSize };
}

function buildFilterMatch({ category, level, tags }) {
	const match = { isPublished: true };
	if (category.length > 0) match.category = { $in: category };
	if (level.length > 0) match.level = { $in: level };
	if (tags.length > 0) match.tags = { $in: tags };
	return match;
}

function buildSearchPipeline({ query, filters, sortBy, page, pageSize }) {
	const q = String(query || "").trim();
	const hasQuery = q.length > 0;
	const baseFilter = buildFilterMatch(filters);
	const now = new Date();

	const pipeline = [];

	if (hasQuery) {
		pipeline.push({
			$match: {
				...baseFilter,
				$text: { $search: q },
			},
		});
		pipeline.push({
			$addFields: {
				textScore: { $meta: "textScore" },
			},
		});
	} else {
		pipeline.push({ $match: baseFilter });
		pipeline.push({
			$addFields: {
				textScore: 0,
			},
		});
	}

	pipeline.push({
		$addFields: {
			ratingScore: {
				$divide: [{ $ifNull: ["$rating", 0] }, 5],
			},
			recencyScore: {
				$divide: [
					1,
					{
						$add: [
							1,
							{
								$divide: [{ $subtract: [now, "$createdAt"] }, 1000 * 60 * 60 * 24],
							},
						],
					},
				],
			},
		},
	});

	pipeline.push({
		$addFields: {
			weightedScore: {
				$add: [
					{ $multiply: ["$textScore", 0.7] },
					{ $multiply: ["$ratingScore", 0.2] },
					{ $multiply: ["$recencyScore", 0.1] },
				],
			},
		},
	});

	if (sortBy === "time") {
		pipeline.push({ $sort: { createdAt: -1, rating: -1 } });
	} else if (sortBy === "rating") {
		pipeline.push({ $sort: { rating: -1, reviewCount: -1, createdAt: -1 } });
	} else {
		pipeline.push({ $sort: { weightedScore: -1, rating: -1, createdAt: -1 } });
	}

	pipeline.push({
		$facet: {
			metadata: [{ $count: "total" }],
			items: [
				{ $skip: (page - 1) * pageSize },
				{ $limit: pageSize },
			],
		},
	});

	return pipeline;
}

function tokenizeQuery(query) {
	return String(query || "")
		.toLowerCase()
		.split(/\s+/)
		.map((token) => token.trim())
		.filter((token) => token.length > 1);
}

function levenshteinDistance(left, right) {
	if (left === right) return 0;
	const matrix = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0));
	for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
	for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;

	for (let i = 1; i <= left.length; i += 1) {
		for (let j = 1; j <= right.length; j += 1) {
			const cost = left[i - 1] === right[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j - 1] + cost
			);
		}
	}

	return matrix[left.length][right.length];
}

async function getTypoCandidates({ query, filters, limit = 8 }) {
	const tokens = tokenizeQuery(query);
	if (tokens.length === 0) return [];

	const regexes = tokens.map((token) => new RegExp(token.slice(0, Math.max(2, token.length - 1)), "i"));
	const baseMatch = buildFilterMatch(filters);

	const candidates = await Course.find({
		...baseMatch,
		$or: [
			{ title: { $in: regexes } },
			{ tags: { $in: regexes } },
			{ category: { $in: regexes } },
		],
	})
		.sort({ rating: -1, createdAt: -1 })
		.limit(32)
		.lean({ virtuals: true });

	const scored = candidates
		.map((course) => {
			const title = String(course.title || "").toLowerCase();
			const bestDistance = tokens.reduce((best, token) => {
				const distance = levenshteinDistance(token, title.slice(0, token.length));
				return Math.min(best, distance);
			}, Number.POSITIVE_INFINITY);

			return {
				...course,
				typoDistance: bestDistance,
			};
		})
		.sort((left, right) => left.typoDistance - right.typoDistance || right.rating - left.rating)
		.slice(0, limit)
		.map((course) => {
			const item = { ...course };
			delete item.typoDistance;
			return item;
		});

	return scored;
}

export async function searchCourses(req, res) {
	const startedAt = Date.now();
	const rawQuery = String(req.query.q || "").trim();
	const filters = {
		category: parseList(req.query.category),
		level: parseList(req.query.level),
		tags: parseList(req.query.tags),
	};

	const { page, pageSize } = parsePagination(req.query);
	const sortBy = parseSort(req.query.sortBy, rawQuery.length > 0);

	const [result] = await Course.aggregate(
		buildSearchPipeline({
			query: rawQuery,
			filters,
			sortBy,
			page,
			pageSize,
		})
	);

	const items = result?.items || [];
	const total = result?.metadata?.[0]?.total || 0;

	let typoSuggestions = [];
	if (rawQuery && total < 3) {
		const fallback = await getTypoCandidates({ query: rawQuery, filters, limit: pageSize });
		const seen = new Set(items.map((item) => String(item._id || item.id)));
		typoSuggestions = fallback.filter((item) => !seen.has(String(item._id || item.id)));
	}

	try {
		await SearchQueryAnalytics.create({
			query: rawQuery,
			normalizedQuery: rawQuery.toLowerCase(),
			filters,
			sortBy,
			page,
			pageSize,
			resultsCount: total,
			latencyMs: Date.now() - startedAt,
			userId: req.user?.id || null,
		});
	} catch {
		// Analytics should never break search results.
	}

	res.status(200).json({
		success: true,
		data: {
			query: rawQuery,
			sortBy,
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
			items,
			typoSuggestions,
		},
	});
}

export async function getCourseSearchFacets(req, res) {
	const rawQuery = String(req.query.q || "").trim();
	const filters = {
		category: parseList(req.query.category),
		level: parseList(req.query.level),
		tags: parseList(req.query.tags),
	};

	const baseFilter = buildFilterMatch(filters);
	const qMatch = rawQuery ? { $text: { $search: rawQuery } } : {};

	const [facets] = await Course.aggregate([
		{
			$match: {
				...baseFilter,
				...qMatch,
			},
		},
		{
			$facet: {
				category: [
					{ $group: { _id: "$category", count: { $sum: 1 } } },
					{ $sort: { count: -1, _id: 1 } },
				],
				level: [
					{ $group: { _id: "$level", count: { $sum: 1 } } },
					{ $sort: { count: -1, _id: 1 } },
				],
				tags: [
					{ $unwind: { path: "$tags", preserveNullAndEmptyArrays: false } },
					{ $group: { _id: "$tags", count: { $sum: 1 } } },
					{ $sort: { count: -1, _id: 1 } },
					{ $limit: 20 },
				],
			},
		},
	]);

	const normalize = (items = []) => items
		.filter((item) => item._id)
		.map((item) => ({ value: item._id, count: item.count }));

	res.status(200).json({
		success: true,
		data: {
			category: normalize(facets?.category),
			level: normalize(facets?.level),
			tags: normalize(facets?.tags),
		},
	});
}

export async function getCourseSearchAnalytics(req, res) {
	const limit = Math.min(50, Math.max(5, Number.parseInt(req.query.limit, 10) || 20));

	const [topQueries, lastHour] = await Promise.all([
		SearchQueryAnalytics.aggregate([
			{
				$match: {
					normalizedQuery: { $ne: "" },
				},
			},
			{
				$group: {
					_id: "$normalizedQuery",
					count: { $sum: 1 },
					avgResults: { $avg: "$resultsCount" },
					avgLatencyMs: { $avg: "$latencyMs" },
					lastSeenAt: { $max: "$createdAt" },
				},
			},
			{ $sort: { count: -1, lastSeenAt: -1 } },
			{ $limit: limit },
		]),
		SearchQueryAnalytics.countDocuments({
			createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
		}),
	]);

	res.status(200).json({
		success: true,
		data: {
			eventsLastHour: lastHour,
			topQueries: topQueries.map((item) => ({
				query: item._id,
				count: item.count,
				avgResults: Number(item.avgResults.toFixed(1)),
				avgLatencyMs: Number(item.avgLatencyMs.toFixed(1)),
				lastSeenAt: item.lastSeenAt,
			})),
		},
	});
}
