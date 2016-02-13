import fs from 'fs';
import asyn from 'async';

let rename = ([src, dest], callback) =>
    fs.rename(src, dest, callback);

let fsRenamer = (pairs, callback) =>
    asyn.each(pairs, rename, callback);

export default fsRenamer;
