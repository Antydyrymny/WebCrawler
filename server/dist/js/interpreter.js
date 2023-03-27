"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interpretData = interpretData;
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function interpretData(_ref) {
  var tree = _ref.treeRoot,
    groups = _ref.groups,
    baseGroup = _ref.baseGroup,
    addedNodes = _ref.addedNodes;
  var data = {};
  data.nodes = [];
  data.links = [];
  var distanceGroups = [];
  // Uncheck the root node because it was already added before
  // but we still need to parse the tree starting from it
  if (addedNodes.has(tree.url.href)) addedNodes["delete"](tree.url.href);
  recursiveParseTree(tree);
  return {
    graphData: data,
    groupsUpd: groups,
    addedNodesUpd: addedNodes
  };
  function recursiveParseTree(tree) {
    var id = getId(tree.url);
    // Base case: already addedNodes
    if (addedNodes.has(id)) return;
    addedNodes.add(id);
    // Base case: outer node
    if (!tree.inner) {
      var curGroup;
      var curDistanceGroup;
      // Groups
      if (groups.includes(tree.url.hostname)) {
        curGroup = +baseGroup + 1 + groups.indexOf(tree.url.hostname);
      } else {
        curGroup = +baseGroup + 1 + groups.length;
        groups.push(tree.url.hostname);
      }
      // Distance Groups
      if (distanceGroups.includes(tree.url.hostname)) {
        curDistanceGroup = 2 + distanceGroups.indexOf(tree.url.hostname);
      } else {
        curDistanceGroup = 2 + groups.length;
        distanceGroups.push(tree.url.hostname);
      }
      data.nodes.push({
        id: id,
        group: curGroup,
        distanceGroup: curDistanceGroup,
        explored: false
      });
      return;
    }
    // Main action and recursive case
    data.nodes.push({
      id: id,
      group: +baseGroup,
      distanceGroup: 1,
      explored: tree.explored
    });
    Array.from(tree.connections).forEach(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
        targetNode = _ref3[0],
        strength = _ref3[1];
      data.links.push({
        source: id,
        target: getId(targetNode.url),
        strength: strength
      });
      recursiveParseTree(targetNode);
    });
  }
  function getId(url) {
    return url.href;
  }
}

// Example data structure
// const data = {
//     nodes: [
//         { id: 'A', group: '1', distanceGroup: 1 },
//         { id: 'B', group: '1', distanceGroup: 1 },
//         { id: 'C', group: '2', distanceGroup: 2 },
//         { id: 'D', group: '3', distanceGroup: 1 },
//     ],
//     links: [
//         { source: 'A', target: 'B', strength: 1 },
//         { source: 'B', target: 'A', strength: 1 },
//         { source: 'B', target: 'C', strength: 2 },
//         { source: 'C', target: 'D', strength: 1 },
//         { source: 'D', target: 'A', strength: 1 },
//     ],
// };