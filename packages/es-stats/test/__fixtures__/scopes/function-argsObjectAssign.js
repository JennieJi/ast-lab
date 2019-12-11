const a = 'a';
const b = 'b';
export function func({ key1: { key2 }}) {
  const b = 'funcb';
  return a + key2;
}