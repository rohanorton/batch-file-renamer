import hasCallback from 'has-callback';
import promisify from 'es6-promisify';

const convertToPromise = (fn) => {
    return hasCallback(fn) ? promisify(fn) : fn;
}

export default convertToPromise;
