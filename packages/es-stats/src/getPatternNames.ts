import { LVal } from "@babel/types";
import { MemberRef } from '../types';

function getPatternNames(pattern: LVal): Array<MemberRef> {
  switch(pattern.type) {
    case 'Identifier':
      return [{
        name: pattern.name,
        alias: pattern.name
      }];
    case 'ArrayPattern':
      return pattern.elements.reduce((ret, el) => {
        return ret.concat(getPatternNames(el));
      }, [] as MemberRef[]);
    case 'ObjectPattern':
      return pattern.properties.reduce((ret, prop) => {
        // @ts-ignore
        let next = prop.type === 'ExperimentalRestProperty' ? prop.argument : prop.value;
        return ret.concat(getPatternNames(next))
      }, [] as MemberRef[]);
    case 'RestElement':
      return getPatternNames(pattern.argument);
  }
  return [];
}
export default getPatternNames;
