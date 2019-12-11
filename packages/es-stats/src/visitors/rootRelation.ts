import { VariableDeclarator } from '@babel/types';
import { Visitor } from '@babel/traverse';
import getPatternNames from '../getPatternNames';
import { MemberRelation } from 'ast-lab-types';

type Scope = { privates: Set<string>, candidates: Set<string> };

export default function createRootRelationVisitors(relations: MemberRelation = {}): Visitor {
  let scope = { privates: new Set(), candidates: new Set() } as Scope;
  let parentScopes = [] as Scope[];
  return {
    Scopable: {
      enter(p) {
        if (p.isBlockStatement() && p.parentPath.isFunction()) return;
        // @ts-ignore
        parentScopes.push(scope);
        scope = { privates: new Set(), candidates: new Set() } as Scope;
      },
      exit(p) {
        const { node, parent, parentPath } = p;
        if (p.isBlockStatement() && parentPath.isFunction()) return;
        console.log('EXIT-scope', parentScopes, scope);
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
        if (parentPath && parentPath.isArrowFunctionExpression()) {
          id = (parentPath.parent as VariableDeclarator).id;
        }
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
    Function({ node }) {
      //@ts-ignore
      const { id, params } = node;
      if (id) {
        scope.privates.add(id.name);
      }
    },
    ObjectMethod({ node }) {
      scope.privates.add(node.key.name);
    },
    ClassDeclaration({ node }) {
      if (node.id) {
        scope.privates.add(node.id.name);
      }
    },
    Identifier(p) {
      const { node, key, scope: astScope, parent } = p;
      let parentPath = p.parentPath;
      if (parentPath.isRestElement()) {
        parentPath = parentPath.parentPath;
      }
      if (
        // function/loop/condition check argument
        parentPath.isScopable() && !parentPath.isSwitchStatement() ||
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