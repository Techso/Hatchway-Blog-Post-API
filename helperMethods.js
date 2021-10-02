const axios = require("axios");
const lodash = require("lodash");

/***helper methods***/

// function to validate sortBy parameter
exports.isSortByValid = (sortParameter) => {
	var allowedParameters = new Array("id", "likes", "reads", "popularity");

	if (allowedParameters.includes(sortParameter)) {
		return true;
	} else {
		return false;
	}
};

// function to validate direction parameter
exports.isDirectionValid = (direction) => {
	var allowedDirections = new Array("asc", "desc");
	if (allowedDirections.includes(direction)) {
		return true;
	} else {
		return false;
	}
};

// function to split and trim tags from query
exports.splitTags = (tags) => {
	const tokens = tags.split(",");

	for (let i = 0; i < tokens.length; i++) {
		tokens[i] = tokens[i].trim();
	}

	return tokens;
};
// function to sort posts by any valid parameter and specified direction
exports.sortPosts = (unsortedPosts, sortParameter, direction) => {
	if (sortParameter == "likes") {
		if (direction == "asc") {
			unsortedPosts.sort((a, b) => (a.likes > b.likes ? 1 : -1));
		} else {
			unsortedPosts.sort((a, b) => (a.likes > b.likes ? -1 : 1));
		}

		return unsortedPosts;
	} else if (sortParameter == "id") {
		if (direction == "asc") {
			unsortedPosts.sort((a, b) => (a.id > b.id ? 1 : -1));
		} else {
			unsortedPosts.sort((a, b) => (a.id > b.id ? -1 : 1));
		}
		return unsortedPosts;
	} else if (sortParameter == "reads") {
		if (direction == "asc") {
			unsortedPosts.sort((a, b) => (a.reads > b.reads ? 1 : -1));
		} else {
			unsortedPosts.sort((a, b) => (a.reads > b.reads ? -1 : 1));
		}
		return unsortedPosts;
	} else {
		if (direction == "asc") {
			unsortedPosts.sort((a, b) =>
				a.popularity > b.popularity ? 1 : -1
			);
		} else {
			unsortedPosts.sort((a, b) =>
				a.popularity > b.popularity ? -1 : 1
			);
		}
		return unsortedPosts;
	}
};

// function to merge posts from all requests and remove duplicate
exports.mergePosts = (oldPosts, newPosts) => {
	for (let i = 0; i < newPosts.length; i++) {
		isInArray = false;

		for (let j = 0; j < oldPosts.length; j++) {
			if (lodash.isEqual(oldPosts[j].id, newPosts[i].id)) {
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
};
