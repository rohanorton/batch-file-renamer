import batchFileRenamer from './batchFileRenamer';
import errorHandler from './errorHandler';

export default (args) =>
    batchFileRenamer(args).catch(errorHandler(args));
