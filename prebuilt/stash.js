// Prebuild + stash/archive away zmq.node binary [for iojs/electron] into prebuilt/{iojs,electron}/{win32,darwin}/x64/Release/
//
// This should be done whenever any of following occurs:
// -    we upgrade Electron
// -    we upgrade iojs
// -    we support a new OS and/or architecture
//
// You will need to run this on every OS etc and commit the results in prebuilt/.
//
// Note: Must be run as "npm run stash_electron" so that "node_modules/.bin/" is in $PATH

'use strict';

let fsExtra = require('fs-extra');
let child_process = require('child_process');
let path = require('path');
let _ = require('lodash');

let targ = process.argv[2];

if (! (targ && targ.match(/^(iojs|electron)$/))) {
    console.error('Bad target: ' + targ);
    process.exit(1);
}

let mainDir = path.resolve('build', 'Release');
let stashDir = path.resolve(__dirname, targ, process.platform, process.arch, 'Release');

// Compile zmq.node binary
console.log('Compiling ' + mainDir);
if (targ === 'electron') {
    // Compile against node/iojs headers bundled with specific version of Electron.
    //
    // Note: Cannot use vanilla "npm install" / "node-gyp" because the
    // node/iojs version used by npm/node-gyp vs Electron usually does *not*
    // match ... so the resulting the zmq.node won't link correctly within the
    // Electron executable.

    // Version of Electron for eagle-desktop
    const electronVer = '1.2.2';

    // Where to put header files [instead of $HOME/.node-gyp/]
    const nodeGypHome = path.resolve(__dirname, '..', 'node_modules', 'electron-rebuild', 'lib', 'headers');

    // Download the Electron specific header files [into <nodeGypHome>/0.25.3/].
    // This will also recompile node_modules/**/*.node files.
    // Internally, "electron-rebuild" will do something like:
    //      HOME=<nodeGypHome> node-gyp install --target=0.25.3 --arch=x64 --dist-url=https://gh-contractor-zcbenz.s3.amazonaws.com/atom-shell/dist
    //      npm rebuild --target=0.25.3 --arch=x64
    child_process.execSync('electron-rebuild -v ' + electronVer + ' -m .');

    // Compile zmq.node binary against just d/l header files.
    // This extra step is needed to work around "electron-rebuild" limitations.
    //
    // Unfortunately, zmq.node is *not* in node_modules/ ... so it won't be
    // touched by "electron-rebuild".   Manual workaround could be to:
    //  1. Create new module (e.g., "eagle-service-client-node")
    //  2. Make new module depend on this zeromq module + electron-rebuild
    //  3. Run "electron-rebuild" from new module
    //
    // To avoid this, we'll do a nasty hack and redo parts of "electron-rebuild"
    // ... widening its scope to include current directory.
    //
    // Note: The extra $HOME is a known hack to change where header files get d/l to.
    // re: https://github.com/TooTallNate/node-gyp/blob/2.0.2/lib/node-gyp.js#L52 node_modules/node-gyp/lib/node-gyp.js
    // re: https://github.com/electronjs/electron-rebuild/blob/v0.2.5/src/main.js#L25
    // re: https://github.com/TooTallNate/node-gyp/issues/21
    let env = _.merge({}, process.env, { 'HOME': nodeGypHome });
    child_process.execSync('node-gyp rebuild --target=' + electronVer + ' --arch=' + process.arch, { env: env });
} else {
    // Compile for node/iojs
    child_process.execSync('node-gyp rebuild');
}

// Stash/archive the binary
console.log('Stashing compilation ' + mainDir + ' -> ' + stashDir);
fsExtra.removeSync(stashDir);
fsExtra.copySync(mainDir, stashDir);
