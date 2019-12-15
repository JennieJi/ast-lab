const a = 1;
const b = 2;
const DEFAULT = 0;
const arrow = (a = DEFAULT) => {
  return a + b;
}