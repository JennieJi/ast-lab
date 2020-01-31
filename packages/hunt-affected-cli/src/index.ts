#!/usr/bin/env node
import huntAffected from 'hunt-affected';
import commander from 'commander';
import glob from 'glob';
import path from 'path';
import { existsSync } from 'fs';

commander
  .version('1.0.0')
  .arguments('<entryFile> [exports]')
  .option('-s, --source <glob>')
  .option('--parser-plugins <plugins>', '@babel/parser plugins')
  .action(
    async (
      entryFile: string,
      exports: string | undefined,
      options: {
        source?: string | undefined;
        parserPlugins?: string | undefined;
      }
    ) => {
      const entryFileAbsolute = path.isAbsolute(entryFile)
        ? entryFile
        : path.resolve(process.cwd(), entryFile);
      if (!existsSync(entryFileAbsolute)) {
        console.error(`Cannot find file ${entryFileAbsolute}!`);
        return process.exit(1);
      }
      const entries = exports
        ? exports.split(',').map(ex => ({
            source: entryFileAbsolute,
            name: ex,
          }))
        : [
            {
              source: entryFileAbsolute,
              name: '*',
            },
          ];
      const plugins = options?.parserPlugins?.split(',') as any[];
      const sources = glob
        .sync(options?.source || '**/*.js')
        .map(src => path.resolve(process.cwd(), src));
      console.log('Check files:\n', sources);
      if (!sources.length) {
        console.error(`No files found matching ${'**/*.js'}!`);
        return process.exit(1);
      }
      const affected = await huntAffected(sources, entries, {
        parserOptions: {
          plugins,
        },
      });
      console.log(affected);
    }
  )
  .parse(process.argv);
