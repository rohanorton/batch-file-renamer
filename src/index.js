import hasCallback from 'has-callback';
import promisify from 'es6-promisify';

import parseArgv from './parseArgv';
import renamerArgsBuilder from './renamerArgsBuilder';
import fsRenamer from './fsRenamer';
import getExistingFilenames from './getExistingFilenames';
import errorHandler from './errorHandler';

const batchFileRenamer = async ({ rule, argv }) => {
    rule = hasCallback(rule) ? promisify(rule) : rule;

    const [filenames, options] = parseArgv(argv);

    const oldnames = await getExistingFilenames(filenames, options);

    let newnames = [];
    for (let oldname of oldnames) {
        let newname = await rule(oldname, options);
        newnames.push(newname);
    }

    let pairs = renamerArgsBuilder(oldnames, newnames);
    await fsRenamer(pairs, options);
}

export { batchFileRenamer };
export default (args) =>
    batchFileRenamer(args).catch(errorHandler(args));
