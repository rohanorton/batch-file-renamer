import { clone, reduce } from 'lodash';

const optionsMerger = (primary = {}, secondary = {}) => {
    primary = clone(primary);
    secondary = clone(secondary);

    const result = reduce(secondary, (memo, val, key) => {
        if (!memo[key]) {
            memo[key] = val;
        }
        return memo;
    }, primary);

    return result;
}



export default optionsMerger
