import yargs from 'yargs';
import {ERROR_ON_MISSING_FILE, FORCE, BACKUP, INTERACTIVE} from './flags';
import mergeOptions from './optionsMerger';


const parseArgv = (argv, custom = {}) => {
    const standard = {
        [FORCE]: { alias: 'f', describe: 'Overwrite existing files', type: 'boolean' },
        [INTERACTIVE]: { alias: 'i', describe: 'Prompt for file change', type: 'boolean' },
        [BACKUP]: { describe: 'Create backup of file', type: 'boolean' },
        [ERROR_ON_MISSING_FILE]: { describe: 'Fail if any source file missing', type: 'boolean' },
    };
    const options = mergeOptions(custom.options, standard);
    const parsed = yargs(argv)
        .options(options)
        .help('h').alias('help', 'h')
        .version().alias('version', 'V')
        .argv;

    return [ parsed._, parsed ];
}

export default parseArgv;
