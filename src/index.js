import batchFileRenamer from './batchFileRenamer';
import handleError from './handlerError';

export default (args) =>
    batchFileRenamer(args)
        .then(() => process.exit())
        .catch(handleError(args));
