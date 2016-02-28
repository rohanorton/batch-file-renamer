import hasCallback from 'has-callback';
import promisify from 'es6-promisify';
import yargsBuilder from 'yargs-builder';

import renamerArgsBuilder from './renamerArgsBuilder';
import fsRenamer from './fsRenamer';
import getExistingFilenames from './getExistingFilenames';

import {ERROR_ON_MISSING_FILE} from './flags';

const parseArgs = (argv) => {
    const args = yargsBuilder({
        options: {
            [ERROR_ON_MISSING_FILE]: { default: false, describe: 'Fail if source file missing', type: 'boolean' }
        }
    }, argv).argv;
    return [ args._, args ];
}

const batchFileRenamer = async ({ rule, argv }) => {
    rule = hasCallback(rule) ? promisify(rule) : rule;
    const [filenames, options] = parseArgs(argv);

    const oldnames = await getExistingFilenames(filenames, options);

    let newnames = [];
    for (let oldname of oldnames) {
        let newname = await rule(oldname, options);
        newnames.push(newname);
    }

    let pairs = renamerArgsBuilder(oldnames, newnames);
    await fsRenamer(pairs);
}

export default batchFileRenamer;
