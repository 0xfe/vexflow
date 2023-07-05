# VexFlow

VexFlow is an open-source library for rendering music notation. It is written in TypeScript (compiled to ES6), and outputs scores to HTML Canvas and SVG. It works in browsers and also in Node.js projects (e.g., a command line script to save a score as a PDF).

The guide below refers to VexFlow 4.2.
If you need to work with the previous version, follow the [version 3.0.9 tutorial](https://github.com/0xfe/vexflow/wiki/VexFlow-3.0.9-Tutorial).
To follow the current work on VexFlow 5, see https://github.com/vexflow/vexflow.

## Quick Start

The quickest way to add VexFlow to a web page is via a `<script>` tag.

```html
<script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/cjs/vexflow.js"></script>
<script>
  // YOUR CODE GOES HERE
</script>
```

The URL above includes a version number <code>vexflow@x.y.z</code>. Specifying a particular version is good practice, to prevent rare issues with a future update breaking your deployment. During development &amp; testing, feel free to use the latest release by omitting the version number: https://cdn.jsdelivr.net/npm/vexflow/build/cjs/vexflow.js

If your project uses a bundler, you can install VexFlow from npm:

```sh
npm install vexflow
```

Read our detailed guide on [integrating with VexFlow.](https://github.com/0xfe/vexflow/wiki/VexFlow-4-Tutorial)

## EasyScore

EasyScore is VexFlow's high-level API for creating music notation. On a web page containing a `<div id="output"></div>`, the following code displays a score:

```javascript
const { Factory, EasyScore, System } = Vex.Flow;

const vf = new Factory({
  renderer: { elementId: 'output', width: 500, height: 200 },
});

const score = vf.EasyScore();
const system = vf.System();

system
  .addStave({
    voices: [
      score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
      score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
    ],
  })
  .addClef('treble')
  .addTimeSignature('4/4');

vf.draw();
```

[See a running example of EasyScore here.](https://jsfiddle.net/xure9svb/)

[Learn more about EasyScore here.](https://github.com/0xfe/vexflow/wiki/Using-EasyScore)

## Native API

If you need more control, you can use the low-level VexFlow API. Below, we render a stave using SVG. [See a running example of the low-level API here.](https://jsfiddle.net/5zgf03un/)

```javascript
const { Renderer, Stave } = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element with id="output".
const div = document.getElementById('output');
const renderer = new Renderer(div, Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(500, 500);
const context = renderer.getContext();
context.setFont('Arial', 10);

// Create a stave of width 400 at position 10, 40.
const stave = new Stave(10, 40, 400);

// Add a clef and time signature.
stave.addClef('treble').addTimeSignature('4/4');

// Connect it to the rendering context and draw!
stave.setContext(context).draw();
```

## Examples

- Take a look at [the VexFlow tutorial](https://github.com/0xfe/vexflow/wiki/Tutorial).

- Dig into [the unit tests](https://github.com/0xfe/vexflow/tree/master/tests).

## More Resources

- If you need help, come join us on the [Vexflow Google Group](https://groups.google.com/forum/?fromgroups#!forum/vexflow).

- Learn more on the [VexFlow wiki](https://github.com/0xfe/vexflow/wiki).

- Build VexFlow from scratch by following the [build instructions](https://github.com/0xfe/vexflow/wiki/Build%2C-Test%2C-Release).

- [VexFlow](https://vexflow.com) was created by [Mohit Muthanna Cheppudira](https://muthanna.com) in 2010. Since then, many have contributed with code, documentation, bug reports, and feature requests. See the [list of contributors to the repository](https://github.com/0xfe/vexflow/graphs/contributors).

- [Projects Using VexFlow](https://github.com/0xfe/vexflow/wiki/Project-Gallery)

## Sponsor this Project

If you find VexFlow useful, please consider sponsoring its development: https://github.com/sponsors/0xfe.

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
