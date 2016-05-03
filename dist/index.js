'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _specificity = require('specificity');

var _specificity2 = _interopRequireDefault(_specificity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SCOPE_RULES = ['media', 'supports'];

function isScope(name) {
    if (typeof name !== 'string') {
        if (name.type !== 'atrule') {
            return false;
        }
        name = name.name;
    }
    return SCOPE_RULES.indexOf(_postcss2.default.vendor.unprefixed(name)) !== -1;
}

function compare(s1, s2) {
    return s1.reduce(function (prev, current, i) {
        if (prev !== 0) {
            return prev;
        }
        return current - s2[i];
    }, 0);
}

function compareRange(r1, r2) {
    if (compare(r1.min, r2.max) > 0) {
        return 1;
    } else if (compare(r2.min, r1.max) > 0) {
        return -1;
    }
    return 0;
}

var MAX = Number.POSITIVE_INFINITY;
var DEFAULT_RANGE = {
    max: [0, 0, 0, 0],
    min: [MAX, MAX, MAX, MAX]
};

function reduceRange(prev, current) {
    if (compare(prev.min, current) > 0) {
        prev.min = current;
    }
    if (compare(current, prev.max) > 0) {
        prev.max = current;
    }
    return prev;
}

function reduceRanges(prev, current) {
    if (compare(prev.min, current.min) > 0) {
        prev.min = current.min;
    }
    if (compare(current.max, prev.max) > 0) {
        prev.max = current.max;
    }
    return prev;
}

/**
 * Get specificity range of a style rule or a scope
 */
function getRange(node) {
    if (isScope(node)) {
        return node.nodes.map(getRange).reduce(reduceRanges);
    } else if (node.type === 'rule') {
        return _specificity2.default.calculate(node.selector).map(function (result) {
            return result.specificity.split(',').map(function (v) {
                return Number(v);
            });
        }).reduce(reduceRange, _extends({}, DEFAULT_RANGE));
    }
    return null;
}

/**
 * Sort style rules inside a scope node (root / @media / @supports)
 */
function sortScope(scope) {
    var rules = [];
    scope.each(function (node) {

        /* skip progress in @keyframes */
        if (node.type === 'rule' && node.selector.match(/^(?:from|to)$|%$/)) {
            return;
        }

        /* calculate range for rules and scopes */
        if (node.type === 'rule' || isScope(node)) {
            rules.push(_extends(getRange(node), { node: node }));
        }

        /* sort inside scopes */
        if (isScope(node)) {
            sortScope(node);
        }
    });

    var sorted = rules.sort(compareRange);
    sorted.forEach(function (rule, i) {
        if (i > 0) {
            rule.node.moveAfter(sorted[i - 1].node);
        }
    });
}

exports.default = _postcss2.default.plugin('postcss-sort-style-rules', function () {
    return sortScope;
});
module.exports = exports['default'];