import { _, flow, last, isNil } from 'lodash';
import assert from 'assert';

const validateArgs = (sourcenames, destnames) => {
    assert(sourcenames, 'Array of sources must be specified');
    assert(destnames, 'Array of destinations must be specified');
    assert(sourcenames.length === destnames.length, 'Number of sources and destinations must match');
}

const identicalSourceAndDest = ([sourcename, destname]) =>
    sourcename === destname;

const missingDest =
    flow(last, isNil);

const argsBuilder = (sourcenames, destnames) => {
    validateArgs(sourcenames, destnames);
    return _(sourcenames)
        .zip(destnames)
        .reject(identicalSourceAndDest)
        .reject(missingDest)
        .uniqBy(JSON.stringify)
        .value();
}

export default argsBuilder;
