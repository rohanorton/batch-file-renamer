import fs from 'fs-promise';

let fsRenamer = async (pairs, options = {}) => {
    for (let pair of pairs) {
        try {
            await fs.move(...pair, { clobber: options.force });
        } catch (err) {
            if (err.code === 'EEXIST') {
            } else {
                throw err;
            }
        }
    }
}

export default fsRenamer;
