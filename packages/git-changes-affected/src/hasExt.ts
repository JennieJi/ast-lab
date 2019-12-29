export default function hasExt(file: string, extensions: string[]) {
  const reg = new RegExp(`${extensions.join('|')}$`, 'i');
  return reg.test(file);
}