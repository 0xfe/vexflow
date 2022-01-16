// Reads the version number in package.json
// Reads the most recent git commit hash.
// Returns the current timestamp.

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const PACKAGE_JSON = JSON.parse(fs.readFileSync('package.json'));
const VEXFLOW_VERSION = PACKAGE_JSON.version;
const GIT_COMMIT_ID = execSync('git rev-parse HEAD').toString().trim();
const DATE = new Date().toISOString();

module.exports = {
  VERSION: VEXFLOW_VERSION,
  ID: GIT_COMMIT_ID,
  DATE: DATE,

  // Save the build information to build/esm/src/version.js
  saveESMVersionFile() {
    const outputFile = path.join(__dirname, '..', 'build', 'esm', 'src', 'version.js');
    const V = `export const VERSION = '${VEXFLOW_VERSION}';`;
    const I = `export const ID = '${GIT_COMMIT_ID}';`;
    const D = `export const DATE = '${DATE}';`;
    fs.writeFileSync(outputFile, `${V}\n${I}\n${D}`);
  },
};
