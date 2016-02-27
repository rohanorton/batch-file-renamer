import fs from 'fs-promise';

const getExistingFilenames = async (filenames) => {
    let memo = [];
    for (let filename of filenames) {
        let stats = await fs.stat(filename);
        if (stats) {
            memo.push(filename);
        }
    }
    return memo;
};

export default getExistingFilenames;
