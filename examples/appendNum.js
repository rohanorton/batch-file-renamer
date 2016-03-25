#!/usr/bin/env node

var batchFileRenamer = require('../');
var logger =  batchFileRenamer.logger;
var path = require('path');

var i = 0;

function numberFile(filename) {
    i += 1;
    var ext = path.extname(filename);
    var basename = path.basename(filename, ext);
    return basename + i + ext;
}

function renameRule(filepath) {
    var dir = path.dirname(filepath);
    var filename = path.basename(filepath);
    var newName = path.join(dir, numberFile(filename));
    return newName;
}

function pre() {
    logger.log('Beginning to number files...');
}

function post() {
    logger.log('File rename completed :D');
}

batchFileRenamer({
    pre: pre,
    rule: renameRule,
    post: post
});
