const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const outputFile = process.argv[2] ?? path.join(__dirname, '../src/version.ts');

const PACKAGE_JSON = JSON.parse(fs.readFileSync('package.json'));
const VEXFLOW_VERSION = PACKAGE_JSON.version;
const GIT_COMMIT_ID = child_process.execSync('git rev-parse HEAD').toString().trim();
const DATE = new Date().toISOString();

const V = `export const VERSION: string = '${VEXFLOW_VERSION}';`;
const I = `export const ID: string = '${GIT_COMMIT_ID}';`;
const D = `export const DATE: string = '${DATE}';`;

fs.writeFileSync(outputFile, `${V}\n${I}\n${D}`);

module.exports = {
  VERSION: VEXFLOW_VERSION,
  ID: GIT_COMMIT_ID,
  DATE: DATE,
};
