import { parse, ParserOptions } from '@babel/parser';
import { File, SourceLocation } from '@babel/types';
import { extractStats, getPrivateMemberNames } from 'es-stats';
import _debug from 'debug';
import getAbsolutePath from './getAbsolutePath';
import { Entry, MemberRef, MemberRelation } from 'ast-lab-types';
import { Change } from './types';

const debug = _debug('git-changes-affected:entries');

type Declare = MemberRef & { loc: SourceLocation };
/** @todo improve precision of private declaration location */
function locatePrivateDeclares(ast: File): Declare[] {
  return ast.program.body.reduce((locs, d) => {
    const refs = getPrivateMemberNames(d);
    const { loc } = d;
    if (!refs || !refs.length || !loc) {
      return locs;
    }
    return locs.concat(
      refs.map(ref => ({
        ...ref,
        loc,
      }))
    );
  }, [] as Declare[]);
}

/**
 * Find what declarations does the code line changes belong to.
 * @param changes
 * @param parserOptions `@babel/parser` options
 * @return A list of object contains module absolute path and declaration name
 */
export default function getChangedEntry(
  { file, content, changed }: Change,
  parserOptions?: ParserOptions | null
): Entry[] | null {
  if (!content) {
    return null;
  }
  const filePath = getAbsolutePath(file);
  let ast;
  try {
    ast = parse(content, {
      ...(parserOptions || {}),
      sourceType: 'module',
    }) as File;
  } catch (e) {
    console.warn(
      `@bable/parser parsing ${filePath} failed! (${
        e.message
      }) Parser options: ${JSON.stringify(parserOptions)}`
    );
    return null;
  }
  const stats = extractStats(ast);
  debug(`${file} stats: ${JSON.stringify(stats)}`);
  const declareLoc = [
    ...locatePrivateDeclares(ast),
    ...(stats.exports.members as Declare[]),
    ...(stats.imports as Declare[]),
  ].sort((a, b) => a.loc.start.line - b.loc.start.line);
  debug(`${file} declareLoc: ${JSON.stringify(declareLoc)}`);

  const exported = new Set(stats.exports.members.map(({ alias }) => alias));
  const affectExports = {} as MemberRelation;
  exported.forEach(name => {
    const expanded = new Set(stats.relations[name] || []);
    expanded.forEach(m => {
      if (m === name) {
        return;
      }
      affectExports[m] = [...(affectExports[m] || []), name];
      if (stats.relations[m]) {
        stats.relations[m].forEach(r => expanded.add(r));
      }
    });
  });
  debug(
    `${file} change ${JSON.stringify(changed)}  \n>>>  ${JSON.stringify(
      affectExports
    )}`
  );

  let iDeclare = 0;
  const changedExports = changed.reduce(
    (ex, { start: startLine, end: endLine }) => {
      while (iDeclare < declareLoc.length) {
        const { loc, alias } = declareLoc[iDeclare];
        if (!loc) {
          continue;
        }
        const { start, end } = loc;
        if (endLine < start.line) {
          debug(`${file}:${startLine}-${endLine} X ${start.line}-${end.line}`);
          return ex;
        }
        if (startLine <= end.line) {
          debug(
            `${file}:${startLine}-${endLine} √ ${start.line}-${end.line} > ${affectExports[alias]} `
          );
          if (exported.has(alias)) {
            ex.push(alias);
          }
          if (affectExports[alias]) {
            ex = ex.concat(affectExports[alias]);
          }
        } else {
          debug(`${file}:${startLine}-${endLine} X ${start.line}-${end.line}`);
        }
        iDeclare++;
      }
      return ex;
    },
    [] as string[]
  );
  return Array.from(new Set(changedExports)).map(name => ({
    source: filePath,
    name,
  }));
}
