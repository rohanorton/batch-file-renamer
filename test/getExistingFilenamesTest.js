/*globals it, describe, beforeEach, afterEach */
import mock from 'mock-fs';
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import getExistingFilenames from '../src/getExistingFilenames';

chai.use(chaiAsPromised);

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
        const promise = getExistingFilenames(files);
        return assert.becomes(promise, expected);
    });
    it('should error if files do not exist', () => {
        const files = [ 'testfile1', 'this-is-made-up', 'testfile2', 'testfile3', 'oops-another-made-up-file' ];
        const promise = getExistingFilenames(files);
        return assert.isRejected(promise);
    });
    it('should not error if file does not exist and passed { "ignore-missing-file": true } option', () => {
        const files = [ 'testfile1', 'this-is-made-up', 'testfile2', 'testfile3', 'oops-another-made-up-file' ];
        const expected = [ 'testfile1', 'testfile2', 'testfile3' ];
        const options = { 'ignore-missing-file': true };
        const promise = getExistingFilenames(files, options);
        return assert.becomes(promise, expected);
    });
});
