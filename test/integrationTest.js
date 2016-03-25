/*globals it, describe, beforeEach, afterEach */
import mock from 'mock-fs';
import _ from 'lodash';
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import batchFileRenamer from '../src/batchFileRenamer';
import assertFsResembles from 'assert-fs-resembles';
chai.use(chaiAsPromised);

// ensure no logging in test:
import logger from '../src/logger';
logger.init({ level: 'silent' });

const upperCaseRule = (filename) => filename.toUpperCase();

const testDirectory = {
    testfile1: 'content of testfile1',
    testfile2: 'content of testfile2',
    testfile3: 'content of testfile3'
};

describe('batchFileRenamer', () => {
    beforeEach(() => {
        mock(testDirectory);
    });

    afterEach(() => {
        mock.restore()
    });


    it('can rename a single file using basic rule', () => {
        const promise = batchFileRenamer({
            rule: () => 'TEST_FILE_ONE',
            argv: [ 'testfile1' ]
        });
        return promise.then(() => assertFsResembles({
            TEST_FILE_ONE: 'content of testfile1',
            testfile2: 'content of testfile2',
            testfile3: 'content of testfile3'
        }));
    });

    it('is able to rename files to new filenames based on rule', () => {
        const promise = batchFileRenamer({
            rule: upperCaseRule,
            argv: [ 'testfile1', 'testfile2', 'testfile3' ]
        });
        return promise.then(() => assertFsResembles({
            TESTFILE1: 'content of testfile1',
            TESTFILE2: 'content of testfile2',
            TESTFILE3: 'content of testfile3'
        }));
    });

    it('is able to use async rule', () => {
        const asyncUpperCaseRule = (file, options, callback) => _.defer(callback, null, _.replace(file, 'test', 'LOVELY'))
        const promise = batchFileRenamer({
            rule: asyncUpperCaseRule,
            argv: [ 'testfile1', 'testfile2', 'testfile3' ]
        });
        return promise.then(() => assertFsResembles({
            LOVELYfile1: 'content of testfile1',
            LOVELYfile2: 'content of testfile2',
            LOVELYfile3: 'content of testfile3'
        }));
    })

    it('is able to use promise rule', () => {
        const promiseRule = (file, options) => {
            return new Promise((resolve, reject) => {
                try {
                    _.defer(resolve, _.replace(file, 'test', 'ADORBZ'));
                } catch (e) {
                    reject(e);
                }
            });
        };
        const promise = batchFileRenamer({
            rule: promiseRule,
            argv: [ 'testfile1', 'testfile2', 'testfile3' ]
        });
        return promise.then(() => assertFsResembles({
            ADORBZfile1: 'content of testfile1',
            ADORBZfile2: 'content of testfile2',
            ADORBZfile3: 'content of testfile3'
        }));
    });

    it('moves existing files', () => {
        const promise = batchFileRenamer({
            rule: upperCaseRule,
            argv: [ 'testfile1', 'testfile2', 'this-file-does-not-exist'  ]
        });
        return promise.then(() => assertFsResembles({
            TESTFILE1: 'content of testfile1',
            TESTFILE2: 'content of testfile2',
            testfile3: 'content of testfile3'
        }));
    });

    it('creates new directories', function () {
        const promise = batchFileRenamer({
            rule: (filename) => `foo/bar/${filename}`,
            argv: [ 'testfile1', 'testfile2' ]
        });
        return promise.then(() => assertFsResembles({
            foo: {
                bar: {
                    testfile1: 'content of testfile1',
                    testfile2: 'content of testfile2',
                }
            },
            testfile3: 'content of testfile3'
        }));
    });

    it('does not overwrite existing file', () => {
        const promise = batchFileRenamer({
            rule: () => 'testfile2',
            argv: [ 'testfile1' ]
        });
        return promise.then(() => assertFsResembles(testDirectory));
    });

    it('can do cyclical rename', () => {
        const existing = [ 'testfile1', 'testfile2', 'testfile3' ]
        const expected = [ 'testfile2', 'testfile3', 'testfile1' ]
        const rule = (old) => {
            const i = existing.indexOf(old);
            return expected[i];
        };
        const promise = batchFileRenamer({
            rule,
            argv: existing
        });
        return promise.then(() => assertFsResembles({
            testfile1: 'content of testfile3',
            testfile2: 'content of testfile1',
            testfile3: 'content of testfile2',
        }));
    });

    it('does not remove tmp directory if it already exists', () => {
        // set up new mock filesystem with already existing .tmp directory
        mock({
            testfile1: 'content of testfile1',
            '.tmp': {
                someone_elses_file: 'blah'
            }
        })
        const promise = batchFileRenamer({
            rule: upperCaseRule,
            argv: [ 'testfile1' ]
        });
        return promise.then(() => assertFsResembles({
            TESTFILE1: 'content of testfile1',
            '.tmp': {
                someone_elses_file: 'blah'
            }
        }));
    })

    it('throws error if duplicate destinations', () => {
        const promise = batchFileRenamer({
            rule: () => 'same', // all filenames => 'same'
            argv: [
                'testfile1', 'testfile2', 'testfile3'
            ]
        });
        return assert.isRejected(promise, /Duplicate/);
    });

    describe('--error-on-missing', () => {

        it('renames files if all exist and error-on-missing-files flag passed', () => {
            const promise = batchFileRenamer({
                rule: upperCaseRule,
                argv: [
                    '--error-on-missing',
                    'testfile1', 'testfile2', 'testfile3'
                ]
            });
            return promise.then(() => assertFsResembles({
                TESTFILE1: 'content of testfile1',
                TESTFILE2: 'content of testfile2',
                TESTFILE3: 'content of testfile3'
            }));
        });

        it('throws error if src file does not exist and error-on-missing-files flag passed', () => {
            const promise = batchFileRenamer({
                rule: upperCaseRule,
                argv: [
                    '--error-on-missing',
                    'testfile1', 'testfile2', 'this-file-does-not-exist'
                ]
            });
            return assert.isRejected(promise, /ENOENT/);
        });

        it('does not move any files if file does not exist and error-on-missing-files flag passed', function () {
            const promise = batchFileRenamer({
                rule: upperCaseRule,
                argv: [
                    '--error-on-missing',
                    'testfile1', 'testfile2', 'this-file-does-not-exist'
                ]
            });
            return promise.catch(err => assertFsResembles(testDirectory));
        });
    });

    describe('--force', () => {

        it('overwrites existing file if passed force flag', () => {
            const promise = batchFileRenamer({
                rule: () => 'testfile2',
                    argv: [ '--force', 'testfile1' ]
            });
            return promise.then(() => assertFsResembles({
                testfile2: 'content of testfile1',
                testfile3: 'content of testfile3'
            }));
        });

        it('overwrites existing file if passed force flag alias', () => {
            const promise = batchFileRenamer({
                rule: () => 'testfile2',
                    argv: [ '-f', 'testfile1' ]
            });
            return promise.then(() => assertFsResembles({
                testfile2: 'content of testfile1',
                testfile3: 'content of testfile3'
            }));
        });
    });

    describe('--backup', () => {
        it('creates backup when passed backup flag', () => {
            const flags = [ '--backup' ];
            const promise = batchFileRenamer({
                rule: upperCaseRule,
                argv: [ '--backup', 'testfile1' ]
            });
            return promise.then(() => assertFsResembles({
                'testfile1.bak': 'content of testfile1',
                TESTFILE1: 'content of testfile1',
                testfile2: 'content of testfile2',
                testfile3: 'content of testfile3'
            }));
        });
    });

    describe('--recursive flag', () => {
        it('renames files and directory', () => {
            mock({
                myfiles: {
                    testfile1: 'content of testfile1',
                    testfile2: 'content of testfile2'
                }
            })
            const promise = batchFileRenamer({
                rule: upperCaseRule,
                argv: [ '--recursive', 'myfiles' ]
            });
            return promise.then(() => assertFsResembles({
                myfiles: {},
                MYFILES: {
                    TESTFILE1: 'content of testfile1',
                    TESTFILE2: 'content of testfile2'
                }
            }));
        })

    });

});
