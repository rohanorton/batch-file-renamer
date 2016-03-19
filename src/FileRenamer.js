import fs from 'fs-promise';
import path from 'path';
import uuid from 'uuid';
import {FORCE, BACKUP, INTERACTIVE} from './flags';
import logger from './logger';

class FileRenamer {
    constructor(src, dest, options, prompt) {
        this.tmpDir = '.tmp';
        this.src = src;
        this.dest = dest;
        this.options = options;
        this.tmp = this.createTempFilename();
        this.prompt = prompt;
        this.isMediate = false;
    }

    async backup() {
        logger.debug(`Creating backup of '${this.src}'`);
        await fs.copy(this.src, this.src + '.bak');
    }

    async moveToTemp() {
        logger.debug(`Moving source, '${this.src}', to temporary file, '${this.tmp}'`);
        await fs.move(this.src, this.tmp, { clobber: true, mkdirp: true });
        this.isMediate = true;
    }

    async moveToDest() {
        if (await this.shouldRename(this.src, this.dest)) {
            logger.debug(`Moving temporary file, '${this.tmp}', to destination, '${this.dest}'`);
            try {
                await fs.move(this.tmp, this.dest, { clobber: this.options[FORCE] });
                this.isMediate = false;
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

    async cleanUp() {
        if (this.isMediate) {
            logger.debug(`Cleaning up: Moving temporary file, '${this.tmp}' back to source, '${this.src}'`);
            await fs.move(this.tmp, this.src);
            this.isMediate = false;
        }
    }

    createTempFilename() {
        return path.join(this.tmpDir, `${this.src}-${uuid.v4()}`);
    }
}

export default FileRenamer;
