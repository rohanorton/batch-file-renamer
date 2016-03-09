import chalk from 'chalk';
import { get, includes, defaults } from 'lodash';
import {DEBUG} from './flags';

const formatMessage = (err, options = {}) => {
    const codes = defaults({
        ENOENT: 'No such file or directory: ' + err.path
    }, args.errorMessages);
    return codes[err.code] || err.message;
}

const errorHandler = (args = {}) => {
    const debug = includes(args.argv, `--${DEBUG}`);
    return (err) => {
        console.log(chalk.red('Error:'))
        console.log(chalk.red(formatMessage(err)));
        if (debug) {
            console.log('');
            console.log(err.stack);
            console.log('');
        }
        process.exit(1);
    }
}

export default errorHandler;
