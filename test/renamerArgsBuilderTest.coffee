assert = require('assert')
renamerArgsBuilder = require('../src/renamerArgsBuilder').default

describe 'renamerArgsBuilder', ->

    it 'zips together argument arrays', ->
        actual = renamerArgsBuilder([ 'old1', 'old2', 'old3' ], [ 'new1', 'new2', 'new3'])
        expected = [ [ 'old1', 'new1' ], [ 'old2', 'new2' ], [ 'old3', 'new3' ] ]
        assert.deepEqual(actual, expected)

    it 'removes duplication in pairs', ->
        actual = renamerArgsBuilder([ 'old1', 'old2', 'old3' ], [ 'old1', 'old2', 'new3'])
        expected = [ [ 'old3', 'new3' ] ]
        assert.deepEqual(actual, expected)

    it 'removes duplicate elements', ->
        actual = renamerArgsBuilder([ 'old1', 'old1', 'old1' ], [ 'new1', 'new1', 'new1'])
        expected = [ [ 'old1', 'new1' ] ]
        assert.deepEqual(actual, expected)

    # Asserts:
    it 'throws error if source array unspecified', ->
        fn = -> renamerArgsBuilder()
        assert.throws(fn, /sources/i)

    it 'throws error if destination array unspecified', ->
        fn = -> renamerArgsBuilder([ 'old1' ])
        assert.throws(fn, /destination/i)

    it 'throws error if array lengths mismatched', ->
        fn = -> renamerArgsBuilder([ 'old1', 'old2', 'old3' ], [ 'new1' ])
        assert.throws(fn, /must match/i)
