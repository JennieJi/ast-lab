import { Visitor } from '@babel/traverse';

export default function mergeVisitors(...visitors: Visitor[]): Visitor {
  return visitors.reduce((ret, visitor, i) => {
    if (!i) { return visitor; }
    Object.keys(visitor).forEach(key => {
      const value = visitor[key];
      const existing = ret[key];
      if (existing) {
        const enterSuper = typeof existing === 'function' ? existing : existing.enter;
        const currentEnter = typeof value === 'function' ? value : value.enter;
        ret[key] = {
          enter() {
            if (enterSuper) {
              enterSuper.apply(this, arguments);
            }
            if (currentEnter) {
              currentEnter.apply(this, arguments);
            }
          },
          exit() {
            if (existing.exit) {
              existing.exit.apply(this, arguments);
            }
            if (value.exit) {
              value.exit.apply(this, arguments);
            }
          }
        };
      } else {
        ret[key] = value;
      }
    });
    return ret;
  }, {} as Visitor);
}