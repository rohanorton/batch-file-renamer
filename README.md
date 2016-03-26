Batch File Renamer
==================

A module to make writing node.js commandline applications that rename files
easier to write.

Basic Example
-------------

To create a trivial application using Batch-File-Renamer:

```js
#!/usr/bin/env node
// lowercaser.js

var batchFileRenamer = require('batch-file-renamer');

batchFileRenamer({
    rule: function (filename) {
        return filename.toLowerCase()
    }
});
```

Can then be used as follows:

```sh
$ ls
FileName01.TXT fileNAME02.txt FiLeNaMe.TxT

$ ./lowercaser.js *

$ ls
filename01.txt filename02.txt filename.txt
```

To prevent a file from being renamed, you can simply have the rule return null
and it won't rename that file.

Rules can be synchronous, node callbacks, or promises.

CLI Options
-----------

It is possible to pass in CLI Options to batch renamer for extending the
commandline flags it accepts:

```js
// example.js
batchFileRenamer({
    rule: rule,
    cliOptions: {
        options: {
            foo: { alias: 'F', description: 'Are you foo or not?', type: 'boolean' }
        }
    }
})
```

And we can see this in the help generated.

```sh
$ ./example.js -h
Options:
  --foo, -F           Are you foo or not?                              [boolean]
  --colour            Colour logging                   [boolean] [default: true]
  --verbose, -v       Verbose logging                                  [boolean]
  --quiet             Only log errors                                  [boolean]
  --silent            No logging                                       [boolean]
  --force, -f         Overwrite existing files                         [boolean]
  --recursive, -r     Name files in directory recursively              [boolean]
  --interactive, -i   Prompt for file change                           [boolean]
  --backup            Create backup of file                            [boolean]
  --error-on-missing  Fail if any source file missing                  [boolean]
  --version, -V       Show version number                              [boolean]
  --help, -h          Show help                                        [boolean]
```

Uses [yargs](https://github.com/yargs/yargs) in the back, so you should be able
to pass anything you would pass to yargs.options method.

Pre/Post/onError Commands
-------------------------

Add pre, post and onError hooks. Post hook only runs on successful
renaming.

```js
// example.js
batchFileRenamer({
    pre: function () {
        db.openConnection();
    },
    rule: rule,
    post: function () {
        db.closeConnection();
    },
    onError: function () {
        db.closeConnection();
    }
})
```

The pre and post options may be async (promises or callback), whilst the onError
command is synchronous.

Logging
-------

You could just log to stdout using console.log, however this won't respond to
the provided verbose, silent, quiet and (hidden) DEBUG flags. A useful logger is
provided.

```js
var batchFileRenamer = require('batch-file-renamer');
var logger = batchFileRenamer.logger;

batchFileRenamer({
    pre: function () {
        logger.debug('The application is starting');
        logger.log('Welcome to this amazing application!');
    },
    rule: function (filename) {
        filename = filename.toLowerCase();
        if (filename.length > 100)  {
            logger.warn('That is a long filename');
        }
        if (filename === 'never_gonna_give_you_up') {
            logger.error('Rickrolled');
        }
        return filename;
    }
})
```

The logger commands can only be used inside the batch-file-renamer process, as
they are initialised according to verbosity variables.

By default, warnings and errors are shown, whereas logs are only shown in verbose
mode.

Duplicate Destination Handling
------------------------------

By default the application will throw an error if duplicate destinations are
provided, however it is also possible to provide a duplicate destination
resolver.

This is an example of how you might use it:

```js
var incrementers = {};

batchFileRenamer({
    rule: rule,
    duplicationResolver: function (duplicateDests, srcDestPairs) {
        return srcDestPairs.map(function (pair) {
            var src = pair[0];
            var dest = pair[1];
            var i;
            if (duplicateDests.indexOf(dest) !== -1) {
                if (!incrementers[dest]) {
                    incrementers[dest] = 0;
                } else {
                    incrementers[dest] += 1;
                }
                i = incrementers[dest];
                dest = dest + i;
            }
            return [src, dest];
        })
    }
})
```

Bare in mind that further duplication checks are not run after this function.

Custom Error Messages
---------------------

If you throw an error (or return error in promise / node callback) it gets
handled by batch-file-renamer's error handler. You can provide your own message
simply by throwing an error with your own message.

Also, if you want to provide custom error messages for system errors, you can
add them like so:

```js
batchFileRenamer({
    rule: rule,
    errorMessages: {
        ENOMEM: 'Sorry to mention it, but you are out of memory'
    }
})
```

This relies on the error.code being ENOMEM.
