/*globals it, describe, beforeEach, afterEach */
import mock from 'mock-fs';
import _ from 'lodash';
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import batchFileRenamer from '../src';
import * as assertFile from './utils/assertFile';
chai.use(chaiAsPromised);

const upperCaseRule = (filename) => filename.toUpperCase();

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

    it('can rename a single file using basic rule', () => {
        const oldfile = 'testfile1'
        const expected = 'TEST_FILE_ONE'
        const promise = batchFileRenamer({
            rule: () => expected,
            argv: [ oldfile ]
        });
        return promise.then(() => assertFile.moved(oldfile, expected));
    });

    it('is able to rename files to new filenames based on rule', () => {
        const oldfiles = [ 'testfile1', 'testfile2', 'testfile3' ]
        const expected = [ 'TESTFILE1', 'TESTFILE2', 'TESTFILE3' ]
        const promise = batchFileRenamer({
            rule: upperCaseRule,
            argv: oldfiles
        });
        return promise.then(() =>
            Promise.all(_.map(expected, (newfile, i) => assertFile.moved(oldfiles[i], newfile))));
    });

    it('is able to use async rule', () => {
        const oldfiles = [ 'testfile1', 'testfile2', 'testfile3' ]
        const expected = [ 'TESTFILE1', 'TESTFILE2', 'TESTFILE3' ]
        const asyncRule = (file, options, callback) => _.defer(callback, null, file.toUpperCase())
        const promise = batchFileRenamer({
            rule: asyncRule,
            argv: oldfiles
        });
        return promise.then(() =>
            Promise.all(_.map(expected, (newfile, i) => assertFile.moved(oldfiles[i], newfile))));
    });

    it('moves existing files', () => {
        const existing = [ 'testfile1', 'testfile2' ];
        const expected = [ 'TESTFILE1', 'TESTFILE2' ];
        const oldfiles =[ ...existing, 'this-file-does-not-exist' ];
        const promise = batchFileRenamer({
            rule: upperCaseRule,
            argv: oldfiles
        });
        return promise.then(() =>
            Promise.all(_.map(expected, (newfile, i) => assertFile.moved(oldfiles[i], newfile))));
    });

    it('throws error if src file does not exist and error-on-missing-files flag passed', () => {
        const existing = [ 'testfile1', 'testfile2' ];
        const oldfiles = existing.concat([ 'this-file-does-not-exist' ]);
        const flags = [ '--error-on-missing-file' ];
        const promise = batchFileRenamer({
            rule: upperCaseRule,
            argv: [...flags, ...oldfiles]
        });
        return assert.isRejected(promise);
    });
    it('does not move any files if file does not exist and error-on-missing-files flag passed', function () {
        const existing = [ 'testfile1', 'testfile2' ];
        const oldfiles = existing.concat([ 'this-file-does-not-exist' ]);
        const flags = [ '--error-on-missing-file' ];
        const promise = batchFileRenamer({
            rule: upperCaseRule,
            argv: [...flags, ...oldfiles]
        });
        return promise.catch(err =>
             Promise.all(_.map(existing, (oldfile) => assertFile.unmoved(oldfile))));
    });
    it('creates new directories', function () {
        const existing = [ 'testfile1', 'testfile2' ];
        const expected = [ 'foo/bar/testfile1', 'foo/bar/testfile2' ];
        const rule = (filename) => `foo/bar/${filename}`;
        const promise = batchFileRenamer({
            rule: rule,
            argv: existing
        });
        return promise.then(() =>
             Promise.all(_.map(existing, (oldfile, i) => assertFile.moved(oldfile, expected[i]))));
    });
    it('does not overwrite existing file', () => {
        const existing = [ 'testfile1' ];
        const promise = batchFileRenamer({
            rule: () => 'testfile2',
            argv: existing
        });
        return promise.then(() =>
             Promise.all(_.map(existing, (oldfile) => assertFile.unmoved(oldfile))));
    });

    it('overwrites existing file if passed force flag', () => {
        const existing = [ 'testfile1' ];
        const expected = 'testfile2';
        const flags = [ '--force' ];
        const promise = batchFileRenamer({
            rule: () => expected,
            argv: [ ...flags, ...existing ]
        });
        return promise.then(() =>
             Promise.all(_.map(existing, (oldfile, i) => assertFile.moved(oldfile, expected))));
    });
});
