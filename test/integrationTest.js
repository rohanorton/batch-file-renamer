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

    it('should rename a single file using basic rule', () => {
        const oldfile = 'testfile1'
        const expected = 'TEST_FILE_ONE'

        return batchFileRenamer({
            rule: () => expected,
            argv: [ oldfile ]
        }).then(() => {
            assertFile.moved(oldfile, expected);
        }).catch(err => {
            assert(!err, 'Function should not error: ' + err);
        });
    });

    it('should be able to rename files to new filenames based on rule', () => {
        const oldfiles = [ 'testfile1', 'testfile2', 'testfile3' ]
        const expected = [ 'TESTFILE1', 'TESTFILE2', 'TESTFILE3' ]

        return batchFileRenamer({
            rule: upperCaseRule,
            argv: oldfiles
        }).then(() => {
            _.each(expected, (newfile, i) => assertFile.moved(oldfiles[i], newfile));
        }).catch(err => {
            assert(!err, 'Function should not error: ', err)
        });
    });

    it('should be able to use async rule', () => {
        const oldfiles = [ 'testfile1', 'testfile2', 'testfile3' ]
        const expected = [ 'TESTFILE1', 'TESTFILE2', 'TESTFILE3' ]
        const asyncRule = (file, options, callback) => _.defer(callback, null, file.toUpperCase())

        return batchFileRenamer({
            rule: asyncRule,
            argv: oldfiles
        }).then(() => {
            _.each(expected, (newfile, i) => assertFile.moved(oldfiles[i], newfile));
        }).catch(err => {
            assert(!err, 'Function should not error: ', err);
        });
    });

    it('moves existing files', () => {
        const existing = [ 'testfile1', 'testfile2' ];
        const expected = [ 'TESTFILE1', 'TESTFILE2' ];
        const oldfiles =[ ...existing, 'this-file-does-not-exist' ];
        return batchFileRenamer({
            rule: upperCaseRule,
            argv: oldfiles
        }).then(() => {
            _.each(expected, (newfile, i) => assertFile.moved(oldfiles[i], newfile));
        }).catch(err => {
            assert(!err, 'Function should not error: ', err);
        });
    });

    it('does not move any files if src file does not exist and error-on-missing-files flag passed', () => {
        const existing = [ 'testfile1', 'testfile2' ];
        const oldfiles = existing.concat([ 'this-file-does-not-exist' ]);
        const flags = [ '--error-on-missing-file' ];
        return batchFileRenamer({
            rule: upperCaseRule,
            argv: [...flags, ...oldfiles]
        }).then(() => {
            throw "Function should not complete";
        }).catch(err => {
            assert(err, 'Function should error');
            _.each(existing, (oldfile) => assertFile.unmoved(oldfile));
        });
    });
});
