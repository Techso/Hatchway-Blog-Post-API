const axios = require("axios");
const { query } = require("express");
const { result } = require("lodash");
const lodash = require("lodash");
const redis = require("redis");

//configure redis for caching function
const client = redis.createClient({
	port: 6379,
});
client.on("error", (error) => console.error(error));

/***helper methods***/

// function to split and trim tags from query
function splitTags(tags) {
	const tokens = tags.split(",");

	for (let i = 0; i < tokens.length; i++) {
		tokens[i] = tokens[i].trim();
	}

	return tokens;
}
// function to sort posts by likes
function sortPostsByLikes(unsortedPosts, direction) {
	if (direction == "asc") {
		unsortedPosts.sort((a, b) => (a.likes > b.likes ? 1 : -1));
	} else {
		unsortedPosts.sort((a, b) => (a.likes > b.likes ? -1 : 1));
	}

	return unsortedPosts;
}

// function to sort posts by ID
function sortPostsById(unsortedPosts, direction) {
	if (direction == "asc") {
		unsortedPosts.sort((a, b) => (a.id > b.id ? 1 : -1));
	} else {
		unsortedPosts.sort((a, b) => (a.id > b.id ? -1 : 1));
	}
	return unsortedPosts;
}

// function to sort posts by popularity
function sortPostsByPopularity(unsortedPosts, direction) {
	if (direction == "asc") {
		unsortedPosts.sort((a, b) => (a.popularity > b.popularity ? 1 : -1));
	} else {
		unsortedPosts.sort((a, b) => (a.popularity > b.popularity ? -1 : 1));
	}
	return unsortedPosts;
}

// function to sort posts by reads
function sortPostsByReads(unsortedPosts, direction) {
	if (direction == "asc") {
		unsortedPosts.sort((a, b) => (a.reads > b.reads ? 1 : -1));
	} else {
		unsortedPosts.sort((a, b) => (a.reads > b.reads ? -1 : 1));
	}
	return unsortedPosts;
}

// function to merge posts from all requests and remove duplicate
function mergePosts(oldPosts, newPosts) {
	for (let i = 0; i < newPosts.length; i++) {
		isInArray = false;

		for (let j = 0; j < oldPosts.length; j++) {
			if (lodash.isEqual(oldPosts[j], newPosts[i])) {
				isInArray = true;
				break;
			}
		}

		// add a post to old posts only if it already has not added
		if (!isInArray) {
			oldPosts.push(newPosts[i]);
		}
	}

	return oldPosts;
}

// controller method for /api/posts endpoint
exports.Posts = async (req, res) => {
	var sortBy = req.query.sortBy;
	var direction = req.query.direction;

	if (
		sortBy != "id" ||
		sortBy != "reads" ||
		sortBy != "likes" ||
		sortBy != "popularity"
	) {
		res.status(400).send({
			error: "sortBy parameter is invalid",
		});
	} else if (direction != "desc" || direction != "asc") {
		res.status(400).send({
			error: "direction parameter is invalid",
		});
	} else {
		try {
			const query = req.query;
			client.get(query, async (err, posts) => {
				if (err) throw err;

				if (posts) {
					res.status(200).send({
						posts: posts,
					});
				} else {
					let posts = [];

					// retrieve and filter all the tags from the URL
					const tags = splitTags(req.query.tags);

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

						// posts are ready. accumulate all the posts without duplicates
						result.map((item) => {
							posts = mergePosts(posts, item.data.posts);
						});
					} catch (err) {
						res.status(500).json({ error: String(err) });
					}

					if (sortBy == "id") {
						data = sortPostsById(posts, direction);
						client.setex(query, 600, data);
						return res.send({ posts: data });
					} else if (sortBy == "reads") {
						data = sortPostsByReads(posts, direction);
						client.setex(query, 600, data);
						return res.send({ posts: data });
					} else if (sortBy == "likes") {
						data = sortPostsByLikes(posts, direction);
						client.setex(query, 600, data);
						return res.send({ posts: data });
					} else if (sortBy == "popularity") {
						data = sortPostsByPopularity(posts, direction);
						client.setex(query, 600, data);
						return res.send({ posts: data });
					}
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
