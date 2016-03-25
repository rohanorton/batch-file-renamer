// because otherwise i am broken:
require('babel-polyfill');

// requiring es6 modules is a bit gross:
var batchFileRenamer = require('./lib/batchFileRenamer').default;
var handleError = require('./lib/handleError').default;
var logger = require('./lib/logger').default;

// now back to business as usual:
function init(args) {
    batchFileRenamer(args)
        .then(() => process.exit())
        .catch(handleError(args));
}

init.logger = logger;

module.exports = init;
