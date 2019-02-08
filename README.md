# VexFlow 2

A JavaScript library for rendering music notation.
Copyright (c) 2010 Mohit Muthanna Cheppudira

## Need Help? Ask on the [Vexflow Google Group](https://groups.google.com/forum/?fromgroups#!forum/vexflow).

## What is VexFlow?

VexFlow is an open-source web-based music notation rendering API. It is written
completely in JavaScript, and runs right in the browser. VexFlow supports HTML5
Canvas and SVG, and runs on all modern browsers.

Go try out [The VexFlow Tutorial](https://github.com/0xfe/vexflow/wiki/The-VexFlow-Tutorial) to
learn how to use VexFlow. Also learn to use the simpler EasyScore API in the [Using EasyScore](https://github.com/0xfe/vexflow/wiki/Using-EasyScore) guide.

## Quick Start

### Using NPM

    $ npm install vexflow

### Using the HTML `script` Tag

The releases are served via [unpkg.com](http://unpkg.com).

* Debug version: https://unpkg.com/vexflow/releases/vexflow-debug.js
* Minified version: https://unpkg.com/vexflow/releases/vexflow-min.js

### Your First Stave

The example code below renders a VexFlow stave using SVG. See running example in this [jsfiddle](https://jsfiddle.net/gs4v6k6d/2/).

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

### Using EasyScore

The EasyScore API is a quick way to create simple music notation in VexFlow. See running example in [this jsfiddle](https://jsfiddle.net/3d0nbL0n/128/).

```javascript
var vf = new Vex.Flow.Factory({
  renderer: {elementId: 'boo', width: 500, height: 200}
});

var score = vf.EasyScore();
var system = vf.System();

system.addStave({
  voices: [
    score.voice(score.notes('C#5/q, B4, A4, G#4', {stem: 'up'})),
    score.voice(score.notes('C#4/h, C#4', {stem: 'down'}))
  ]
}).addClef('treble').addTimeSignature('4/4');

vf.draw();
```

Learn more about EasyScore at: [Using EasyScore](https://github.com/0xfe/vexflow/wiki/Using-EasyScore).

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
