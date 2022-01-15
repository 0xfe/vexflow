// Reads the version number in package.json
// Reads the most recent git commit hash.
// Returns the current timestamp.

// Call writeFile() to saves the build information to vexflow/src/version.ts

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const outputFile = path.join(__dirname, '../src/version.ts');

const PACKAGE_JSON = JSON.parse(fs.readFileSync('package.json'));
const VEXFLOW_VERSION = PACKAGE_JSON.version;
const GIT_COMMIT_ID = execSync('git rev-parse HEAD').toString().trim();
const DATE = new Date().toISOString();

module.exports = {
  VERSION: VEXFLOW_VERSION,
  ID: GIT_COMMIT_ID,
  DATE: DATE,
  writeFile() {
    const V = `export const VERSION: string = '${VEXFLOW_VERSION}';`;
    const I = `export const ID: string = '${GIT_COMMIT_ID}';`;
    const D = `export const DATE: string = '${DATE}';`;

    console.log('Saving version.ts file...');
    fs.writeFileSync(outputFile, `${V}\n${I}\n${D}`);
  },
};
