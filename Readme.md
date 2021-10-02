# BLOG POST API

## A Node and express API that fetches post by tags from a remote API

Author: Faith Adeoti
Email: stevenlarex@gmail.com
github: github.com/Techso

## Implementation description

This project develops an API with the Node JS environment and instantiates a server instance using Express Js. The API is started by running npm start on a machine that has node installed and it receives requests on two endpoints namely:

-   /api/ping - which is used to verify connection to the API
-   /api/post - which is used to request a list of blog post that have any of the tags specified in the request query sorted by a specified parameter and sorted in a specified order.

The project also implements caching using redis to set the response for a request using the request's query as the key and in the case where a request with a particular query has been made and made again it simply fetches the result from the cache without running the underlying logic to get the posts from the remote source, therebe improving the application's performance.

## Project dependencies and Libraries

-   Node JS
-   Express JS
-   Axios
-   Cors
-   Lodash
-   Redis

## Installation and execution

-   run "npm install in the root of the project"
-   install redis in the machine and run redis-server to start redis server
-   run "npm start"


[git-repo-url]: https://github.com/Techso
