import yargsBuilder from 'yargs-builder';
import {ERROR_ON_MISSING_FILE, FORCE, BACKUP} from './flags';
import { defaults } from 'lodash';

const parseArgv = (argv, custom) => {
    const standard = {
        options: {
            [ERROR_ON_MISSING_FILE]: { default: false, describe: 'Fail if any source file missing', type: 'boolean' },
            [FORCE]: { default: false, alias: 'f', describe: 'Overwrite existing files', type: 'boolean' },
            [BACKUP]: { default: false, describe: 'Create backup of file', type: 'boolean' }
        }
    };
    const args = yargsBuilder(defaults(standard, custom), argv).argv;
    return [ args._, args ];
}

export default parseArgv;
