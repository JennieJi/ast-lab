import { execSync } from 'child_process';

function exec(cmd: string): string {
  return execSync(cmd, {
    maxBuffer: 500 * 1024 * 1000
  }).toString().trim();
}

/** @internal */
export default exec;