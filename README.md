# VexFlow 4

VexFlow is an open-source library for rendering music notation. It is written in TypeScript (compiled to ES6), and outputs scores to HTML
Canvas and SVG, right in the browser. It , and also in command line node projects.

## Sponsor this Project

If you use VexFlow and find it useful, please consider sponsoring its development: https://github.com/sponsors/0xfe.

## Quick Start

The quickest way to add VexFlow to an HTML page is via a `<script>` tag.

```html
<script src="https://cdn.jsdelivr.net/npm/vexflow/build/cjs/vexflow.js"></script>
<script>
  // YOUR CODE GOES HERE
</script>
```

If your project uses a bundler, you can install VexFlow from npm:

```sh
$ npm install vexflow
```

[More details on integrating with VexFlow 4.](https://github.com/0xfe/vexflow/wiki/VexFlow-4-Tutorial)

Note: if you still need to work with the previous version, visit the [tutorial for version 3.0.9.](https://github.com/0xfe/vexflow/wiki/VexFlow-3.0.9-Tutorial)

## EasyScore

EasyScore is VexFlow's high-level API for creating music notation.
[See a running example here.](https://jsfiddle.net/2pbh9xq0/)

```javascript
const f = new Vex.Flow.Factory({
  renderer: { elementId: 'boo', width: 500, height: 200 },
});

const score = f.EasyScore();
const system = f.System();

system
  .addStave({
    voices: [
      score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
      score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
    ],
  })
  .addClef('treble')
  .addTimeSignature('4/4');

f.draw();
```

[Learn more about EasyScore here.](https://github.com/0xfe/vexflow/wiki/Using-EasyScore)

## Native API

If you need more control, you can use the low-level VexFlow API.
Below, we render a stave using SVG. [See a running example here.](https://jsfiddle.net/j6dpazx2/)

```javascript
const VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "output".
const div = document.getElementById('output');
const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(500, 500);
const context = renderer.getContext();
context.setFont('Arial', 10);

// Create a stave of width 400 at position 10, 40 on the canvas.
const stave = new VF.Stave(10, 40, 400);

// Add a clef and time signature.
stave.addClef('treble').addTimeSignature('4/4');

// Connect it to the rendering context and draw!
stave.setContext(context).draw();
```

## More Examples

Take a look at [the VexFlow tutorial](https://github.com/0xfe/vexflow/wiki/Tutorial).

Dig into [the unit tests](https://github.com/0xfe/vexflow/tree/master/tests).

## Need Help?

Ask on the [Vexflow Google Group](https://groups.google.com/forum/?fromgroups#!forum/vexflow).

## Resources

To learn and contribute, check out the [VexFlow Wiki](https://github.com/0xfe/vexflow/wiki).

To build VexFlow from scratch, read the [Build Instructions](https://github.com/0xfe/vexflow/wiki/Build%2C-Test%2C-Release).

[VexFlow Home](https://vexflow.com)

[Mohit Muthanna Cheppudira](https://muthanna.com)

# MIT License

Copyright (c) Mohit Muthanna Cheppudira 2010 <br/>
0xFE <mohit@muthanna.com> https://www.vexflow.com

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
