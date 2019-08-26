import { execSync } from 'child_process';

function exec(cmd: string): string {
  return execSync(cmd).toString();
}

export default exec;