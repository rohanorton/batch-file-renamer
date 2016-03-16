import { map, curry, flow } from 'lodash/fp';

const promiseMap = curry((fn, list) =>
    Promise.all(map(fn, list)));

export default promiseMap;
