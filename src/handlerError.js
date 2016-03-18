import chalk from 'chalk';
import { includes, defaults } from 'lodash/fp';
import {DEBUG} from './flags';
import logger from './logger';

const formatMessage = (err, args = {}) => {
    const codes = defaults({
        ENOENT: 'No such file or directory: ' + err.path
    }, args.errorMessages);
    return codes[err.code] || err.message || 'An unexpected error occurred';
}

const handleError = (args = {}) => {
    return (err) => {
        logger.error('Error:')
        logger.error(formatMessage(err, args));
        logger.debug('');
        logger.debug(err.stack);
        logger.debug('');
        process.exit(1);
    }
}

export default handleError;
