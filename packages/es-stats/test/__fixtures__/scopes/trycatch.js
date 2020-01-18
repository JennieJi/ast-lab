const a = 1;
const b = 2;

function func() {
  try {
    const b = 0;
  } catch(e) {
    console.log(a);
  }
}