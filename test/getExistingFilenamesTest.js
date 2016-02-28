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
    it('should callback with array of all files if all source files exist', () => {
        const files = [ 'testfile1', 'testfile2', 'testfile3' ];
        const expected = files;
        return getExistingFilenames(files)
            .then(actual => {
                assert.deepEqual(actual, expected);
            });
    });
    it('should error if files do not exist', () => {
        const files = [ 'testfile1', 'this-is-made-up', 'testfile2', 'testfile3', 'oops-another-made-up-file' ];
        return getExistingFilenames(files)
            .then(() => {
                throw 'Should not return files';
            }).catch(err => {
                assert(err, 'Should error');
            });
    });
    it('should not error if file does not exist and passed { 'ignore-missing-file': true } option', () => {
        const files = [ 'testfile1', 'this-is-made-up', 'testfile2', 'testfile3', 'oops-another-made-up-file' ];
        const expected = [ 'testfile1', 'testfile2', 'testfile3' ];
        const options = { 'ignore-missing-file': true };
        return getExistingFilenames(files, options)
            .then(actual => {
                assert.deepEqual(actual, expected);
            }).catch(err => {
                assert(!err, 'Should not error');
            });
    });
});
