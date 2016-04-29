import postcss from 'postcss';
import specificity from 'specificity';

const SCOPE_RULES = ['media', 'supports'];

function isScope(name) {
    return SCOPE_RULES.indexOf(postcss.vendor.unprefixed(name)) !== -1;
}

function getScope(node) {
    let current = node.parent;
    let chain = [];
    do {
        if (current.type === 'atrule' && isScope(current.name)) {
            chain.unshift(current.name + ' ' + current.params);
        }
        current = current.parent;
    } while (current);
    return chain.join('|');
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

const DEFAULT_RANGE = {
    max: Array(4).fill(0),
    min: Array(4).fill(Number.POSITIVE_INFINITY)
};

export default postcss.plugin('postcss-sort-style-rules', () => {
    return css => {
        let cache = {};
        css.walkRules(node => {
            let range = specificity.calculate(node.selector)
                .map(result => {
                    return result.specificity.split(',').map(v => Number(v));
                })
                .reduce((prev, current) => {
                    if (compare(prev.min, current) > 0) {
                        prev.min = current;
                    }
                    if (compare(current, prev.max) > 0) {
                        prev.max = current;
                    }
                    return prev;
                }, Object.assign({}, DEFAULT_RANGE));

            let scope = getScope(node);
            if (!cache[scope]) {
                cache[scope] = [];
            }
            cache[scope].push(Object.assign(range, { node }));
        });

        for (let scope in cache) {
            let sorted = cache[scope].sort(compareRange);
            sorted.forEach((rule, i) => {
                if (i > 0) {
                    rule.node.moveAfter(sorted[i - 1].node);
                }
            });
        }
    };
});
