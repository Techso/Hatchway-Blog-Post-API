//configure redis for caching function
const redis = require("redis");
const cacheClient = redis.createClient({
	port: 6379,
});
cacheClient.on("error", (error) => console.error(error));

module.exports = cacheClient;
