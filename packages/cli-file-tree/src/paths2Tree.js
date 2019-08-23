"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getFileTree(paths) {
    const tree = new Map();
    paths.forEach(path => {
        const fnames = path.split('/');
        fnames.reduce((node, name, i) => {
            if (node.has(name)) {
                return node.get(name);
            }
            else {
                const newNode = fnames.length === i + 1 ? true : new Map();
                node.set(name, newNode);
                return newNode;
            }
        }, tree);
    }, {});
    return tree;
}
exports.default = getFileTree;
//# sourceMappingURL=paths2Tree.js.map