export default function isThirdParty(mod: string) {
  return mod.indexOf('node_modules') > -1
}
