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
    return SCOPE_RULES.indexOf(_postcss2.default.vendor.unprefixed(name)) !== -1;
}

function getScope(node) {
    var current = node.parent;
    var chain = [];
    do {
        if (current.type === 'atrule' && isScope(current.name)) {
            chain.unshift(current.name + ' ' + current.params);
        }
        current = current.parent;
    } while (current);
    return chain.join('|');
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

exports.default = _postcss2.default.plugin('postcss-sort-style-rules', function () {
    return function (css) {
        var cache = {};
        css.walkRules(function (node) {
            var range = _specificity2.default.calculate(node.selector).map(function (result) {
                return result.specificity.split(',').map(function (v) {
                    return Number(v);
                });
            }).reduce(function (prev, current) {
                if (compare(prev.min, current) > 0) {
                    prev.min = current;
                }
                if (compare(current, prev.max) > 0) {
                    prev.max = current;
                }
                return prev;
            }, _extends({}, DEFAULT_RANGE));

            var scope = getScope(node);
            if (!cache[scope]) {
                cache[scope] = [];
            }
            cache[scope].push(_extends(range, { node: node }));
        });

        var _loop = function _loop(scope) {
            var sorted = cache[scope].sort(compareRange);
            sorted.forEach(function (rule, i) {
                if (i > 0) {
                    rule.node.moveAfter(sorted[i - 1].node);
                }
            });
        };

        for (var scope in cache) {
            _loop(scope);
        }
    };
});
module.exports = exports['default'];