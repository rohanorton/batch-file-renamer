import fs from 'fs-promise';
import {ERROR_ON_MISSING_FILE} from './flags';
import logger from './logger';

const getExistingFilenames = async (filenames, options = {}) => {
    let memo = [];
    for (let filename of filenames) {
        try {
            await fs.stat(filename);
            memo.push(filename);
        } catch (err) {
            handleError(err, filename, options);
        }
    }
    return memo;
};

const handleError = (err, filename, options) => {
    if (err.code === 'ENOENT') {
        if (options[ERROR_ON_MISSING_FILE]) throw err;
        logger.warn(`Cannot stat '${filename}': No such file or directory`);
    } else {
        throw err;
    }
}

export default getExistingFilenames;
