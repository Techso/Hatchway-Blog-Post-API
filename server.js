const bodyParser = require("body-parser");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const controller = require("./Controllers/controller");
const config = require("./config");

// Server instance declaration
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cors);

// Server listener declaration
app.set("port", config.port);
app.listen(app.get("port"), (err) => {
	if (err) {
		console.log(err);
	}
	console.log(`Server is up and listening on port ${app.get("port")}..`);
});

// API endpoints
app.get("/api/ping", controller.Ping);
app.get("/api/posts", controller.Posts);
