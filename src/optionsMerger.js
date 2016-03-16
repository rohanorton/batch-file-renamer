import { cloneDeep } from 'lodash/fp';

// lodash/fp/reduce doesn't have third argument (key)
import convert from 'lodash/fp/convert';
import _ from 'lodash';
const reduce = convert('reduce', _.reduce, { 'cap': false, });

const optionsMerger = (primary = {}, secondary = {}) => {
    primary = cloneDeep(primary);
    secondary = cloneDeep(secondary);

    const result = reduce((memo, val, key) => {
        if (!memo[key]) {
            memo[key] = val;
        }
        return memo;
    }, primary, secondary);

    return result;
}



export default optionsMerger
