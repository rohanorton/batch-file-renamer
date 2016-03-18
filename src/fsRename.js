import fs from 'fs-promise';
import path from 'path';
import uuid from 'uuid';
import { map, noop } from 'lodash/fp';
import keypressPrompt from 'keypress-prompt';
import onDeath from './onDeath';
import {FORCE, BACKUP, INTERACTIVE} from './flags';
import logger from './logger';

// assign to variable to enable dependency injection
let prompt = keypressPrompt.prompt;

let removeDeathListener = noop;

const tmpDir = '.tmp';

let createTempFilename = (filename) =>
    path.join(tmpDir, `${filename}-${uuid.v4()}`);

let cleanUp = async (mediated) => {
    logger.debug('cleaning up')
    for (const [ src, tmp ] of mediated) {
        try {
            await fs.move(tmp, src)
        } catch (err) {
            logger.debug(`error caught whilst moving '${tmp}' to '${src}':`);
            logger.debug(err.message);
            logger.debug('')
            logger.debug(err.stack);
            logger.debug('')
        }
    }
    try {
        // will only remove empty directory:
        fs.rmdir(tmpDir);
    } catch (err) {
        logger.debug(`error caught whilst removing tmp directory, '${tmpDir}':`);
        logger.debug(err.message);
        logger.debug('')
        logger.debug(err.stack);
        logger.debug('')
    }
    removeDeathListener();
}

let backup = async (mediated) => {
    for (const [ src ] of mediated) {
        logger.debug(`creating backup of '${src}'`);
        await fs.copy(src, src + '.bak');
    }
}

let moveToTemp = async (mediated) => {
    for (const [ src, tmp ] of mediated) {
        logger.debug(`Moving source, '${src}', to temporary file, '${tmp}'`);
        await fs.move(src, tmp, { clobber: true, mkdirp: true });
    }
}

let promptUser = async (src, dest) => {
    const confirmKey = 'y';
    const response = await prompt(`Renaming '${src}' to '${dest}', are you sure?`, [confirmKey, 'n'])
    return response === confirmKey;
}

let shouldRename = async (src, dest, options) =>
    options[INTERACTIVE] ? await promptUser(src, dest) : true;

let moveToDest = async (mediated, options) => {
    for (const [ src, tmp, dest ] of mediated) {
        try {
            if (await shouldRename(src, dest, options)) {
                logger.debug(`Moving temporary file, '${tmp}', to destination, '${dest}'`);
                await fs.move(tmp, dest, { clobber: options[FORCE] });
            } else {
                logger.debug(`Moving temporary file, '${tmp}' back to source, '${src}'`);
                await fs.move(tmp, src);
            }
        } catch (err) {
            if (err.code === 'EEXIST') {
                // File exist
                logger.warn(`Failed to move file '${src}' to '${dest}': File exists`);
                logger.debug(`Moving temporary file, '${tmp}' back to source, '${src}'`);
                await fs.move(tmp, src);
            } else if (err.sequence === '\u0003') {
                // SIGINT caught by keypress prompt library
                logger.debug('Caught SIGINT');
                await cleanUp(mediated);
                process.exit();
            } else {
                await cleanUp(mediated);
                throw err;
            }
        }
    }
}

const handleDeath = (mediated) => {
    cleanUp(mediated)
        .then(() => process.exit())
        .catch(() => process.exit(1));
}


let createMediation = ([ src, dest ]) =>
	[ src, createTempFilename(src), dest ];

let fsRename = async (pairs, options = {}) => {
    const mediated = map(createMediation, pairs);

    removeDeathListener = onDeath(handleDeath.bind(null, mediated));

    if (options[BACKUP]) {
        await backup(mediated);
    }
    await moveToTemp(mediated);
    await moveToDest(mediated, options);
    await cleanUp(mediated);

    removeDeathListener();
}

// dependency injection for testing purposes:
fsRename.inject = (injectedPrompt) => {
    prompt = injectedPrompt;
}

fsRename.resetDependencies = () => {
    prompt = keypressPrompt.prompt;
}

export default fsRename;
