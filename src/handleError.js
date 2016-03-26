import chalk from 'chalk';
import { includes, isFunction, defaults, noop } from 'lodash/fp';
import {DEBUG} from './flags';
import logger from './logger';

const formatMessage = (err, args = {}) => {
    const codes = defaults(args.errorMessages, {
        ENOENT: () => `No such file or directory: '${err.path}'`,
        EDUPLDEST: () =>`Duplicate file destinations: '${ err.duplicates.join("', '")}'`
    });
    return (codes[err.code] && isFunction(codes[err.code]) ? codes[err.code]() : codes[err.code]) ||
        err.message ||
        'An unexpected error occurred';
}

const handleError = (args = {}) => {
    return (err) => {
        const onError = args.onError || noop;
        onError();
        logger.error('Error:');
        logger.error(formatMessage(err, args));
        logger.debug('');
        logger.debug(err.stack);
        logger.debug('');
        process.exit(1);
    }
}

export default handleError;
