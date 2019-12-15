import { VariableDeclarator, VariableDeclaration } from '@babel/types';
import { Visitor } from '@babel/traverse';
import getPatternNames from '../getPatternNames';
import getDeclarationNames from '../getDeclarationNames';
import { MemberRelation } from 'ast-lab-types';
import _debug from 'debug';

const debug = _debug('es-stats:scope');

type Scope = { privates: Set<string>, candidates: Set<string> };

export default function createRootRelationVisitors(relations: MemberRelation = {}): Visitor {
  let scope = { privates: new Set(), candidates: new Set() } as Scope;
  let parentScopes = [] as Scope[];
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
          refs.forEach(({ alias }) => scope.privates.add(alias));
        }
        parentScopes.push(scope);
        scope = { privates: new Set(), candidates: new Set() } as Scope;
      },
      exit({ node }) {
        debug('EXIT-scope', parentScopes, scope);
        const { candidates } = scope;
        scope.privates.forEach(d => candidates.delete(d));
        scope = parentScopes.pop() as Scope;
        scope.candidates = new Set(
          Array.from(scope.candidates)
          .concat(Array.from(candidates))
        );
        if (parentScopes.length === 1) {
          const refs = getDeclarationNames(node as VariableDeclaration);
          if (refs) {
            refs.forEach(({ alias }) => relations[alias] = candidates);
          }
        }
      },
    },
    Scopable: {
      enter(p) {
        if (p.isBlockStatement() && p.parentPath.isFunction()) return;
        parentScopes.push(scope);
        scope = { privates: new Set(), candidates: new Set() } as Scope;
      },
      exit(p) {
        const { node, parent, parentPath } = p;
        if (p.isBlockStatement() && parentPath.isFunction()) return;
        debug('EXIT-scope', parentScopes, scope);
        const { candidates } = scope;
        if (parentScopes.length > 1) {
          scope.privates.forEach(d => candidates.delete(d));
          scope = parentScopes.pop() as Scope;
          scope.candidates = new Set(
            Array.from(scope.candidates)
            .concat(Array.from(candidates))
          );
        }
        // @ts-ignore 
        let id = node.id || parent.id;
        if (parentScopes.length === 1 && id) {
          /** @todo find more specific declaration affected */
          getPatternNames(id).forEach(({ name }) => {
            relations[name] = candidates;
          });
        }
      }
    },
    VariableDeclarator({ node }) {
      getPatternNames((node as VariableDeclarator).id).forEach(({ alias }) => scope.privates.add(alias));
    },
    ObjectMethod({ node }) {
      scope.privates.add(node.key.name);
    },
    /** @todo handle eval */
    // CallExpression({ node }) {
    //   if (node.callee && node.callee.name === 'eval') {
    //     node.arguments[0].value
    //   }
    // },
    Identifier(p) {
      const { node, key, scope: astScope, parent } = p;
      let parentPath = p.parentPath;
        // exclude function identifier
      if (parentPath.isScopable() && key === 'id') {
        return;
      }
      if (parentPath.isRestElement()) {
        parentPath = parentPath.parentPath;
      }
      if (
        // function/loop/condition argument
        parentPath.isScopable() && 
        !parentPath.isSwitchStatement() ||
        // object assignment
        (parent as { shorthand: boolean }).shorthand
      ) {
        scope.privates.add(node.name);
      } else if (
        !p.isProperty() &&
        !(parentPath.isProperty() && key === 'key') &&
        key !== 'property' &&
        !astScope.hasGlobal(node.name)
      ) {
        scope.candidates.add(node.name);
      }
    }
  };
}