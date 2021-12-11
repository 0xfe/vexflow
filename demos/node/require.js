// node require.js
//

const Vex = require('vexflow');
// const Vex = require('vexflow/bravura');
// const Vex = require('vexflow/petaluma');
// const Vex = require('vexflow/gonville');

// If you use 'vexflow/core', you will also need to call fetchMusicFont(...) below.
// const Vex = require('vexflow/core');

console.log('Default Music Font:', Vex.Flow.getMusicFont());

// Used with 'vexflow/core'.
// Vex.Flow.fetchMusicFont('Petaluma').then(() => {
//   Vex.Flow.setMusicFont('Petaluma');
//   console.log('Music Font is Now:', Vex.Flow.getMusicFont());
// });

console.log(Vex.Flow.BUILD);
