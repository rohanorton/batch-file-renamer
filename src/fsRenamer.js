import fs from 'fs-promise';

let fsRenamer = async (pairs) => {
    for (let pair of pairs) {
        try {
            await fs.move(...pair);
        } catch (err) {
            if (err.code === 'EEXIST') {
            } else {
                throw err;
            }
        }
    }
}

export default fsRenamer;
