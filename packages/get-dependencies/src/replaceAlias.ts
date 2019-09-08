import { Alias } from './types';

export default function replaceAlias(alias: Alias) {
  const token = new RegExp(`^${Object.keys(alias).join('|')}`);
  return (mod: string) =>
    mod.replace(token, (match) => alias[match]);
}
