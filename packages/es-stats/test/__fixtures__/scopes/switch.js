const TYPES = {
  A: 0,
  B: 1,
  C: 2,
};
const type = 0;
const v = 'any value';

function func() {
  switch(type) {
    case TYPES.B:
    case TYPES.A: 
      v;
      break;
    case 2:
    case v:
    default:
      break;
  }
}