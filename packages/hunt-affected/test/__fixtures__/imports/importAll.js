import * as resolve from './importDefault';

export const { a } = resolve;
export function func(){
  return resolve.b;
}