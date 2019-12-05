import fs from 'fs';

export default function isRealFile(mod: string) {
  return fs.existsSync(mod) &&
  fs.lstatSync(mod).isFile()
}
