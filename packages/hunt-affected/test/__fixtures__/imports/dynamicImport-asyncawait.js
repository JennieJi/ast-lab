const a = (async function() { return await import ('./importNamed') })();
export async function func() {
  const b = await import ('./importAll');
  return a + b;
}