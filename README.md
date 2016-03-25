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

