import renamerArgsBuilder from './renamerArgsBuilder';
import fsRenamer from './fsRenamer';
import hasCallback from 'has-callback';
import getExistingFilenames from './getExistingFilenames';
import promisify from 'es6-promisify';


const batchFileRenamer = async ({ rule, argv }) => {
    rule = hasCallback(rule) ? promisify(rule) : rule;
    let oldnames = argv;
    let options = {};

    oldnames = await getExistingFilenames(oldnames, options);

    let newnames = [];
    for (let oldname of oldnames) {
        let newname = await rule(oldname, options);
        newnames.push(newname);
    }

    let args = renamerArgsBuilder(oldnames, newnames);
    await fsRenamer(args)
}

export default batchFileRenamer;
