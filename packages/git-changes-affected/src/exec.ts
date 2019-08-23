import util from 'util';
import { exec } from 'child_process';

const pExec = util.promisify(exec);

export default pExec;