/*globals it, describe, beforeEach, afterEach */
import mock from 'mock-fs';
import _ from 'lodash';
import assertFsResembles from './utils/fsResembles';
import mockPrompter from './utils/mockPrompter';
import fsRenamer  from '../src/fsRenamer';
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
});

afterEach(() => {
    fsRenamer.resetDependencies();
    mock.restore()
});

describe('fsRenamer', () => {
    it('takes array of src/dest pairs and moves files', () => {
        const pairs = [
            [ 'testfile1', 'foobarbaz' ],
            [ 'testfile2', 'bazbarfoo' ]
        ];
        const promise = fsRenamer(pairs);
        return promise.then(() => assertFsResembles({
            foobarbaz: 'content of testfile1',
            bazbarfoo: 'content of testfile2',
            testfile3: 'content of testfile3'
        }));
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

    it('can create new directories', () => {
        const pairs = [
            [ 'testfile1', 'foo/bar/testfile1' ]
        ];
        const promise = fsRenamer(pairs);
        return promise.then(() => assertFsResembles({
            foo: {
                bar: {
                    testfile1: 'content of testfile1',
                }
            },
            testfile2: 'content of testfile2',
            testfile3: 'content of testfile3'
        }));
    });

    it('does not overwrite existing file', () => {
        const pairs = [
            [ 'testfile1', 'testfile2' ]
        ];
        const promise = fsRenamer(pairs);
        return promise.then(() => assertFsResembles(testDirectory));
    });

    it('overwrites existing file if passed force flag', () => {
        const pairs = [
            [ 'testfile1', 'testfile2' ]
        ];
        const promise = fsRenamer(pairs, { force: true });
        return promise.then(() => assertFsResembles({
            testfile2: 'content of testfile1',
            testfile3: 'content of testfile3'
        }));
    });

    it('creates backup when passed backup flag', () => {
        const oldfile = 'testfile1';
        const backup = oldfile + '.bak';
        const newfile = 'asdf';
        const pairs = [
            [ oldfile, newfile ]
        ];
        const promise = fsRenamer(pairs, { backup: true });
        return promise.then(() => assertFsResembles({
            'testfile1.bak': 'content of testfile1',
            asdf: 'content of testfile1',
            testfile2: 'content of testfile2',
            testfile3: 'content of testfile3'
        }));
    });

    it('can perform cyclical rename', () => {
        const pairs = [
            [ 'testfile1', 'testfile2' ],
            [ 'testfile2', 'testfile3' ],
            [ 'testfile3', 'testfile1' ]
        ];
        const promise = fsRenamer(pairs);
        return promise.then(() => assertFsResembles({
            testfile1: 'content of testfile3',
            testfile2: 'content of testfile1',
            testfile3: 'content of testfile2'
        }));
    });

    it('prompts for to rename files if passed interactive flag', () => {
        const pairs = [
            [ 'testfile1', 'renamed' ],
            [ 'testfile2', 'notrenamed' ],
            [ 'testfile3', 'alsorenamed' ]
        ];
        const options = { interactive: true };
        // use dependency injection to simulate keypress prompt library:
        fsRenamer.inject(mockPrompter('y', 'n', 'y'));
        const promise = fsRenamer(pairs, options);
        return promise.then(() => assertFsResembles({
            renamed: 'content of testfile1',
            testfile2: 'content of testfile2',
            alsorenamed: 'content of testfile3'
        }));
    });
});
