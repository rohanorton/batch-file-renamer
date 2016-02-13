/*globals it, describe, beforeEach, afterEach */
import mock from 'mock-fs';
import assert from 'assert';
import assertFileMoved from './utils/assertFileMoved';
import fsRenamer from '../src/fsRenamer';

// Setup + Teardown
const testDirectory = {
    testfile1: 'content of testfile1',
    testfile2: 'content of testfile2',
    testfile3: 'content of testfile3'
};

beforeEach(() => {
    mock(testDirectory);
    assertFileMoved.setup(testDirectory);
});

afterEach(() => {
    mock.restore()
    assertFileMoved.teardown();
});

describe('fsRenamer', () => {
    it('takes array of src/dest pairs and moves files', (done) => {
        const oldfile = 'testfile1';
        const newfile = 'foobarbaz';

        fsRenamer([[ oldfile, newfile ]], (err) => {
            assert(!err, 'should not error' + err);
            assertFileMoved(oldfile, newfile);
            done();
        });
    });
});
