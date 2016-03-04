import { _, partial, flow, last, isNil } from 'lodash';
import assert from 'assert';

const validateArgs = (sourcenames, destnames) => {
    assert(sourcenames, 'Array of sources must be specified');
    assert(destnames, 'Array of destinations must be specified');
    assert.equal(sourcenames.length, destnames.length, 'Number of sources and destinations must match');
}

// checks for [ 'file', 'file' ]
const identicalSourceAndDest = ([src, dest]) =>
    src === dest;

// checks for [ 'file', null ]
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
