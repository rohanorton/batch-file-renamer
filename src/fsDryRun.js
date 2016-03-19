import fs from 'fs-promise';
const fsDryRun = {
    move() {},
    copy() {},
    rmdir() {}
};

export default fsDryRun;
