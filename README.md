# Vex Flow

A JavaScript library for rendering music notation.
Copyright (c) 2010 Mohit Muthanna Cheppudira

## What is VexFlow?

VexFlow is an open-source web-based music notation rendering API. It is written completely in JavaScript, and runs right in the browser. VexFlow supports HTML5 Canvas and SVG.

Go try out [The VexFlow Tutorial](http://vexflow.com/docs/tutorial.html) to learn how to use VexFlow.

If you're not a developer and just want to write and share your music, go to
[My VexFlow](http://my.vexflow.com).


## Where is VexTab?

VexTab has been overhauled and has moved to a new repository. Go
to [github/0xfe/vextab](http://github.com/0xfe/vextab).

VexTab 2.0 now supports all VexTab 1.0 features, and [includes a few new ones](http://my.vexflow.com/articles/53?source=enabled).

## To Contribute

* Send in your changes via a GitHub pull request.
* Rebase early, rebase often.
* Please include tests -- I will not commit changes that don't have
  accompanying tests.
  New test files should be added to both [tests/flow.html](tests/flow.html)
  and [tests/nodejstests.js](tests/nodejstests.js).
* Please use 2 spaces instead of tabs and wrap your lines at 80 columns.
* Try to stick to the style conventions in the existing code. (It's not great,
  but it's what we have.)
* Join the VexFlow Google Group at:
  https://groups.google.com/forum/?fromgroups#!forum/vexflow

## Prerequisites (for Developers)

For performing full builds, you need the following:

* Google Closure Compiler (included in support/)
  * This requires a JRE to be installed.
* SCons
* git
* zip

## Build Instructions

Build with:

    $ scons

Clean with:

    $ scons -c

Quiet build:

    $ scons -Q

Open `tests/flow.html` for QUnit unit tests.

## Node.js Integration

Vex Flow can also be run outside the browser using Node.js.
Install dependencies and compile with `npm install` here, then to use it,
`npm link` in this repository
then add "vexflow" as a dependency in your package.json.
Your system must have Cairo installed; see 
[here](https://github.com/LearnBoost/node-canvas#installation) for details.

For a usage example, see `tests/nodejsdemo.js` and run it 
with `node tests/nodejsdemo.js`.
To run QUnit unit tests as well as the demo, run `npm test`.
Rendered images from the unit tests can be found in `tests/output`.

## MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Links

* [VexFlow Home](http://vexflow.com)
* [My VexFlow](http://my.vexflow.com)
* [The VexFlow Tutorial](http://vexflow.com/docs/tutorial.html)
* [VexFlow Google Group](https://groups.google.com/forum/?fromgroups#!forum/vexflow)
* [Me](http://0xfe.muthanna.com)
