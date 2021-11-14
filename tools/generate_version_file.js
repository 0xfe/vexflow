const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

/* eslint-disable no-console */

const outputFile = process.argv[2] ?? path.join(__dirname, '../src/version.ts');

const PACKAGE_JSON = JSON.parse(fs.readFileSync('package.json'));
const VEXFLOW_VERSION = PACKAGE_JSON.version;
const GIT_COMMIT_HASH = child_process.execSync('git rev-parse HEAD').toString().trim();

const contents = `export const VERSION: string = '${VEXFLOW_VERSION}';\nexport const BUILD: string = '${GIT_COMMIT_HASH}';`;
fs.writeFileSync(outputFile, contents);
