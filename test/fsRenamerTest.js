/*globals it, describe, beforeEach, afterEach */
import mock from 'mock-fs';
import _ from 'lodash';
import * as assertFile from './utils/assertFile';
import fsRenamer from '../src/fsRenamer';
import assert from 'assert';

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
    it('takes array of src/dest pairs and moves files', (done) => {
        const pairs = [
            [ 'testfile1', 'foobarbaz' ],
            [ 'testfile2', 'bazbarfoo' ]
        ];

        fsRenamer(pairs).then(() => {
            _.each(pairs, ([ oldfile, newfile ]) => assertFile.moved(oldfile, newfile));
            done();
        });
    });

    it('does not error on empty array', (done) => {
        fsRenamer([]).then(done);
    });

    it('returns error if source does not exist', (done) => {
        const pairs = [
            [ 'this-file-doesnt-exist', 'foobarbaz' ]
        ];

        fsRenamer(pairs)
            .then(() => {
                assert(false, 'Should not return')
            })
            .catch((err) => {
                assert(err, 'Should return an error');
                done();
            })
    });

    // what should it do if we have same destination filename in there multiple times?
});
