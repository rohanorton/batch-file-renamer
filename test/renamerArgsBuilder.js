/*globals describe, it */
import assert from 'assert';
import renamerArgsBuilder from '../src/renamerArgsBuilder.js';

describe('renamerArgsBuilder', () => {
    it('zips together argument arrays', () => {
        let actual = renamerArgsBuilder([ 'old1', 'old2', 'old3' ], [ 'new1', 'new2', 'new3']);
        let expected = [ [ 'old1', 'new1' ], [ 'old2', 'new2' ], [ 'old3', 'new3' ] ];
        assert.deepEqual(actual, expected);
    });
    it('removes duplication in pairs', () => {
        let actual = renamerArgsBuilder([ 'old1', 'old2', 'old3' ], [ 'old1', 'old2', 'new3']);
        let expected = [ [ 'old3', 'new3' ] ];
        assert.deepEqual(actual, expected);
    });
    it('removes duplicate elements', () => {
        let actual = renamerArgsBuilder([ 'old1', 'old1', 'old1' ], [ 'new1', 'new1', 'new1']);
        let expected = [ [ 'old1', 'new1' ] ];
        assert.deepEqual(actual, expected);
    });

    // Errors:
    it('throws error if array lengths mismatched', () => {
        let fn = () => renamerArgsBuilder([ 'old1', 'old2', 'old3' ], [ 'new1' ])
        assert.throws(fn, 'Array Length Mismatch Error');
    });
});
