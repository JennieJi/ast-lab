import { ParserPlugin } from '@babel/parser';

export default function completeExtensions(
  parserPlugins: ParserPlugin[] | undefined
): string[] {
  const extensions = ['.js', '.json'];
  if (!parserPlugins) return extensions;
  if (parserPlugins.includes('typescript')) {
    extensions.push('.ts');
  }
  if (parserPlugins.includes('jsx')) {
    extensions.push('.jsx');
    if (parserPlugins.includes('typescript')) {
      extensions.push('.tsx');
    }
  }
  if (parserPlugins.includes('flow')) {
    extensions.push('.flow');
  }
  return extensions;
}
