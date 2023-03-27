"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _userData = require("./userData.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();

// Handle delete user session ID after he leaves the webpage
var _default = router.post('/', function (req, _) {
  var uniqueId = req.body;
  _userData.userData["delete"](uniqueId);
});
exports["default"] = _default;