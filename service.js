// 
// https://www.codementor.io/wapjude/creating-a-simple-rest-api-with-expressjs-in-5min-bbtmk51mq
//
//

var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors')
var routes = require("./routes/routes.js");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

routes(app);

var server = app.listen(3000, function () {
    console.log("app running on port.", server.address().port);
});


