function hasExt(file: string, extensions?: string[]) {
  const reg = extensions ? new RegExp(`(${extensions.join('|').replace(/\./g, '\\.')})$`, 'i') : /\.\w+/;
  return reg.test(file);
}
export default hasExt;