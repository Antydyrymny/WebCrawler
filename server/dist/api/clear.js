"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _userData = require("./userData.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();
// Handle post requests to clear userData on a new graph input
var _default = router.post('/', function (req, res) {
  var id = req.body.id;
  _userData.userData.set(id, {
    explored: new Set(),
    addedNodes: new Set(),
    groups: []
  });
  res.send('Clear successful');
});
exports["default"] = _default;