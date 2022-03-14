// Reads the version number in package.json
// Reads the most recent git commit hash.
// Returns the current timestamp.

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

let VEXFLOW_VERSION;
let GIT_COMMIT_ID;
let DATE;

function updateInfo() {
  VEXFLOW_VERSION = JSON.parse(fs.readFileSync('package.json')).version;
  GIT_COMMIT_ID = execSync('git rev-parse HEAD').toString().trim();
  DATE = new Date().toISOString();
}

updateInfo();

module.exports = {
  VERSION: VEXFLOW_VERSION,
  ID: GIT_COMMIT_ID,
  DATE: DATE,

  // Save the build information to build/esm/src/version.js
  saveESMVersionFile() {
    const parentDir = path.join(__dirname, '..', 'build', 'esm', 'src');
    const outputFile = path.join(parentDir, 'version.js');

    const V = `export const VERSION = '${VEXFLOW_VERSION}';`;
    const I = `export const ID = '${GIT_COMMIT_ID}';`;
    const D = `export const DATE = '${DATE}';`;

    console.log(`Writing ESM version data to ${outputFile}`);
    fs.mkdirSync(parentDir, { recursive: true });
    fs.writeFileSync(outputFile, `${V}\n${I}\n${D}`);
  },

  update: updateInfo,
};
