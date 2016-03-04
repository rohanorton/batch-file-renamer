/*globals it, describe, beforeEach, afterEach */
import mock from 'mock-fs';
import _ from 'lodash';
import * as assertFile from './utils/assertFile';
import fsRenamer from '../src/fsRenamer';
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

const testDirectory = {
    testfile1: 'content of testfile1',
    testfile2: 'content of testfile2',
    testfile3: 'content of testfile3'
};

beforeEach(() => {
    mock(testDirectory);
    assertFile.setup(testDirectory);
});

afterEach(() => {
    mock.restore()
    assertFile.teardown();
});

describe('fsRenamer', () => {
    it('takes array of src/dest pairs and moves files', () => {
        const pairs = [
            [ 'testfile1', 'foobarbaz' ],
            [ 'testfile2', 'bazbarfoo' ]
        ];
        return fsRenamer(pairs).then(() => {
            return Promise.all(_.map(pairs, ([ oldfile, newfile ]) => assertFile.moved(oldfile, newfile)));
        });
    });

    it('does not error on empty array', () => {
        const promise = fsRenamer([]);
        return assert.isFulfilled(promise);
    });

    it('returns error if source does not exist', () => {
        const pairs = [
            [ 'this-file-doesnt-exist', 'foobarbaz' ]
        ];
        const promise = fsRenamer(pairs);
        return assert.isRejected(promise);
    });

    // what should it do if we have same destination filename in there multiple times?
});
