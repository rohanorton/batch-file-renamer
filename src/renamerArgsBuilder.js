import _ from 'lodash';

let argsBuilder = (oldnames, newnames) => {
    if (oldnames.length !== newnames.length) {
        throw new Error('Array Length Mismatch');
    }
    return _(oldnames)
        .zip(newnames)
        .filter(([oldname, newname]) => oldname !== newname)
        .uniq(JSON.stringify)
        .value();
}

export default argsBuilder;
