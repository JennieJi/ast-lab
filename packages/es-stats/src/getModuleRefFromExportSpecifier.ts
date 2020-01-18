import {  
  ExportDefaultSpecifier, 
  ExportNamespaceSpecifier, 
  ExportSpecifier 
} from '@babel/types';
import { MemberRef } from 'ast-lab-types';

export default function (specifier:  ExportSpecifier | ExportDefaultSpecifier | ExportNamespaceSpecifier): MemberRef | null {
  if (specifier.type === 'ExportSpecifier') {
    const alias = specifier.exported.name;
    return {
      name: specifier.local.name,
      alias,
    };
  }
  return null;
}
