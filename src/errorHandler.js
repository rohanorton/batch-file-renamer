import chalk from 'chalk';
import { get, includes } from 'lodash';
import {DEBUG} from './flags';

const formatMessage = (err) => {
    switch (err.code) {
    case 'ENOENT':
        return 'No such file or directory: ' + err.path;
    default:
        return err.message;
    }
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
