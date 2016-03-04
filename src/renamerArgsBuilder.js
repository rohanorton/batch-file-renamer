import { _, some, isNil } from 'lodash';
import assert from 'assert';

const validateArgs = (sourcenames, destnames) => {
    assert(sourcenames, 'Array of sources must be specified');
    assert(destnames, 'Array of destinations must be specified');
    assert.equal(sourcenames.length, destnames.length, 'Number of sources and destinations must match');
}

// checks for [ 'file', 'file' ]
const identicalSourceAndDest = ([src, dest]) =>
    src === dest;

// checks for [ 'file', null ] or [ null, 'file' ]
const missingElement = (pair) =>
    some(pair, isNil);

const argsBuilder = (sourcenames, destnames) => {
    validateArgs(sourcenames, destnames);
    return _(sourcenames)
        .zip(destnames)
        .reject(identicalSourceAndDest)
        .reject(missingElement)
        .uniqBy(JSON.stringify)
        .value();
}

export default argsBuilder;
