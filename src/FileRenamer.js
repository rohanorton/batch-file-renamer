import fsReal from 'fs-promise';
import fsDryRun from './fsDryRun';
import path from 'path';
import uuid from 'uuid';
import {FORCE, BACKUP, INTERACTIVE, DRY_RUN} from './flags';
import logger from './logger';

class FileRenamer {
    constructor(src, dest, options, prompt) {
        this.fs = options[DRY_RUN] ? fsDryRun : fsReal;
        this.tmpDir = '.tmp';
        this.src = src;
        this.dest = dest;
        this.options = options;
        this.tmp = this.createTempFilename();
        this.prompt = prompt;
    }

    async backup() {
        logger.debug(`Creating backup of '${this.src}'`);
        await this.fs.copy(this.src, this.src + '.bak');
    }

    async moveToTemp() {
        logger.debug(`Moving source, '${this.src}', to temporary file, '${this.tmp}'`);
        await this.fs.move(this.src, this.tmp, { clobber: true, mkdirp: true });
    }

    async moveToDest() {
        if (await this.shouldRename(this.src, this.dest)) {
            logger.debug(`Moving temporary file, '${this.tmp}', to destination, '${this.dest}'`);
            logger.log(`Moving '${this.src}' to '${this.dest}'`);
            try {
                await this.fs.move(this.tmp, this.dest, { clobber: this.options[FORCE] });
                await this.cleanUpTmpDirectories();
            } catch (err) {
                if (err.code === 'EEXIST') {
                    logger.warn(`Failed to move file '${this.src}' to '${this.dest}': File exists`);
                    await this.cleanUp();
                } else {
                    throw err;
                }
            }
        } else {
            await this.cleanUp();
        }
    }

    async promptUser() {
        const confirmKey = 'y';
        let response;
        try {
            response = await this.prompt(`Renaming '${this.src}' to '${this.dest}', are you sure?`, [confirmKey, 'n'])
        } catch (err) {
            if (err.sequence === '\u0003') {
                // SIGINT caught by keypress prompt library
                process.emit('SIGINT');
            } else {
                throw err;
            }
        }
        return response === confirmKey;
    }

    async shouldRename(src, dest) {
        return this.options[INTERACTIVE] ? await this.promptUser(src, dest) : true;
    }

    async cleanUpTmpDirectories() {
        let dirs = path.dirname(this.tmp)
        try {
            while (dirs !== '.') {
                await this.fs.rmdir(dirs);
                dirs = path.dirname(dirs);
            }
        } catch (err) {
            if (err.code == 'ENOENT'  || err.code == 'ENOTEMPTY') {
                // ignore error if directory doesn't exist or is not empty
                return;
            } else {
                throw err;
            }
        }
    }

    async cleanUp() {
        try {
            logger.debug(`Cleaning up: Moving temporary file, '${this.tmp}' back to source, '${this.src}'`);
            await this.fs.move(this.tmp, this.src);
            await this.cleanUpTmpDirectories();
        } catch (err) {
            // There is often no file to move as it has already been moved.
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
    }

    createTempFilename() {
        return path.join(this.tmpDir, `${this.src}-${uuid.v4()}`);
    }
}

export default FileRenamer;
