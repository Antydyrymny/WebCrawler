"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _cors = _interopRequireDefault(require("cors"));
var _getID = _interopRequireDefault(require("./api/getID.js"));
var _crawl = _interopRequireDefault(require("./api/crawl.js"));
var _clear = _interopRequireDefault(require("./api/clear.js"));
var _deleteID = _interopRequireDefault(require("./api/deleteID.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
// import path from 'path';
// import { fileURLToPath } from 'url';

// import bodyParser from 'body-parser';

// Create app
var app = (0, _express["default"])();

// Middleware to parse JSON and FormData
app.use(_express["default"].json());
// app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use((0, _cors["default"])());

// Mount the route handlers from the api directory
app.use('/api/getID', _getID["default"]);
app.use('/api/crawl', _crawl["default"]);
app.use('/api/clear', _clear["default"]);
app.use('/api/deleteID', _deleteID["default"]);
app.use('/api/healthz', function (_, res) {
  return res.send('working');
});

// // Serve static assets
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// app.use(express.static(path.join(__dirname, 'public')));

// // Route handler for the URL
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Start the server
_dotenv["default"].config();
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server listening on port ".concat(port));
});

// Export app as a serverless function
var _default = app;
exports["default"] = _default;