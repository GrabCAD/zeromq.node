// Copy over stashed/prebuilt zmq.node binary [from prebuilt/.../ -> to build/Release/]

'use strict';

let fsExtra = require('fs-extra');
let child_process = require('child_process');
let path = require('path');

let targ = process.argv[2];

if (! (targ && targ.match(/^(iojs|electron)$/))) {
    console.error('Bad target: ' + targ);
    process.exit(1);
}

let mainDir = path.resolve('build', 'Release');
let stashDir = path.resolve(__dirname, targ, process.platform, process.arch, 'Release');

if (! fsExtra.existsSync(stashDir)) {
    console.error('No prebuilt binaries exists in ' + stashDir + '.  Use "npm run stash_electron" to generate them.');
    process.exit(1);
}

console.log('Installing compilation ' + stashDir + ' -> ' + mainDir);
fsExtra.removeSync(mainDir);
fsExtra.copySync(stashDir, mainDir);
