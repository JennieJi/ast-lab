// @ts-ignore
import Walker from 'node-source-walk';
import { Node } from 'estree';
import astNodeExports from './astNodeExports';
import { Loader, Exported } from '../types';
import resolveModulePath from '../resolveModulePath';

export default async function getExports(
  file: string,
  opts: {
    loader: Loader,
    resolver?: typeof resolveModulePath
  }
): Promise<string[]> {
  const {
    loader
  } = opts;
  const fileContent = await loader(file);
  if (!fileContent) {
    return [];
  }
  const { program: ast } = new Walker().parse(fileContent);
  const finders = await Promise.all(
    ast.body.map((node: Node) => astNodeExports(node, file, opts)) as Array<ReturnType<typeof astNodeExports>>
  )
  return finders.reduce(
    (ret: string[], exports: Exported[]) => ret.concat(exports),
    [] as Exported[]
  );
}
