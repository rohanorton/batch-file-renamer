import batchFileRenamer from './batchFileRenamer';
import errorHandler from './errorHandler';

export default (args) =>
    batchFileRenamer(args)
        .then(() => process.exit())
        .catch(errorHandler(args));
