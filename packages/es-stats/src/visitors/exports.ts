import { Visitor } from '@babel/traverse';
import getModuleRefFromExportSpecifier from '../getModuleRefFromExportSpecifier';
import getDeclarationNames from '../getDeclarationNames';
import { MODULE_DEFAULT } from '../constants';
import { Exports } from 'ast-lab-types';

export default function createExportVisitors(exports: Exports = { members: [] }): Visitor {
  return {
    ExportAllDeclaration({ node }) {
      exports.extends = (exports.extends || []).concat(node.source.value);
    },
    ExportNamedDeclaration({ node }) {
      const { specifiers, declaration } = node;
      if (specifiers.length) {
        specifiers.forEach(specifier => {
          // @ts-ignore
          const dep = getModuleRefFromExportSpecifier(specifier);
          if (dep) {
            exports.members.push(dep);
          }
        });
      }
      if (declaration) {
        // @ts-ignore
        const names = getDeclarationNames(declaration)
        if (names && names.length) {
          names.forEach(({ name }) => {
            exports.members.push({ name, alias: name });
          });
        }
      }
    },
    ExportDefaultDeclaration({ node }) {
      const { declaration } = node;
      const alias = MODULE_DEFAULT;
      // @ts-ignore
      const names = getDeclarationNames(declaration);
      if (names && names.length) {
        names.forEach(({ name }) => {
          name = name || MODULE_DEFAULT;
          exports.members.push({ name, alias });
        });
      } else {
        exports.members.push({ name: MODULE_DEFAULT, alias: MODULE_DEFAULT });
      }
    }
  };
}