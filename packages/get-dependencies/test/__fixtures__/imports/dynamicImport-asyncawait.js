const a = (async function() { return await import ('./a') })();
export async function func() {
  const b = await import ('./b');
  return a + b;
}