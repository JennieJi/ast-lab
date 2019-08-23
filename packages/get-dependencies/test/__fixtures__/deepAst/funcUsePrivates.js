function a() {
  function a1() {
  }
  a1();
}

function b() {
  a();
}

export function c() {
  b();
}
