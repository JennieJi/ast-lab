import { LVal } from "@babel/types";
import { MemberRef } from 'ast-lab-types';

function getPatternNames(pattern: LVal ): Array<MemberRef> {
  switch(pattern.type) {
    case 'Identifier':
      return [{
        name: pattern.name,
        alias: pattern.name
      }];
    case 'ArrayPattern':
      return pattern.elements.reduce((ret, el) => {
        return el ? ret.concat(getPatternNames(el)) : ret;
      }, [] as MemberRef[]);
    case 'ObjectPattern':
      return pattern.properties.reduce((ret, prop) => {
        let next = prop.type === 'RestElement' ? prop.argument : prop.value;
        if (next) {
          return ret.concat(getPatternNames(next as LVal));
        } else {
          console.warn(`getPatternNames - ObjectPattern next is invalid! Value: ${next}.`);
          return ret;
        }
      }, [] as MemberRef[]);
    case 'RestElement':
      return getPatternNames(pattern.argument);
  }
  return [];
}
export default getPatternNames;
