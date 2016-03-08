import fs from 'fs-promise';

let backup = async (file) => {
    await fs.copy(file, file + '.bak');
}

let fsRenamer = async (pairs, options = {}) => {
    for (const [ src, dest ] of pairs) {
        try {
            if (options.backup) {
                await backup(src);
            }
            await fs.move(src, dest, { clobber: options.force });
        } catch (err) {
            if (err.code === 'EEXIST') {
            } else {
                throw err;
            }
        }
    }
}

export default fsRenamer;
