import sinon from 'sinon';
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import handleDuplicates from '../src/handleDuplicates';

describe('handleDuplicates', () => {
    it('returns list if no duplicates', () => {
        const promise = handleDuplicates([ [ 'a', 'b' ], [ 'c', 'd' ] ]);
        return assert.becomes(promise, [ [ 'a', 'b' ], [ 'c', 'd' ] ]);
    });

    it('throws error if duplicates and no resolver provided', () => {
        const promise = handleDuplicates([ [ 'a', 'b' ], [ 'c', 'b' ] ]);
        return assert.isRejected(promise, /Duplicate/);
    });

    it('does not call resolver if no duplicates', () => {
        const spy = sinon.spy();
        handleDuplicates([ [ 'a', 'b' ], [ 'c', 'd' ] ], spy);
        assert(!spy.called, 'Resolver function was invoked');
    });

    it('uses resolver to handle renaming issues', () => {
        const resolver = (duplicates, pairs) => {
            let i = 0;
            return pairs.map(([src, dest]) => [src, duplicates.includes(dest) ? dest + i++ : dest ]);
        }
        const promise = handleDuplicates([ [ 'a', 'b' ], [ 'c', 'b' ] ], resolver);
        return assert.becomes(promise, [ [ 'a', 'b0' ], [ 'c', 'b1' ] ]);
    });

    it('can use promise for resolver', () => {
        const resolver = (duplicates, pairs) => new Promise((resolve, reject) => {
            let i = 0;
            const resolved =  pairs.map(([src, dest]) => [src, duplicates.includes(dest) ? dest + i++ : dest ]);
            resolve(resolved);
        });
        const promise = handleDuplicates([ [ 'a', 'b' ], [ 'c', 'b' ] ], resolver);
        return assert.becomes(promise, [ [ 'a', 'b0' ], [ 'c', 'b1' ] ]);
    });

    it('can use callback for resolver', () => {
        const resolver = (duplicates, pairs, callback) => {
            let i = 0;
            const resolved =  pairs.map(([src, dest]) => [src, duplicates.includes(dest) ? dest + i++ : dest ]);
            callback(null, resolved);
        };
        const promise = handleDuplicates([ [ 'a', 'b' ], [ 'c', 'b' ] ], resolver);
        return assert.becomes(promise, [ [ 'a', 'b0' ], [ 'c', 'b1' ] ]);
    });
});
