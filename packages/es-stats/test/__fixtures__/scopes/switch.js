const TYPES = {
  A: 0,
  B: 1,
  C: 2,
};
const type = 0;
const v1 = 'any value';
const v2 = 'any value';

function func() {
  switch(type) {
    case TYPES.B:
    case TYPES.A: {
      let v1 = 0;
      v1;
      break;
    }
    case 1:
      let v2 = 0;
      break;
    case 2:
      return v1 + v2;
    default:
      break;
  }
}