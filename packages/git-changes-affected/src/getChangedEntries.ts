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
    if (!refs || !refs.length || !loc) { return locs; }
    return locs.concat(
      refs.map(ref => ({
        ...ref,
        loc
      }))
    );
  }, [] as Declare[]);
}

export default function getChangedEntries(changes: Change[], parserOptions?: ParserOptions | null) {
  return changes.reduce((res, { file, content, changed }) => {
    if (!content) {
      return res;
    }
    const filePath = getAbsolutePath(file);
    let ast;
    try { 
      ast = (parse(content, { 
        ...(parserOptions || {}),
        sourceType: 'module'
      }) as File);
    } catch(e) {
      console.warn(`@bable/parser parsing ${filePath} failed! (${e.message}) Parser options: ${JSON.stringify(parserOptions)}`);
      console.warn('File content >>> \n', content);
      return res;
    }
    const stats = extractStats(ast);
    debug(`${file} stats: ${JSON.stringify(stats, null, 2)}`);
    const declareLoc = [
      ...locatePrivateDeclares(ast),
      ...(stats.exports.members as Declare[]),
      ...(stats.imports as Declare[])
    ];
    debug(`${file} declareLoc: ${JSON.stringify(declareLoc, null, 2)}`);
    const exported = new Set(stats.exports.members.map(({ alias }) => alias));
    const affectExports = {} as MemberRelation;
    exported.forEach(name => {
      const expanded = new Set(stats.relations[name] || []);
      expanded.forEach(m => {
        if (m === name) { return; }
        affectExports[m] = [
          ...(affectExports[m] || []),
          name
        ];
        if (stats.relations[m]) {
          stats.relations[m].forEach(r => expanded.add(r));
        }
      });
    });

    let iDeclare = 0;
    const changedExports = changed.reduce(
      (ex, { start: startLine, end: endLine }) => {
        while (iDeclare < declareLoc.length) {
          const { loc, alias } = declareLoc[iDeclare];
          iDeclare++;
          if (!loc) { continue; }
          const { start, end } = loc;
          if (endLine < start.line) { 
            return ex;
          }
          if (startLine <= end.line) {
            if (exported.has(alias)) {
              ex.push(alias);
            } else if (affectExports[alias]) {
              ex = ex.concat(affectExports[alias]);
            }
          }
        }
        return ex;
      }, 
      [] as string[]
    );
    return res.concat(
      Array.from(new Set(changedExports)).map(name => ({
        source: filePath,
        name
      }))
    );
  }, [] as Entry[]);
}