
import { Visitor } from '@babel/traverse';
import getPatternNames from '../getPatternNames';
import { MemberRelation } from '../../types';

type Scope = { privates: Set<string>, candidates: Set<string> };

export default function createRootRelationVisitors(relations: MemberRelation = {}): Visitor {
  let scope = { privates: new Set(), candidates: new Set() } as Scope;
  const parentScopes = [] as Scope[];
  return {
    Scopable: {
      enter() {
        parentScopes.push(scope);
        scope = { privates: new Set(), candidates: new Set() } as Scope;
      },
      exit({ node, parent }) {
        const { candidates } = scope;
        if (parentScopes.length) {
          scope.privates.forEach(d => candidates.delete(d));
          scope = parentScopes.pop() as Scope;
          scope.candidates = new Set(Array.from(scope.candidates).concat(Array.from(candidates)));
        } else if (node.id || parent.id) {
          /** @todo find more specific declaration affected */
          getPatternNames(node.id || parent.id).forEach(({ name }) => {
            relations[name] = candidates;
          });
        }
      }
    },
    VariableDeclarator({ node }) {
      getPatternNames(node.id).forEach(({ alias }) => scope.privates.add(alias));
    },
    FunctionDeclaration({ node }) {
      if (node.id) {
        scope.privates.add(node.id.name);
      }
    },
    FunctionExpression({ node }) {
      if (node.id) {
        scope.privates.add(node.id.name);
      }
    },
    ObjectMethod({ node }) {
      scope.privates.add(node.key.name);
    },
    Identifier(p) {
      if (!p.isProperty(p.parent)) {
        scope.candidates.add(p.node.name);
      }
    }
  };
}