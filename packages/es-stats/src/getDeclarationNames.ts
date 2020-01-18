import { Node } from '@babel/types';
import getPatternNames from './getPatternNames';
import { MemberRef } from 'ast-lab-types';

export default function getDeclarationNames(node: Node): Array<MemberRef> | null {
  switch(node.type) {
    case 'VariableDeclaration':
      return node.declarations.reduce((ret, node) => {
        if (node.id) {
          return ret.concat(getPatternNames(node.id));
        } else {
          console.warn('getDeclarationNames - VariableDeclaration id not exist, node:', node);
          return ret;
        }
      }, [] as Array<MemberRef>);
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      if (node.id) {
        return getPatternNames(node.id);
      }
      return null;
  }
  return null;
}