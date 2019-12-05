import { MODULE_ALL, MODULE_DEFAULT} from '../constants';
import { ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier } from '@babel/types';
import { MemberRef } from '../types';

export default function(specifier: ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier): MemberRef | null {
  const alias = specifier.local.name;
  switch(specifier.type) {
    case 'ImportSpecifier':
      return {
        name: specifier.imported.name,
        alias
      };
    case 'ImportDefaultSpecifier':
      return {
        name: MODULE_DEFAULT,
        alias
      }
    case 'ImportNamespaceSpecifier':
      return  {
        name: MODULE_ALL,
        alias
      };
  }
  return null;
}
