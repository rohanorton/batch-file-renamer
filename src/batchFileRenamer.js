import hasCallback from 'has-callback';
import promisify from 'es6-promisify';

import parseArgv from './parseArgv';
import renamerArgsBuilder from './renamerArgsBuilder';
import fsRenamer from './fsRenamer';
import getExistingFilenames from './getExistingFilenames';
import mapPromise from './mapPromise';


const batchFileRenamer = async ({ rule, argv, cliOptions }) => {
    argv = argv || process.argv.slice(2);
    const [filenames, options] = parseArgv(argv, cliOptions);
    rule = hasCallback(rule) ? promisify(rule) : rule;
    const namesFromRule = mapPromise((oldname) => rule(oldname, options));

    const oldnames = await getExistingFilenames(filenames, options);
    const newnames = await namesFromRule(oldnames);
    const pairs = renamerArgsBuilder(oldnames, newnames);
    await fsRenamer(pairs, options);
}

export default batchFileRenamer;
