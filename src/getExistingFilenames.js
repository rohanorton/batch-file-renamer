import fs from 'fs-promise';
import {ERROR_ON_MISSING_FILE} from './flags';

const getExistingFilenames = async (filenames, options = {}) => {
    let memo = [];
    for (let filename of filenames) {
        try {
            await fs.stat(filename);
            memo.push(filename);
        } catch (err) {
            handleError(err, options);
        }
    }
    return memo;
};

const handleError = (err, options) => {
    if (err.code === 'ENOENT') {
        if (options[ERROR_ON_MISSING_FILE]) throw err;
    } else {
        throw err;
    }
}

export default getExistingFilenames;
