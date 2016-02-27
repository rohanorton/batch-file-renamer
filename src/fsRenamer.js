import fs from 'fs-promise';

let fsRenamer = async (pairs) => {
    for (let pair of pairs) {
        await fs.rename(...pair);
    }
}

export default fsRenamer;
