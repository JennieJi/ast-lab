declare type TreeNode = Map<string, any> | void;
declare type Tree = Map<string, TreeNode>;
export default function printFileTree(tree: Tree, depth?: string): void;
export {};
