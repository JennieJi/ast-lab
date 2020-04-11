import {
  VariableDeclarator,
  VariableDeclaration,
  LVal,
  ExportSpecifier,
  StringLiteral,
} from '@babel/types';
import { Visitor } from '@babel/traverse';
import getPatternNames from '../getPatternNames';
import getDeclarationNames from '../getDeclarationNames';
import getModuleReffromExportSpecifier from '../getModuleRefFromExportSpecifier';
import { MemberRelation, MemberRef } from 'ast-lab-types';
import _debug from 'debug';
import { MODULE_DEFAULT } from '../constants';

const debug = _debug('es-stats:scope');

type Scope = { privates: Set<string>; candidates: string[] };

/**
 * Create a Babel visitor that will find out the dependency relationships between root declarations, and save to an object ref.
 * @param relations The object ref to save the relationships
 */
export default function createRootRelationVisitors(
  relations: MemberRelation = {}
): Visitor {
  let scope = { privates: new Set(), candidates: [] } as Scope;
  const parentScopes = [] as Scope[];
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
    scope.candidates = Array.from(
      new Set(scope.candidates.concat(filteredCandidates))
    );
    return filteredCandidates;
  };

  return {
    FunctionDeclaration({ node }) {
      if (node.id) {
        scope.privates.add(node.id.name);
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
          const ref = getModuleReffromExportSpecifier(
            specifier as ExportSpecifier
          );
          if (ref && !relations[ref.name]) {
            relations[ref.alias] = [];
          }
        });
      }
    },
    ExportDefaultDeclaration: {
      enter() {
        scope.privates.add(MODULE_DEFAULT);
        newScope();
      },
      exit() {
        debug('EXIT-export default scope', parentScopes, scope);
        const candidates = exitScopeHandler();
        if (parentScopes.length === 1) {
          relations[MODULE_DEFAULT] = Array.from(new Set(candidates));
        }
      },
    },
    Scopable: {
      enter(p) {
        newScope();

        if (p.isFunction()) {
          const refs = p.node.params.reduce((ret, param) => {
            return ret.concat(getPatternNames(param as LVal));
          }, [] as Array<MemberRef>);
          addRefsToPrivates(refs);
        } else if (p.isCatchClause()) {
          addRefsToPrivates(getPatternNames(p.node.param as LVal));
        }
      },
      exit(p) {
        const { node, parent } = p;
        debug('EXIT-scopable scope', parentScopes, scope);

        const candidates = exitScopeHandler();
        if (parentScopes.length === 1) {
          const dedupCandidates = Array.from(new Set(candidates));
          // @ts-ignore
          const id = node.id || (parent && parent.id);
          if (id) {
            /** @todo find more specific declaration affected */
            getPatternNames(id).forEach(({ alias }) => {
              relations[alias] = dedupCandidates;
            });
          }
        }
      },
    },
    VariableDeclarator({ node }) {
      addRefsToPrivates(getPatternNames((node as VariableDeclarator).id));
    },
    CallExpression({ node }) {
      const { callee, arguments: args } = node;
      /** @todo handle eval */
      // if (callee.name === 'eval') {
      //   args[0].value
      // }

      // dynamic import
      if (callee.type === 'Import' && args[0].type === 'StringLiteral') {
        scope.candidates.push(
          `${(args[0] as StringLiteral).value}#${MODULE_DEFAULT}`
        );
      }
    },
    Identifier(p) {
      const { node, key } = p;
      const parentPath = p.parentPath;
      // exclude function/class identifier
      if (parentPath.isClass() || parentPath.isFunction()) {
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
    },

    /* JSX */
    /** @todo make it a plugin */
    JSXOpeningElement({ node }) {
      let identifier = node.name;
      while (identifier.type === 'JSXMemberExpression') {
        identifier = identifier.object;
      }
      if (identifier.type === 'JSXIdentifier') {
        scope.candidates.push(identifier.name);
      }
    },
  };
}
