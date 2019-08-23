import { Pattern } from "estree";

function getPatternIdentifiers(pattern: Pattern): string[] {
  switch(pattern.type) {
    case 'Identifier':
      return [pattern.name];
    case 'ArrayPattern':
      return pattern.elements.reduce((ret, el) => {
        return ret.concat(getPatternIdentifiers(el));
      }, [] as string[]);
    case 'ObjectPattern':
      return pattern.properties.reduce((ret, prop) => {
        // @ts-ignore
        let next = prop.type === 'ExperimentalRestProperty' ? prop.argument : prop.value;
        return ret.concat(getPatternIdentifiers(next))
      }, [] as string[]);
    case 'RestElement':
      return getPatternIdentifiers(pattern.argument);
  }
  return [];
}
export default getPatternIdentifiers;
