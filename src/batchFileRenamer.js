import hasCallback from 'has-callback';
import promisify from 'es6-promisify';

import parseArgv from './parseArgv';
import renamerArgsBuilder from './renamerArgsBuilder';
import fsRenamer from './fsRenamer';
import getExistingFilenames from './getExistingFilenames';
import map from './promiseMap';


const batchFileRenamer = async ({ rule, argv, cliOptions }) => {
    argv = argv || process.argv.slice(2);
    const [filenames, options] = parseArgv(argv, cliOptions);
    rule = hasCallback(rule) ? promisify(rule) : rule;

    const oldnames = await getExistingFilenames(filenames, options);
    const newnames = await map(oldnames, (oldname) => rule(oldname, options))
    const pairs = renamerArgsBuilder(oldnames, newnames);
    await fsRenamer(pairs, options);
}

export default batchFileRenamer;
