import fsReal from 'fs-promise';
import fsDryRun from './fsDryRun';
import { map } from 'lodash/fp';
import keypressPrompt from 'keypress-prompt';
import onDeath from 'death';
import {BACKUP, DRY_RUN} from './flags';
import logger from './logger';
import FileRenamer from './FileRenamer';

class BatchRenamer {
    constructor(pairs, options = {}, prompt) {
        this.fs = options[DRY_RUN] ? fsDryRun : fsReal;
        this.tmpDir = '.tmp';
        this.options = options;
        this.renamers = map(([ src, dest ])=> new FileRenamer(src, dest, options, prompt), pairs);
        this.prompt = prompt;
        this.removeDeathListener = onDeath(::this.handleDeath);
    }

    async rename() {
        if (this.options[BACKUP]) {
            await this.backup();
        }
        await this.moveToTemp();
        await this.moveToDest();
        await this.cleanUp();
    }

    async backup() {
        for (const renamer of this.renamers) {
            await renamer.backup()
        }
    }

    async moveToTemp() {
        for (const renamer of this.renamers) {
            await renamer.moveToTemp();
        }
    }

    async moveToDest() {
        for (const renamer of this.renamers) {
            try {
                await renamer.moveToDest();
            } catch (err) {
                await this.cleanUp();
                throw err;
            }
        }
    }

    async cleanUp() {
        logger.debug('Cleaning up')
        for (const renamer of this.renamers) {
            await renamer.cleanUp();
        }
        try {
            // will only remove empty directory:
            await this.fs.rmdir(this.tmpDir);
        } catch (err) {
            logger.debug(`Error caught whilst cleaning up tmp directory, '${this.tmpDir}': \n    ${err.stack}`);
        }
        this.removeDeathListener();
    }

    handleDeath(signal) {
        logger.debug(`Received ${signal}.`)

        const codes = {
            SIGINT: 130,
            SIGQUIT: 131,
            SIGTERM: 143
        };

        const returnCode = codes[signal] || 1;

        const exit = () => {
            logger.debug(`Exiting with code: ${returnCode}`);
            process.exit(returnCode);
        }

        this.cleanUp()
            .then(exit)
            .catch(exit);
    }
}

let prompt = keypressPrompt.prompt;

const fsRename = (...args) => {
    const inst = new BatchRenamer(...args, prompt);
    return inst.rename();
}

// dependency injection for testing purposes:
fsRename.inject = (injectedPrompt) => {
    prompt = injectedPrompt;
};

fsRename.resetDependencies = () => {
    prompt = keypressPrompt.prompt;
};

export default fsRename;
