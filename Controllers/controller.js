const axios = require("axios");
const lodash = require("lodash");
const cacheClient = require("../cacheManager");
const helper = require("../helperMethods");

// controller method for /api/posts endpoint
exports.Posts = async (req, res) => {
	var sortByParameter = req.query.sortBy;
	var directionParameter = req.query.direction;
	// SortBy parameter and Directio parameter validation
	if (!helper.isSortByValid(sortByParameter)) {
		res.status(400).send({
			error: "sortBy parameter is invalid",
		});
	} else if (!helper.isDirectionValid(directionParameter)) {
		res.status(400).send({
			error: "direction parameter is invalid",
		});
	} else {
		try {
			// converts query object to string and set as cache key
			const cacheKey = JSON.stringify(req.query);
			// get result for query from cache
			cacheClient.get(cacheKey, async (err, posts) => {
				if (err) throw err;

				if (posts) {
					res.status(200).send({
						posts: JSON.parse(posts),
					});
				} else {
					if (!req.query.tags) {
						res.status(400).send({
							error: "Tags parameter is required",
						});
					}
					let posts = [];

					/* retrieve and filter all the tags from the 
					   URL using splitTags helper methods*/
					const tags = helper.splitTags(req.query.tags);

					// This block makes concurrent API calls with all the tags
					const requests = tags.map((tag) =>
						axios.get(
							"https://api.hatchways.io/assessment/blog/posts?tag=" +
								tag
						)
					);

					try {
						// wait until all the api calls resolves
						const result = await Promise.all(requests);

						/*merges all the posts from each result without 
						  duplicates using mergePosts helper method*/
						result.map((item) => {
							posts = helper.mergePosts(posts, item.data.posts);
						});
					} catch (err) {
						res.status(500).json({ error: String(err) });
					}

					// sort post using sortPosts helper method
					data = helper.sortPosts(
						posts,
						sortByParameter,
						directionParameter
					);

					// set result in cache
					cacheClient.setex(cacheKey, 600, JSON.stringify(data));
					return res.send({ posts: data });
				}
			});
		} catch (error) {}

		//return res.send({ posts: posts });
	}
};

// controller method for /api/ping endpoint
exports.Ping = (req, res) => {
	res.status(200).send({
		success: true,
	});
};
