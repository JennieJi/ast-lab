import { ALL_EXPORTS, ALL_MODULES } from '../constants';
import { ModuleSpecifier } from 'estree';
import { ModuleImported } from '../types';

export default function (inDetail?: boolean) {
  return (moduleImported: ModuleImported, specifier: ModuleSpecifier): ModuleImported =>  {
    const initDep = {
      alias: specifier.local.name,
      affectedExports: inDetail ? null : ALL_EXPORTS
    };
    switch(specifier.type) {
      case 'ImportSpecifier':
        return moduleImported.set(specifier.imported.name, initDep);
      case 'ImportDefaultSpecifier':
        return moduleImported.set('default', initDep);
      case 'ImportNamespaceSpecifier':
        return  new Map([
          [ALL_MODULES, initDep]
        ]);
    }
    return moduleImported;
  };
}
