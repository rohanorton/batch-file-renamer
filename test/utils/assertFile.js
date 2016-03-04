import _ from 'lodash';
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import fs from 'fs-promise';

chai.use(chaiAsPromised);

let testDirectory = null;

const getTestDirectoryContentFromPath = (path) =>
    _.get(testDirectory, path.split('/'));

const exists = (filename, message) =>
    assert.becomes(fs.exists(filename), true, message);

const doesntExist = (filename, message) =>
    assert.becomes(fs.exists(filename), false, message);

const assertFileContent = (newfile, oldfile, message) => {
    const newfilecontent = fs.readFile(newfile, 'utf-8');
    const oldfilecontent = getTestDirectoryContentFromPath(oldfile);
    return assert.becomes(newfilecontent, oldfilecontent, message);
}

const moved = (oldfile, newfile) => {
    const assertions = [
        // check locations of files
        doesntExist(oldfile, 'source file should no longer exist after function call: ' + oldfile),
        exists(newfile, 'file destination should exist after function call: ' + newfile),

        // check contents of files
        assertFileContent(newfile, oldfile, 'content of new file should be same as old')
    ];
    return Promise.all(assertions);
};

const unmoved = (oldfile, newfile) => {
    // check locations of files
    const assertions = [
        exists(oldfile, 'source file should still exist after function call: ' + oldfile)
    ]
    if (newfile) {
        assertions.push( doesntExist(newfile, 'file destination should not exist after function call: ' + newfile))
    }
    return Promise.all(assertions);
};

const setup = (directory) => {
    testDirectory = directory;
};

const teardown = () => {
    testDirectory = null;
}

export { setup, teardown, moved, unmoved, exists, doesntExist };
