// 
// https://www.codementor.io/wapjude/creating-a-simple-rest-api-with-expressjs-in-5min-bbtmk51mq
//

require('log-timestamp');
const https = require('https');
const http = require('http');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
const routes = require("./routes/routes.js");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

routes(app);
app.use(express.static('public'))

var server;

if (process.env.SNIPPETBIN_SSL_KEY && process.env.SNIPPETBIN_SSL_CERT) {
    const ssl_options = {
        key: process.env.SNIPPETBIN_SSL_KEY,
        cert: process.env.SNIPPETBIN_SSL_CERT
    };
    server = https.createServer(ssl_options, app);
    console.log("Starting HTTPS server");
} else {
    server = http.createServer(app);
    console.log("Starting HTTP server");
}

server.listen(process.env.SNIPPETBIN_PORT || 3000, '0.0.0.0', function () {
    console.log("app running on port.", server.address().port);
});

