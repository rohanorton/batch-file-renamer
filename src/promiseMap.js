import { map } from 'lodash';

const promiseMap = (list, fn) =>
    Promise.all(map(list, fn));

export default promiseMap;
