export function func() {
  let a;
  import ('./importDefault').then(b => a=b);
}