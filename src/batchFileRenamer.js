import convertToPromise from './convertToPromise';
import parseArgv from './parseArgv';
import buildArgs from './buildArgs';
import fsRename from './fsRename';
import getExistingFilenames from './getExistingFilenames';
import handleDuplicates from './handleDuplicates';
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


const batchFileRenamer = async ({ rule, argv, cliOptions, dupliationResolver, pre, post }) => {
    argv = argv || process.argv.slice(2);
    const [filenames, options] = parseArgv(argv, cliOptions);
    initialiseLogger(options);

    pre = convertToPromise(pre);
    post = convertToPromise(post);
    rule = convertToPromise(rule);

    await pre();
    const createNewNames = mapPromise((oldname) => rule(oldname, options));

    const oldnames = await getExistingFilenames(filenames, options);;
    const newnames = await createNewNames(oldnames);
    let pairs = buildArgs(oldnames, newnames);
    pairs = await handleDuplicates(pairs, dupliationResolver);
    await fsRename(pairs, options);

    await post();
}

export default batchFileRenamer;
