/*globals it, describe, beforeEach, afterEach */
import mock from 'mock-fs';
import _ from 'lodash';
import assert from 'assert';
import batchFileRenamer from '../src';
import * as assertFile from './utils/assertFile';

const upperCaseRule = (file) => file.toUpperCase();

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

describe('batchFileRenamer', () => {

    it('should rename a single file using basic rule', (done) => {
        const oldfile = 'testfile1'
        const expected = 'TEST_FILE_ONE'

        batchFileRenamer({
            rule: () => expected,
            argv: [ oldfile ]
        }, (err) => {
            assert(!err, 'Function should not error: ' + err);
            assertFile.moved(oldfile, expected);
            done();
        });
    });

    it('should be able to rename files to new filenames based on rule', (done) => {
        const oldfiles = [ 'testfile1', 'testfile2', 'testfile3' ]
        const expected = [ 'TESTFILE1', 'TESTFILE2', 'TESTFILE3' ]

        batchFileRenamer({
            rule: upperCaseRule,
            argv: oldfiles
        }, (err) => {
            assert(!err, 'Function should not error: ', err)
            _.each(expected, (newfile, i) => assertFile.moved(oldfiles[i], newfile));
            done()
        });
    });

    it('should be able to use async rule', (done) => {
        const oldfiles = [ 'testfile1', 'testfile2', 'testfile3' ]
        const expected = [ 'TESTFILE1', 'TESTFILE2', 'TESTFILE3' ]
        const asyncRule = (file, options, callback) => _.defer(callback, null, file.toUpperCase())

        batchFileRenamer({
            rule: asyncRule,
            argv: oldfiles
        }, (err) => {
            assert(!err, 'Function should not error: ', err)
            _.each(expected, (newfile, i) => assertFile.moved(oldfiles[i], newfile));
            done()
        })
    });

    // Lets be strict about sources by default...
    it('does not move any files if src file does not exist', (done) => {
        const existing = [ 'testfile1', 'testfile2' ];
        const oldfiles = existing.concat([ 'this-file-does-not-exist' ]);
        batchFileRenamer({
            rule: upperCaseRule,
            argv: oldfiles
        }, (err) => {
            assert(err, 'Function should error');
            _.each(existing, (oldfile) => assertFile.unmoved(oldfile));
            done();
        });
    });
});
