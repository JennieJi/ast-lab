import { getTrackedFiles, huntRevisionImpact } from 'git-changes-affected';
import { Revisions } from './gitChangesAffected';

const DEFAULT_CONFIG_FILE = 'webpack.config.js';

function resolveWebpack(revision: string, webpackConfig?: string[]) {
  const trackedFiles = getTrackedFiles(revision);
  const webpackConfigReg = new RegExp(
    `(${(webpackConfig ? [DEFAULT_CONFIG_FILE, ...webpackConfig] : [DEFAULT_CONFIG_FILE]).map(f => f.replace(/([\/|.-{(])/g, '\\$1')).join('|')})$`
  );
  const trackedFiles.filter(webpackConfigReg.test).map(conf => {
    
  });
}