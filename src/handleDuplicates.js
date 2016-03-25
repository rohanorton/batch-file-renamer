import { _, map, countBy, identity, toPairs, reduce, first, last } from 'lodash/fp';
import logger from './logger';
import convertToPromise from './convertToPromise';

class DuplicationError extends Error {
    constructor(message, duplicates) {
        super(message);
        this.code = 'EDUPLDEST';
        this.duplicates = duplicates || [];
    }
}

const errorOnDuplicate = (duplicates) => {
    for (const duplicate of duplicates) {
        logger.warn(`Multiple files have destination 'duplicate'`);
    }
    throw new DuplicationError('Duplicate file destinations', duplicates);
}

const getDuplicates = (dests) => {
    const destCount = countBy(identity, dests );
    const keyValPairs = toPairs(destCount);
    return reduce((memo, [filename, count]) => {
        if (count > 1) {
            memo = [ ...memo, filename ];
        }
        return memo;
    }, [], keyValPairs);
}

const handleDuplicates = async (pairs, resolver = errorOnDuplicate) => {
    resolver = convertToPromise(resolver);
    const duplicates = getDuplicates(map(last, pairs));
    if (duplicates.length) {
        pairs = await resolver(duplicates, pairs);
    }
    return pairs;
}

export default handleDuplicates;
