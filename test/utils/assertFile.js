import _ from 'lodash';
import assert from 'assert';
import fs from 'fs';

let testDirectory = null;

const getTestDirectoryContentFromPath = (path) =>
    _.get(testDirectory, path.split('/'));

const exists = (filename, message) =>
    assert.equal(fs.existsSync(filename), true, message);

const doesntExist = (filename, message) =>
    assert.equal(fs.existsSync(filename), false, message);

const moved = (oldfile, newfile) => {
    // check locations of files
    doesntExist(oldfile, 'source file should no longer exist after function call: ' + oldfile)
    exists(newfile, 'file destination should exist after function call: ' + newfile)
    // check contents of files
    const newfilecontent = fs.readFileSync(newfile, 'utf-8')
    const oldfilecontent = getTestDirectoryContentFromPath(oldfile)
    assert.equal(newfilecontent, oldfilecontent, 'content of new file should be same as old')
};

const unmoved = (oldfile, newfile) => {
    // check locations of files
   exists(oldfile, 'source file should still exist after function call: ' + oldfile)
   if (newfile) {
      doesntExist(newfile, 'file destination should not exist after function call: ' + newfile)
   }
};

const setup = (directory) => {
    testDirectory = directory;
};

const teardown = () => {
    testDirectory = null;
}

export { setup, teardown, moved, unmoved, exists, doesntExist };
