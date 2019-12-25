export function func() {
  let a;
  import ('./b').then(b => a=b);
}