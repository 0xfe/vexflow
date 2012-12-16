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

## Links

* [VexFlow Home](http://vexflow.com)
* [My VexFlow](http://my.vexflow.com)
* [The VexFlow Tutorial](http://vexflow.com/docs/tutorial.html)
* [VexFlow Google Group](https://groups.google.com/forum/?fromgroups#!forum/vexflow)
* [Me](http://0xfe.muthanna.com)
