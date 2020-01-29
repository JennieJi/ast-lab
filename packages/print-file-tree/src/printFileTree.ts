const FILE_PREFIX = '\u2501 ';
const LAST_PREFIX = '  \u2515';
const HAS_NEXT_PREFIX = '  \u2506';
const MID_PREFIX = '  \u251D';

type TreeNode = Map<string, any> | void;
type Tree = Map<string, TreeNode>;

function makePrefix(depth: string) {
  return depth.replace(/1/g, HAS_NEXT_PREFIX).replace(/0/g, '   ');
}

export default function printFileTree(tree: Tree, depth: string = '') {
  const prefix = makePrefix(depth);

  let index = -1;
  tree.forEach((children: TreeNode, key: string) => {
    const isLast = ++index === tree.size - 1;
    console.log(
      `${prefix}${isLast ? LAST_PREFIX : MID_PREFIX}${FILE_PREFIX}${key}`
    );
    if (children instanceof Map) {
      const nextDepth = depth + (isLast ? '0' : '1');
      printFileTree(children, nextDepth);
    }
  });
}
