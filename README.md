# VexFlow 2

A JavaScript library for rendering music notation.
Copyright (c) 2010 Mohit Muthanna Cheppudira

## What is VexFlow?

VexFlow is an open-source web-based music notation rendering API. It is written
completely in JavaScript, and runs right in the browser. VexFlow supports HTML5
Canvas and SVG, and runs on all modern browsers.

Go try out [The VexFlow Tutorial](http://vexflow.com/docs/tutorial.html) to
learn how to use VexFlow.

If you're not a developer and just want to write and share your music, go to
[My VexFlow](http://my.vexflow.com).

## Quick Start

Install via NPM:

    $ npm install vexflow

Include `releases/vexflow-min.js` into your HTML or JS code. It works as a standalone script in a `script` tag, or as a CommonJS or AMD dependency.

### Your First Stave

The example code below renders a VexFlow stave using SVG. See running example in this [jsfiddle](https://jsfiddle.net/nL0cn3vL/2/).

```javascript
VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
var div = document.getElementById("boo")
var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(500, 500);
var context = renderer.getContext();
context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

// Create a stave of width 400 at position 10, 40 on the canvas.
var stave = new VF.Stave(10, 40, 400);

// Add a clef and time signature.
stave.addClef("treble").addTimeSignature("4/4");

// Connect it to the rendering context and draw!
stave.setContext(context).draw();
```

## Resources

To learn and contribute, check out the [VexFlow Wiki](https://github.com/0xfe/vexflow/wiki).

To build VexFlow from scratch, read the [Build Instructions](https://github.com/0xfe/vexflow/wiki/Build-Instructions).

## MIT License

Copyright (c) Mohit Muthanna Cheppudira 2010 <br/>
0xFE <mohit@muthanna.com> http://www.vexflow.com

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
* [Me](http://0xfe.muthanna.com)
