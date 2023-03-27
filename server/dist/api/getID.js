"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _uuid = require("uuid");
var _userData = require("./userData.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();

// Handle get requests, sending unique ID for a user session
var _default = router.get('/', function (req, res) {
  var uniqueId = (0, _uuid.v4)();
  _userData.userData.set(uniqueId, {
    explored: new Set(),
    addedNodes: new Set(),
    groups: []
  });
  res.send(uniqueId);
});
exports["default"] = _default;