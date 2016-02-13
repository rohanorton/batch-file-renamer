import _ from 'lodash';
import assert from 'assert';
import fs from 'fs';

let testDirectory = null;

const getTestDirectoryContentFromPath = (path) =>
    _.get(testDirectory, path.split('/'));

const assertFileMoved = (oldfile, newfile) => {
    // check locations of files
    assert.equal(fs.existsSync(oldfile), false, 'source file should no longer exist after function call: ' + oldfile)
    assert.equal(fs.existsSync(newfile), true, 'file destination should exist after function call: ' + newfile)
    // check contents of files
    const newfilecontent = fs.readFileSync(newfile, 'utf-8')
    const oldfilecontent = getTestDirectoryContentFromPath(oldfile)
    assert.equal(newfilecontent, oldfilecontent, 'content of new file should be same as old')
};

assertFileMoved.setup = (directory) => {
    testDirectory = directory;
};

assertFileMoved.teardown = () => {
    testDirectory = null;
}

export default assertFileMoved;
