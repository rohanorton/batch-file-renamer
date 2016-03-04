/*globals describe, it */
import assert from 'assert';
import renamerArgsBuilder from '../src/renamerArgsBuilder';

describe('renamerArgsBuilder', () => {
    it('zips together argument arrays', () => {
        const actual = renamerArgsBuilder([ 'old1', 'old2', 'old3' ], [ 'new1', 'new2', 'new3']);
        const expected = [ [ 'old1', 'new1' ], [ 'old2', 'new2' ], [ 'old3', 'new3' ] ];
        assert.deepEqual(actual, expected);
    });

    it('removes duplication in pairs', () => {
        const actual = renamerArgsBuilder([ 'old1', 'old2', 'old3' ], [ 'old1', 'old2', 'new3']);
        const expected = [ [ 'old3', 'new3' ] ];
        assert.deepEqual(actual, expected);
    });

    it('removes duplicate elements', () => {
        const actual = renamerArgsBuilder([ 'old1', 'old1', 'old1' ], [ 'new1', 'new1', 'new1']);
        const expected = [ [ 'old1', 'new1' ] ];
        assert.deepEqual(actual, expected);
    });

    it('removes pairs where an element is not a string', () => {
        const actual = renamerArgsBuilder([ 'old1', [], 'old3', null ], [ 'new1', 'new2', 3, 'new4']);
        const expected = [ [ 'old1', 'new1' ] ];
        assert.deepEqual(actual, expected);
    });

    it('removes pairs where an element is an empty string', () => {
        const actual = renamerArgsBuilder([ 'old1', '', 'old3', 'old4' ], [ 'new1', 'new2', '', 'new4']);
        const expected = [ [ 'old1', 'new1' ], [ 'old4', 'new4'] ];
        assert.deepEqual(actual, expected);
    });

    // Asserts:
    it('throws error if source array unspecified', () => {
        const fn = () => renamerArgsBuilder(null, [ 'new1' ]);
        assert.throws(fn, /sources/i);
    });

    it('throws error if destination array unspecified', () => {
        const fn = () => renamerArgsBuilder([ 'old1' ]);
        assert.throws(fn, /destination/i);
    });

    it('throws error if array lengths mismatched', () => {
        const fn = () => renamerArgsBuilder([ 'old1', 'old2', 'old3' ], [ 'new1' ]);
        assert.throws(fn, /must match/i);
    });
});
