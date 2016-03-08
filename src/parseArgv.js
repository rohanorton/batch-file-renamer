import yargsBuilder from 'yargs-builder';
import {ERROR_ON_MISSING_FILE, FORCE} from './flags';

const parseArgv = (argv) => {
    const defaults = {
        options: {
            [ERROR_ON_MISSING_FILE]: { default: false, describe: 'Fail if any source file missing', type: 'boolean' },
            [FORCE]: { default: false, describe: 'Overwrite existing files', type: 'boolean' }
        }
    };
    const args = yargsBuilder(defaults, argv).argv;
    return [ args._, args ];
}

export default parseArgv;
