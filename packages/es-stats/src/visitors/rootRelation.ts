import { 
  VariableDeclarator, VariableDeclaration, LVal, ExportSpecifier, StringLiteral } from '@babel/types';
import { Visitor } from '@babel/traverse';
import getPatternNames from '../getPatternNames';
import getDeclarationNames from '../getDeclarationNames';
import getModuleReffromExportSpecifier from '../getModuleRefFromExportSpecifier';
import { MemberRelation, MemberRef } from 'ast-lab-types';
import _debug from 'debug';
import { MODULE_DEFAULT, MODULE_ALL } from '../constants';

const debug = _debug('es-stats:scope');

type Scope = { privates: Set<string>, candidates: string[] };

export default function createRootRelationVisitors(relations: MemberRelation = {}): Visitor {
  let scope = { privates: new Set(), candidates: [] } as Scope;
  let parentScopes = [] as Scope[];
  const addRefsToPrivates = (refs: Array<MemberRef>) => {
    refs.forEach(({ alias }) => scope.privates.add(alias));
  };
  const newScope = () => {
    parentScopes.push(scope);
    scope = { privates: new Set(), candidates: [] } as Scope;
  };
  const exitScopeHandler = () => {
    if (parentScopes.length <= 1) return;
    const { candidates, privates } = scope;
    const filteredCandidates = candidates.filter(d => !privates.has(d));
    scope = parentScopes.pop() as Scope;
    scope.candidates = Array.from(new Set(scope.candidates.concat(filteredCandidates)));
    return filteredCandidates;
  };

  return {
    Function({ node }) {
      //@ts-ignore
      const { id, params } = node;
      if (id) {
        scope.privates.add(id.name);
      }
    },
    ClassDeclaration({ node }) {
      if (node.id) {
        scope.privates.add(node.id.name);
      }
    },
    VariableDeclaration: {
      enter({ node }) {
        const refs = getDeclarationNames(node as VariableDeclaration);
        if (refs) {
          addRefsToPrivates(refs);
        }
        newScope();
      },
      exit({ node }) {
        debug('EXIT-variable scope', parentScopes, scope);
        const candidates = exitScopeHandler();
        if (parentScopes.length === 1) {
          const refs = getDeclarationNames(node as VariableDeclaration);
          if (refs) {
            refs.forEach(({ alias }) => {
              relations[alias] = Array.from(new Set(candidates));
            });
          }
        }
      },
    },
    ExportNamedDeclaration({ node }) {
      if (node.source) {
        node.specifiers.forEach(specifier => {
          const ref = getModuleReffromExportSpecifier(specifier as ExportSpecifier);
          if (ref && !relations[ref.name]) {
            relations[ref.name] = [ref.name];
          }
        });
      }
    },
    ExportDefaultDeclaration({ node }) {
      if (node.declaration.type === 'Identifier') {
        const { name } = node.declaration;
        if (!relations[name]) {
          relations[MODULE_DEFAULT] = [name];
        }
      }
    },
    Scopable: {
      enter(p) {
        if (p.isBlockStatement() && p.parentPath.isFunction()) return;
        newScope();

        if (p.isFunction()) {
          const refs = p.node.params
          .reduce((ret, param) => {
            return ret.concat(getPatternNames(param as LVal));
          }, [] as Array<MemberRef>);
          addRefsToPrivates(refs);
        } else if (p.isCatchClause()) {
          addRefsToPrivates(getPatternNames(p.node.param as LVal));
        }
      },
      exit(p) {
        const { node, parent, parentPath } = p;
        debug('EXIT-scopable scope', parentScopes, scope);
        if (p.isBlockStatement() && parentPath && parentPath.isFunction()) return;

        const candidates = exitScopeHandler();
        // @ts-ignore 
        let id = node.id || parent.id;
        if (parentScopes.length === 1 && id) {
          /** @todo find more specific declaration affected */
          getPatternNames(id).forEach(({ alias }) => {
            relations[alias] = Array.from(new Set(candidates));
          });
        }
      }
    },
    VariableDeclarator({ node }) {
      addRefsToPrivates(getPatternNames((node as VariableDeclarator).id));
    },
    ObjectMethod({ node }) {
      scope.privates.add(node.key.name);
    },
    CallExpression({ node }) {
      const { callee, arguments: args } = node;
      /** @todo handle eval */
      // if (callee.name === 'eval') {
      //   args[0].value
      // }

      // dynamic import
      if (callee.type === 'Import' && args[0].type === 'StringLiteral') {
        scope.candidates.push(`${(args[0] as StringLiteral).value}#${MODULE_ALL}`);
      }
    },
    Identifier(p) {
      const { node, key } = p;
      let parentPath = p.parentPath;
      // exclude function/class identifier
      if (parentPath.isScopable() && key === 'id' || parentPath.isFunction()) {
        return;
      }
      if (
        // exclude property
        !p.isProperty() &&
        key !== 'property' &&
        !(parentPath.isProperty() && key === 'key')
      ) {
        debug('>>>', node);
        scope.candidates.push(node.name);
      }
    }
  };
}