// Demonstrate various ways to import VexFlow classes via ES modules.
// node import3.mjs

import * as Vex0 from 'vexflow'; // the entire module, which looks like { default: ... }. Same as Vex3 below.
import { default as Vex1 } from 'vexflow'; // extract the default export. Same as Vex0.default.
import Vex2 from 'vexflow'; // default export. Same as Vex1 above.
const Vex3 = await import('vexflow'); // dynamic import. The imported object is the same as Vex0 above.
import { Vex } from 'vexflow'; // named export for convenience. Same as Vex0.default.Vex.

const { StaveNote } = Vex0;
// import { StaveNote as StaveNote1 } from 'vexflow'; // FAIL

// console.log(Vex1.Flow.BUILD);
// console.log(Vex.sortAndUnique);

// console.log(Vex3.Vex.sortAndUnique);
// console.log(Vex3.default.sortAndUnique);
// console.log(Vex3.Flow);

console.log(Vex2.Vex === Vex);
console.log(StaveNote === Vex.Flow.StaveNote);
console.log(StaveNote === Vex2.Flow.StaveNote);

console.log(Vex3.default === Vex1);
console.log(Vex3.Flow.StaveNote == StaveNote);
console.log(Vex3.default.Flow.StaveNote == StaveNote);

console.log(Vex3.Vex.Flow === Vex3.default.Flow);
console.log(Vex3.Flow === Vex3.default.Flow);

// console.log(Vex3.Vex);

// Verify that a modification to the Flow module in one place will be reflected
// everywhere we can access the Flow module.

Vex.Flow.HELLO = 123;
console.log(Vex1.Flow.HELLO === 123);
console.log(Vex3.Flow.HELLO === 123);
console.log(Vex3.default.Flow.HELLO === 123);
