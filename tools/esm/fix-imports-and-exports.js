// Author: Ron B. Yeh
// node fix-imports-and-exports.js build/esm/

/* eslint-disable no-console */

import * as fs from 'fs';
import * as path from 'path';

const startingDirectory = process.argv[2] ?? __dirname;

function* walk(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walk(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

// Read and write files in place.
function fixImportsAndExports(filePath) {
  const contents = fs.readFileSync(filePath, 'utf8');

  console.log('Fixing imports & exports for\n' + filePath);

  // SOLUTION 1: Works OK except it doesn't handle when an import already ends in .js';
  /*
  const newContents = contents
    .replace(/^import (.*?)\.';$/gm, "import $1./index';") // Ends with dot: import '.'; => import './index';
    .replace(/^import (.*?)\/';$/gm, "import $1/index';") // Ends with slash: import './src/'; => import './src/index';
    .replace(/^import (.*?)';$/gm, "import $1.js';") // Normal case: import './file'; => import './file.js';
    .replace(/^export (.*?) from (.*?)\.';$/gm, "export $1 from $2./index';")
    .replace(/^export (.*?) from (.*?)\/';$/gm, "export $1 from $2/index';")
    .replace(/^export (.*?) from (.*?)';$/gm, "export $1 from $2.js';");
  fs.writeFileSync(filePath, newContents);
  */

  // SOLUTION 2: Line by line!
  const lines = contents.split('\n');
  const newLines = lines.map((line, index) => {
    if (line.startsWith('import ')) {
      if (line.endsWith(`.js';`)) {
        return line;
      }

      const fixedLine = line
        .replace(/^import (.*?)\.';$/gm, "import $1./index';") // Ends with dot: import '.'; => import './index';
        .replace(/^import (.*?)\/';$/gm, "import $1/index';") // Ends with slash: import './src/'; => import './src/index';
        .replace(/^import (.*?)';$/gm, "import $1.js';"); // Normal case: import './file'; => import './file.js';

      if (fixedLine !== line) {
        console.log(`\tFixed import: ${fixedLine}`);
      }
      return fixedLine;
    } else if (line.startsWith('export ') && line.includes(' from ')) {
      if (line.endsWith(`.js';`)) {
        return line;
      }
      const fixedLine = line
        .replace(/^export (.*?) from (.*?)\.';$/gm, "export $1 from $2./index';")
        .replace(/^export (.*?) from (.*?)\/';$/gm, "export $1 from $2/index';")
        .replace(/^export (.*?) from (.*?)';$/gm, "export $1 from $2.js';");
      if (fixedLine !== line) {
        console.log(`\tFixed export: ${fixedLine}`);
      }
      return fixedLine;
    } else {
      return line;
    }
  });
  const newContents = newLines.join('\n');
  fs.writeFileSync(filePath, newContents);
}

for (const filePath of walk(startingDirectory)) {
  if (filePath.endsWith('.js')) {
    fixImportsAndExports(filePath);
  }
}
