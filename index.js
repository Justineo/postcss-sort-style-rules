import postcss from 'postcss';
import specificity from 'specificity';

const SCOPE_RULES = ['media', 'supports'];

function isScope(name) {
    if (typeof name !== 'string') {
        if (name.type !== 'atrule') {
            return false;
        }
        name = name.name;
    }
    return SCOPE_RULES.indexOf(postcss.vendor.unprefixed(name)) !== -1;
}

function compare(s1, s2) {
    return s1.reduce((prev, current, i) => {
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

const MAX = Number.POSITIVE_INFINITY;
const DEFAULT_RANGE = {
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
        return node.nodes
            .map(getRange)
            .reduce(reduceRanges);
    } else if (node.type === 'rule') {
        return specificity.calculate(node.selector)
            .map(result => {
                return result.specificity.split(',').map(v => Number(v));
            })
            .reduce(reduceRange, Object.assign({}, DEFAULT_RANGE));
    }
    return null;
}

/**
 * Sort style rules inside a scope node (root / @media / @supports)
 */
function sortScope(scope) {
    let rules = [];
    scope.each(node => {

        /* skip progress in @keyframes */
        if (node.type === 'rule' && node.selector.match(/^(?:from|to)$|%$/)) {
            return;
        }

        /* calculate range for rules and scopes */
        if (node.type === 'rule' || isScope(node)) {
            rules.push(Object.assign(getRange(node), { node }));
        }

        /* sort inside scopes */
        if (isScope(node)) {
            sortScope(node);
        }
    });

    let sorted = rules.sort(compareRange);
    sorted.forEach((rule, i) => {
        if (i > 0) {
            rule.node.moveAfter(sorted[i - 1].node);
        }
    });
}

export default postcss.plugin('postcss-sort-style-rules', () => {
    return sortScope;
});
