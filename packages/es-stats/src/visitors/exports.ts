import { Visitor } from '@babel/traverse';
import { ExportSpecifier } from '@babel/types';
import getModuleRefFromExportSpecifier from '../getModuleRefFromExportSpecifier';
import getDeclarationNames from '../getDeclarationNames';
import { MODULE_DEFAULT } from '../constants';
import { Exports } from 'ast-lab-types';

/**
 * Create a Babel visitor that will find out all the exports and save them into an object ref.
 * @param exports The object ref to save the exports result.
 */
export default function createExportVisitors(exports: Exports = { members: [] }): Visitor {
  return {
    ExportAllDeclaration({ node }) {
      exports.extends = (exports.extends || []).concat(node.source.value);
    },
    ExportNamedDeclaration({ node }) {
      const { specifiers, declaration, loc } = node;
      specifiers.forEach(specifier => {
        const dep = getModuleRefFromExportSpecifier(specifier as ExportSpecifier);
        if (dep) {
          exports.members.push({
            ...dep,
            loc
          });
        }
      });
      if (declaration) {
        // @ts-ignore
        const names = getDeclarationNames(declaration)
        if (names && names.length) {
          names.forEach(({ name }) => {
            exports.members.push({ name, alias: name, loc });
          });
        }
      }
    },
    ExportDefaultDeclaration({ node }) {
      const { declaration, loc } = node;
      const alias = MODULE_DEFAULT;
      // @ts-ignore
      const names = getDeclarationNames(declaration);
      if (names && names.length) {
        names.forEach(({ name }) => {
          name = name || MODULE_DEFAULT;
          exports.members.push({ name, alias, loc });
        });
      } else {
        exports.members.push({ name: MODULE_DEFAULT, alias: MODULE_DEFAULT,loc });
      }
    }
  };
}