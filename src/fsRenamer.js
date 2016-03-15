import fs from 'fs-promise';
import path from 'path';
import uuid from 'uuid';
import { map } from 'lodash';
import keypressPrompt from 'keypress-prompt';
import {FORCE, BACKUP, INTERACTIVE} from './flags';

// assign to variable to enable dependency injection
let prompt = keypressPrompt.prompt;

const tmpDir = '.tmp';

let createTempFilename = (filename) =>
    path.join(tmpDir, `${filename}-${uuid.v4()}`);

let createMediation = (pairs) =>
    map(pairs, ([ src, dest ]) => [ src, createTempFilename(src), dest ]);

let cleanUp = async (mediated) => {
    for (const [ src, tmp ] of mediated) {
        try {
            await fs.move(tmp, src)
        } catch (err) {
            // ignore error
        }
    }
    try {
        // will only remove empty directory:
        fs.rmdir(tmpDir);
    } catch (err) {
        // ignore error
    }
}

let backup = async (mediated) => {
    for (const [ src ] of mediated) {
        await fs.copy(src, src + '.bak');
    }
}

let moveToTemp = async (mediated) => {
    for (const [ src, tmp ] of mediated) {
        await fs.move(src, tmp, { clobber: true, mkdirp: true });
    }
}

let shouldRename = async (src, dest, options) => {
    let result = true;
    if (options[INTERACTIVE]) {
        const confirm = 'y';
        let response = await prompt(`Renaming ${src} to ${dest}, are you sure?`, [confirm, 'n']);
        result = (response === confirm);
    }
    return result;
}

let moveToDest = async (mediated, options) => {
    for (const [ src, tmp, dest ] of mediated) {
        try {
            const rename = await shouldRename(src, dest, options);
            if (rename) {
                await fs.move(tmp, dest, { clobber: options[FORCE] });
            } else {
                await fs.move(tmp, src);
            }
        } catch (err) {
            if (err.code === 'EEXIST') {
                await fs.move(tmp, src);
            } else {
                await cleanUp(mediated);
                throw err;
            }
        }
    }
}

let fsRenamer = async (pairs, options = {}) => {
    let mediated = createMediation(pairs);
    if (options[BACKUP]) {
        await backup(mediated);
    }
    await moveToTemp(mediated);
    await moveToDest(mediated, options);
    await cleanUp(mediated);
}

// dependency injection for testing purposes:
fsRenamer.inject = (injectedPrompt) => {
    prompt = injectedPrompt;
}

fsRenamer.resetDependencies = () => {
    prompt = keypressPrompt.prompt;
}

export default fsRenamer;
