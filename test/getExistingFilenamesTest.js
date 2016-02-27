/*globals it, describe, beforeEach, afterEach */
import mock from 'mock-fs';
import assert from 'assert';
import getExistingFilenames from '../src/getExistingFilenames';

const testDirectory = {
    testfile1: 'content of testfile1',
    testfile2: 'content of testfile2',
    testfile3: 'content of testfile3'
};

beforeEach(() => {
    mock(testDirectory);
});

afterEach(() => {
    mock.restore()
});

describe('getExistingFilenames', () => {
    it('should callback with array of all files if all source files exist', (done) => {
        const files = [ 'testfile1', 'testfile2', 'testfile3' ];
        const expected = files;
        getExistingFilenames(files).then(actual => {
            assert.deepEqual(actual, expected);
            done();
        });
    });
    it('should error if files do not exist', (done) => {
        const files = [ 'testfile1', 'this-is-made-up', 'testfile2', 'testfile3', 'oops-another-made-up-file' ];
        getExistingFilenames(files)
            .then(() => {
                assert(false, 'Should not return files');
            }).catch(err => {
                assert(err, 'Should error');
                done();
            });
    });
});
