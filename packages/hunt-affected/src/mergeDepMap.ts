import fs from 'fs';
import path from 'path';
import enhancedResolve from 'enhanced-resolve';
import _debug from 'debug';
import ecmaStats from 'es-stats';
import denodeify from './denodeify';
import { Import } from 'ast-lab-types';
import { Options, DeclarationNode, Resolver, DependencyMap } from './types';
import completeExtensions from './completeExtensions';
import resolveModule from './resolveModule';

const debug = _debug('hunt-affected:merge');

function defaultLoader(filePath: string): Promise<string> {
  return Promise.resolve(fs.readFileSync(filePath, 'utf8'));
}

async function convertImports(
  resolver: Resolver,
  baseDir: string,
  imports: Import[]
): Promise<{
  [key: string]: Import;
}> {
  const resolvedImports = await Promise.all(
    imports.map(async importInfo => {
      const { alias, source } = importInfo;
      const resolvedSource = await resolveModule(resolver, source, baseDir);
      return [alias, { ...importInfo, source: resolvedSource }];
    })
  );
  return Object.fromEntries(resolvedImports);
}

function getDeclaration(
  depMap: DependencyMap,
  source: string,
  declaration: string
): DeclarationNode {
  if (!depMap[source]) depMap[source] = {};
  if (!depMap[source][declaration]) {
    return (depMap[source][declaration] = {
      source,
      name: declaration,
      affects: [],
    });
  }
  return depMap[source][declaration];
}

type Extends = { [source: string]: Set<string> };
function handleExtends(depMap: DependencyMap, extendsToHandle: Extends): void {
  const remaining = { ...extendsToHandle };
  let current: any;
  let queue = Object.keys(extendsToHandle).reduce((ret, source) => {
    extendsToHandle[source].forEach(extend =>
      ret.push({
        source,
        extend,
      })
    );
    return ret;
  }, [] as Array<{ source: string; extend: string }>);
  let queueLen = queue.length;
  let nextBatch = [] as Array<{ source: string; extend: string }>;
  while ((current = queue.shift())) {
    const { source, extend } = current;
    if (depMap[extend]) {
      /** @todo check the extend priority logic */
      depMap[source] = {
        ...depMap[extend],
        ...depMap[source],
      };
    }
    if (remaining[extend]) {
      nextBatch.push(current);
    } else {
      remaining[source].delete(extend);
      if (!remaining[source].size) {
        delete remaining[source];
      }
    }
    if (!queue.length && queueLen > nextBatch.length) {
      queue = nextBatch;
      queueLen = nextBatch.length;
      nextBatch = [];
    }
  }
}

/**
 * Extract the dependency map of a list of source files.
 * @param sources A list of absolute source file paths
 * @param opts
 */
export default async function mergeDepMap(
  sources: string[],
  opts: Options = {}
): Promise<DependencyMap> {
  debug('===');
  const depMap = {} as DependencyMap;
  const parserOptions = opts?.parserOptions;
  const resolver =
    opts.resolver ||
    denodeify(
      enhancedResolve.create({
        ...(opts.resolverOptions || {}),
        extensions:
          opts.resolverOptions?.extensions ||
          completeExtensions(opts.parserOptions?.plugins),
      })
    );
  const loader = opts.loader || defaultLoader;

  const extendsToHandle = {} as Extends;
  const fileHandlers = sources.map(async src => {
    const fileContent = await loader(src);
    let fileStats;
    try {
      if (fileContent) {
        fileStats = ecmaStats(fileContent, parserOptions);
      }
    } catch (e) {
      console.warn(
        `get es stats from ${src} failed! Parser options: ${JSON.stringify(
          parserOptions
        )}`
      );
      console.warn(e);
    }
    if (!fileStats) return;
    const { relations, exports } = fileStats;
    const baseDir = path.dirname(src);
    const imports = convertImports(resolver, baseDir, fileStats.imports);
    if (exports.extends) {
      const modulePaths = await Promise.all(
        exports.extends.map(ex => resolveModule(resolver, ex, baseDir))
      );
      extendsToHandle[src] = new Set(modulePaths);
    }

    const declarations = Object.keys(relations);
    for (const declaration of declarations) {
      const declarationNode = getDeclaration(depMap, src, declaration);
      for (const dep of relations[declaration]) {
        if (typeof dep === 'string') {
          const isImported = imports[dep];
          if (isImported) {
            const { name, source } = isImported;
            getDeclaration(depMap, source, name).affects.push(declarationNode);
          } else {
            getDeclaration(depMap, src, dep).affects.push(declarationNode);
          }
        } else {
          const { source, name } = dep;
          const resolvedSource = await resolveModule(resolver, source, baseDir);
          getDeclaration(depMap, resolvedSource, name).affects.push(
            declarationNode
          );
        }
      }
    }
  });
  await Promise.all(fileHandlers);
  handleExtends(depMap, extendsToHandle);

  return depMap;
}
