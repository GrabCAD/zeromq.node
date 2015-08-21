[![Build Status](https://travis-ci.org/JustinTulloss/zeromq.node.png)](https://travis-ci.org/JustinTulloss/zeromq.node)

# node-zeromq

  [ØMQ](http://www.zeromq.org/) bindings for node.js.

## Eagle Notes

Clarifications needed that are specific to Eagle.

*	This repo is a fork of the original project.  Among the changes include:

	*	Precompiled binaries [of `zmq.node`]
	*	Force x64 binaries to be created when on Windows

*	As of 8/2015, the NPM module's native library (i.e., `zmq.node`) is now precompiled.
	If you want to force a recompile, run `npm run stash_electron` or `npm run stash_iojs`.
	To take out the precompile step completely, drop the `scripts { install : ... }` entry from `package.json`.
	NPM will call `node-gyp` automatically when it sees `bindings.gyp`.

*	`zmq.node` is merely a bridge from Node to actual ZeroMQ library.  There are several ways to getting the actual ZeroMQ library.

	*	On Windows, you don't need to do anything as it's already part of this repo (e.g., `windows/lib/x86/libzmq-v100-mt-3_2_2.dll` etc).
		The original text (later in this doc) says `First make sure ZeroMQ is installed` but this has since been
		[corrected on the original repo](https://github.com/JustinTulloss/zeromq.node/blob/094c29b184c91dea4147e0b1813610f4de76eb99/README.md#on-windows).
	*	On Mac

		1.	Install using Homebrew: `brew install homebrew/versions/zeromq`
		2.	Let pkg-config know about the library: `export PKG_CONFIG_PATH=/usr/local/Cellar/zeromq/<VERSION>/lib/pkgconfig/`
			where `<VERSION>` may be 4.0.4, 4.0.5_2, etc.
			If you did this correctly, `pkg-config --cflags --libs libzmq` should work.
		3.	Make sure pkg-config setup also applies to sudo context
		
			*	`sudo visudo`
			*	Insert `Defaults env_keep += "PKG_CONFIG_PATH"`

## Installation

First make sure [ZeroMQ is installed](http://www.zeromq.org/intro:get-the-software).
This module is compatible with ZeroMQ versions 2, 3 and 4. The installation
process varies by platform, but headers are mandatory. Most Linux distributions
provide these headers with `-devel` packages like `zeromq-devel` or
`zeromq3-devel`. Homebrew for OS X provides versions 4 and 3 with packages
`zeromq` and `zeromq3`, respectively. A
[Chris Lea PPA](https://launchpad.net/~chris-lea/+archive/ubuntu/zeromq)
is available for Debian-like users who want a version newer than currently
provided by their distribution. Windows is supported but not actively
maintained.

Note: For zap support with versions >=4 you need to have libzmq built and linked
against libsodium. Check the Travis configuration for a list of what is tested
and therefore known to work.

With ZeroMQ headers installed, you can install and use this module:

    $ npm install zmq

## Examples

### Push/Pull

```js
// producer.js
var zmq = require('zmq')
  , sock = zmq.socket('push');

sock.bindSync('tcp://127.0.0.1:3000');
console.log('Producer bound to port 3000');

setInterval(function(){
  console.log('sending work');
  sock.send('some work');
}, 500);
```

```js
// worker.js
var zmq = require('zmq')
  , sock = zmq.socket('pull');

sock.connect('tcp://127.0.0.1:3000');
console.log('Worker connected to port 3000');

sock.on('message', function(msg){
  console.log('work: %s', msg.toString());
});
```

### Pub/Sub

```js
// pubber.js
var zmq = require('zmq')
  , sock = zmq.socket('pub');

sock.bindSync('tcp://127.0.0.1:3000');
console.log('Publisher bound to port 3000');

setInterval(function(){
  console.log('sending a multipart message envelope');
  sock.send(['kitty cats', 'meow!']);
}, 500);
```

```js
// subber.js
var zmq = require('zmq')
  , sock = zmq.socket('sub');

sock.connect('tcp://127.0.0.1:3000');
sock.subscribe('kitty cats');
console.log('Subscriber connected to port 3000');

sock.on('message', function(topic, message) {
  console.log('received a message related to:', topic, 'containing message:', message);
});
```

## Running tests

  Install dev deps:

     $ npm install

  Build:

     $ make

  Test:

     $ make test

## Running benchmarks

Benchmarks are available in the `perf` directory, and have been implemented
according to the zmq documentation:
[How to run performance tests](http://www.zeromq.org/results:perf-howto)

In the following examples, the arguments are respectively:
- the host to connect to/bind on
- message size (in bytes)
- message count

You can run a latency benchmark by running these two commands in two separate
shells:

```sh
node ./local_lat.js tcp://127.0.0.1:5555 1 100000
```

```sh
node ./remote_lat.js tcp://127.0.0.1:5555 1 100000
```

And you can run throughput tests by running these two commands in two
separate shells:

```sh
node ./local_thr.js tcp://127.0.0.1:5555 1 100000
```

```sh
node ./remote_thr.js tcp://127.0.0.1:5555 1 100000
```

Running `make perf` will run the commands listed above.

