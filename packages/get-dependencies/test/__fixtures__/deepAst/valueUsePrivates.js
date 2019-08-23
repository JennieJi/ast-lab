function a() {
  const a1 = 0;
}

function b() {
  a();
}

export const c = b();
