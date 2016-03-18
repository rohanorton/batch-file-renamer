import hasCallback from 'has-callback';
import promisify from 'es6-promisify';

import parseArgv from './parseArgv';
import buildArgs from './buildArgs';
import fsRename from './fsRename';
import getExistingFilenames from './getExistingFilenames';
import mapPromise from './mapPromise';

import logger from './logger';

const initialiseLogger = ({ silent, quiet, verbose, DEBUG, colour }) => {
    const level =
        silent  ? 'silent' :
        quiet   ? 'error'  :
        verbose ? 'log'    :
        DEBUG   ? 'debug'  :
                  'warn'   ;

    logger.init({ level, colour })
}


const batchFileRenamer = async ({ rule, argv, cliOptions }) => {
    argv = argv || process.argv.slice(2);
    const [filenames, options] = parseArgv(argv, cliOptions);
    initialiseLogger(options);
    rule = hasCallback(rule) ? promisify(rule) : rule;
    const createNewNames = mapPromise((oldname) => rule(oldname, options));

    const oldnames = await getExistingFilenames(filenames, options);
    const newnames = await createNewNames(oldnames);
    const pairs = buildArgs(oldnames, newnames);
    await fsRename(pairs, options);
}

export default batchFileRenamer;
