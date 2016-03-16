import assert from 'assert';
import mergeOptions from '../src/mergeOptions'

// This entire module is based on unspecified behaviour...
// it requires that object keys are ordered in a particular manner
// which is not specified, but that seems to be the case in v8.
// As a of this reliance on unspecified behaviour, this module
// could break at any time :-/
//
// I guess it's not that important...

describe('mergeOptions', () => {
    it('takes options object and returns options object', () => {
        const options = { foo: 'bar' };
        const actual = mergeOptions(options);
        const expected = options;
        assert.deepEqual(actual, expected);
    });
    it('creates object with first options keys at beginning and last options keys at end', () => {
        const optionsA = { a: 1, b: 2, c: 3 };
        const optionsB = { d: 4, e: 5, f: 6 };
        const actual = mergeOptions(optionsA, optionsB);
        const expected = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });
    it('replaces options', () => {
        const optionsA = { first: 1, second: 2, third: 3 };
        const optionsB = { first: 4, second: 5, third: 6, four: 7, fifth: 8 };
        const actual = mergeOptions(optionsA, optionsB);
        const expected = { first: 1, second: 2, third: 3, four: 7, fifth: 8 };
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });
});
