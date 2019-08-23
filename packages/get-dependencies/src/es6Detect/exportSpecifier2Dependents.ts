import { ModuleSpecifier } from 'estree';
import { ModuleImported } from '../types';

export default function (moduleImported: ModuleImported, specifier: ModuleSpecifier): ModuleImported {
  switch(specifier.type) {
    case 'ExportSpecifier' :
      const alias = specifier.exported.name;
      return moduleImported.set(specifier.local.name, {
        alias,
        affectedExports: new Set([alias])
      });
  }
  return moduleImported;
}
