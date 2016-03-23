import fs from 'fs-promise';
import path from 'path';
import {ERROR_ON_MISSING_FILE, RECURSIVE} from './flags';
import logger from './logger';

const getExistingFilenames = async (items, options = {}, prefix = '') => {
    let files = [];
    for (let item of items) {
        const location = path.join(prefix, item);
        try {
            const stats = await fs.stat(location);

            if (stats.isDirectory() && options[RECURSIVE]) {
                const innerItems = await fs.readdir(location);
                const locations = await getExistingFilenames(innerItems, options, location);
                files = files.concat(locations);
            } else if (stats.isFile()){
                files.push(location);
            } else {
                logger.warn(`Sorry, I don't currently support whatever '${location}' is`);
            }
        } catch (err) {
            handleError(err, location, options);
        }
    }
    return files
}

const handleError = (err, filename, options) => {
    if (err.code === 'ENOENT') {
        if (options[ERROR_ON_MISSING_FILE]) throw err;
        logger.warn(`Cannot stat '${filename}': No such file or directory`);
    } else {
        throw err;
    }
}

export default getExistingFilenames;
