import { _, every, some, isEmpty, isString } from 'lodash';
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
const onlyStrings = (pair) =>
    every(pair, isString);

const emptyStrings = (pair) =>
    some(pair, isEmpty);

const argsBuilder = (sourcenames, destnames) => {
    validateArgs(sourcenames, destnames);
    return _(sourcenames)
        .zip(destnames)
        .reject(identicalSourceAndDest)
        .filter(onlyStrings)
        .reject(emptyStrings)
        .uniqBy(JSON.stringify)
        .value();
}

export default argsBuilder;
