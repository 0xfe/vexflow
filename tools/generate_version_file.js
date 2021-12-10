const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const outputFile = process.argv[2] ?? path.join(__dirname, '../src/version.ts');

const PACKAGE_JSON = JSON.parse(fs.readFileSync('package.json'));
const VEXFLOW_VERSION = PACKAGE_JSON.version;
const GIT_COMMIT_HASH = child_process.execSync('git rev-parse HEAD').toString().trim();

const VERSION = `export const VERSION: string = '${VEXFLOW_VERSION}';`;
const BUILD = `export const BUILD: string = '${GIT_COMMIT_HASH}';`;
const DATE = `export const DATE: string = '${new Date().toISOString()}';`;

fs.writeFileSync(outputFile, `${VERSION}\n${BUILD}\n${DATE}`);
