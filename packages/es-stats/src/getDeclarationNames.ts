import {
  Declaration
} from '@babel/types';
import getPatternIdentifiers from './getPatternNames';
import { MemberRef } from 'ast-lab-types';

export default function getDeclarationNames(node: Declaration): Array<MemberRef> | null {
  switch(node.type) {
    case 'VariableDeclaration':
      return node.declarations.reduce((ret, { id }) => 
        ret.concat(getPatternIdentifiers(id)), 
        [] as Array<MemberRef>
      );
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      if (node.id) {
        return getPatternIdentifiers(node.id);
      }
      return null;
  }
  return null;
}