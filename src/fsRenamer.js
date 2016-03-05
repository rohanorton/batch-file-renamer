import fs from 'fs-promise';

let fsRenamer = async (pairs) => {
    for (let pair of pairs) {
        await fs.move(...pair);
    }
}

export default fsRenamer;
