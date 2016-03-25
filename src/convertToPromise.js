import hasCallback from 'has-callback';
import promisify from 'es6-promisify';

const noop = () => null;

const convertToPromise = (fn) => {
    if (!fn) {
       fn = noop;
    }
    return hasCallback(fn) ? promisify(fn) : fn;
}

export default convertToPromise;
