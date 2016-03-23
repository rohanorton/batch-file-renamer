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

describe('getExistingFilenames', () => {
    beforeEach(() => {
        mock(testDirectory);
    });

    afterEach(() => {
        mock.restore()
    });

    it('returns array of all files if all source files exist', () => {
        const files = [ 'testfile1', 'testfile2', 'testfile3' ];
        const expected = files;
        const promise = getExistingFilenames(files);
        return assert.becomes(promise, expected);
    });
    it('returns array with non-existent files removed', () => {
        const files = [ 'testfile1', 'this-is-made-up', 'testfile2', 'testfile3', 'oops-another-made-up-file' ];
        const expected = [ 'testfile1', 'testfile2', 'testfile3' ];
        const promise = getExistingFilenames(files);
        return assert.becomes(promise, expected);
    });
    it('throws error if non-existent files and passed error-on-missing option', () => {
        const files = [ 'testfile1', 'this-is-made-up', 'testfile2', 'testfile3', 'oops-another-made-up-file' ];
        const options = { 'error-on-missing': true };
        const promise = getExistingFilenames(files, options);
        return assert.isRejected(promise, /ENOENT/);
    });

    describe('directory handling', () => {
        beforeEach(() => {
            mock({
                testfile1: 'content of testfile1',
                testfile2: 'content of testfile2',
                testfile3: 'content of testfile3',
                testDir: {
                    nestedfile1: 'content of nestedfile1',
                    nestedfile2: 'content of nestedfile2',
                    nestedfile3: 'content of nestedfile3'
                },
                anotherTestDir: {
                    nestedDir: {
                        deeperStill: {
                            verynestedfile: 'oh good, you got here!'
                        }
                    }
                }
            });
        });

        afterEach(() => {
            mock.restore();
        });

        it('takes list of files and returns them', () => {
            const promise = getExistingFilenames([ 'testfile1', 'testfile2', 'testfile3' ]);
            return assert.becomes(promise, [ 'testfile1', 'testfile2', 'testfile3' ]);
        });

        it('ignores directory', () => {
            const promise = getExistingFilenames([ 'testfile1', 'testDir' ]);
            return assert.becomes(promise, [ 'testfile1' ]);
        });

        it('takes directory and returns contents if passed recursive flag', () => {
            const promise = getExistingFilenames([ 'testfile1', 'testDir' ], { recursive: true });
            return assert.becomes(promise, [
                'testfile1',
                'testDir/nestedfile1',
                'testDir/nestedfile2',
                'testDir/nestedfile3'
            ]);
        });

        it('recurses deeply if passed recursive flag', () => {
            const promise = getExistingFilenames([ 'anotherTestDir' ], { recursive: true });
            return assert.becomes(promise, [
                'anotherTestDir/nestedDir/deeperStill/verynestedfile'
            ]);
        });
    });
});
