"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FILE_PREFIX = '\u2501 ';
const LAST_PREFIX = '  \u2515';
const HAS_NEXT_PREFIX = '  \u2506';
const MID_PREFIX = '  \u251D';
function makePrefix(depth) {
    return depth.replace(/1/g, HAS_NEXT_PREFIX).replace(/0/g, '   ');
}
function printFileTree(tree, depth = '') {
    const prefix = makePrefix(depth);
    let index = -1;
    tree.forEach((children, key) => {
        const isLast = ++index === tree.size - 1;
        console.log(`${prefix}${isLast ? LAST_PREFIX : MID_PREFIX}${FILE_PREFIX}${key}`);
        if (children instanceof Map) {
            const nextDepth = depth + (isLast ? '0' : '1');
            printFileTree(children, nextDepth);
        }
    });
}
exports.default = printFileTree;
//# sourceMappingURL=printFileTree.js.map