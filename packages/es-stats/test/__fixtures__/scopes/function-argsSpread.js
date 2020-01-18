const a = 'a';
const b = 'b';
export function func(arg0, ...args) {
  const b = 'funcb';
  return a + arg0 + args[0];
}