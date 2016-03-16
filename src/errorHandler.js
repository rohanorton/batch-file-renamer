import chalk from 'chalk';
import { includes, defaults } from 'lodash/fp';
import {DEBUG} from './flags';


const formatMessage = (err, args = {}) => {
    const codes = defaults({
        ENOENT: 'No such file or directory: ' + err.path
    }, args.errorMessages);
    return codes[err.code] || err.message || 'An unexpected error occurred';
}

const isDebugging = () =>
    includes(`--${DEBUG}`, process.argv);

const errorHandler = (args = {}) => {
    return (err) => {
        console.log(chalk.red('Error:'))
        console.log(chalk.red(formatMessage(err, args)));
        if (isDebugging()) {
            console.log('');
            console.log(err.stack);
            console.log('');
        }
        process.exit(1);
    }
}

export default errorHandler;
