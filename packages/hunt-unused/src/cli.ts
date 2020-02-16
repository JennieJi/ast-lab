#!/usr/bin/env node
import path from 'path';
import chalk from 'chalk';
import commander from 'commander';
import { ParserPlugin } from '@babel/parser';
import huntUnused from './index';

type Options = {
  source: string;
  extensions?: string[];
  parserPlugins: ParserPlugin[];
  modulePaths: string[];
  alias: { [alias: string]: string };
};

function parseArrOpts(val: string): string[] {
  return val?.split(',') || [];
}

commander
  .version('1.0.0')
  .arguments('[entries...]')
  .option('-s, --source <glob>', 'Source files glob', '**/*.js')
  .option(
    '-p, --parser-plugins <names>',
    '@babel/parser plugins',
    parseArrOpts,
    []
  )
  .option(
    '--extensions <extensions>',
    'File extenstions to handle, defaults to .js, .jsx, .ts, .tsx',
    parseArrOpts
  )
  .option(
    '--module-paths <module_paths>',
    'Node module paths',
    parseArrOpts,
    []
  )
  .option(
    '-a, --alias <alias>',
    'Node module alias in format "<alias>:<real_path>"',
    (...vals: string[]) => {
      const ret = {};
      vals.forEach(val => {
        if (val) {
          const [k, v] = val.split(':');
          ret[k] = v;
        }
      });
      return ret;
    },
    {}
  )
  .action(async (entries, options: Options) => {
    const unused = await huntUnused(entries, options);
    const unusedFiles = [] as string[];
    const partialUnused = [] as string[];
    Object.keys(unused).forEach(mod => {
      const ex = unused[mod];
      const relativeMod = path.relative(process.cwd(), mod);
      if (ex.length === 1 && ex[0] === '*') {
        unusedFiles.push(relativeMod);
      } else {
        partialUnused.push(`${relativeMod}: ${ex.map(chalk.bold).join(', ')}`);
      }
    });
    if (unusedFiles.length) {
      console.log(chalk.red('Unused files you might need to clean up:'));
      unusedFiles.map(f => console.log(f));
    }
    if (partialUnused.length) {
      console.log(chalk.red('\nUnused exports you might need to clean up:'));
      partialUnused.map(l => console.log(l));
    } else if (!unusedFiles.length) {
      console.log('No unused file exports found!');
    }
  })
  .parse(process.argv);
