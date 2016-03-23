import mock from 'mock-fs';
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import getDirectoryContents from '../src/getDirectoryContents';
chai.use(chaiAsPromised);



describe('getDirectoryContents', () => {
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
        const promise = getDirectoryContents([ 'testfile1', 'testfile2', 'testfile3' ]);
        return assert.becomes(promise, [ 'testfile1', 'testfile2', 'testfile3' ]);
    });

    it('ignores directory', () => {
        const promise = getDirectoryContents([ 'testfile1', 'testDir' ]);
        return assert.becomes(promise, [ 'testfile1' ]);
    });

    it('takes directory and returns contents if passed recursive flag', () => {
        const promise = getDirectoryContents([ 'testfile1', 'testDir' ], { recursive: true });
        return assert.becomes(promise, [
            'testfile1',
            'testDir/nestedfile1',
            'testDir/nestedfile2',
            'testDir/nestedfile3'
        ]);
    });

    it('recurses deeply if passed recursive flag', () => {
        const promise = getDirectoryContents([ 'anotherTestDir' ], { recursive: true });
        return assert.becomes(promise, [
            'anotherTestDir/nestedDir/deeperStill/verynestedfile'
        ]);
    });
});
