const core = new Set(require('module').builtinModules);

export default function isCore(mod: string) {
  return core.has(mod);
}
