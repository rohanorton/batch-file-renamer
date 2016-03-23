import fs from 'fs-promise';
import path from 'path';
import logger from './logger';
import {RECURSIVE} from './flags';

const getDirectoryContents = async (items, options = {}, prefix = '') => {
    let files = [];
    for (let item of items) {
        const location = path.join(prefix, item);
        const stats = await fs.stat(location);
        if (stats.isDirectory() && options[RECURSIVE]) {
            const innerItems = await fs.readdir(location);
            const locations = await getDirectoryContents(innerItems, options, location);
            files = files.concat(locations);
        } else if (stats.isFile()){
            files.push(location);
        } else {
            logger.warn(`Sorry, I don't currently support whatever '${location}' is`);
        }
    }
    return files
}

export default getDirectoryContents;
