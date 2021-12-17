const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const log = (msg = 'undefined', type) => {
  if (type && type.length) {
    process.stdout.write(`${type}: `);
  }
  process.stdout.write(msg);
  process.stdout.write('\n');
};

const parseArgs = () => {
  const argv = [...process.argv];

  const argv0 = argv.shift();
  argv.shift(); // skip this script name.
  const childArgs = {
    argv0,
    ver: argv.shift(),
    imageDir: argv.shift(),
    args: [],
  };

  let backends;
  let parallel;

  argv.forEach((str) => {
    const prop = str.split('=');
    const name = (prop[0] || '').toLowerCase();
    const value = prop[1];
    switch (name) {
      case '--backend':
        backends = backends || {};
        value
          .toLowerCase()
          .split(',')
          .forEach((backend) => {
            switch (backend) {
              case 'pptr':
              case 'jsdom':
              case 'all':
              case 'none':
                backends[backend] = true;
                break;
              default:
                break;
            }
          });
        break;
      case '--parallel':
        parallel = str;
        break;
      default:
        childArgs.args.push(str);
        break;
    }
  });

  childArgs.args.push(parallel || '--parallel');

  backends = backends || {
    all: true,
  };

  return {
    childArgs,
    backends,
  };
};

const appMain = async () => {
  const options = parseArgs();
  const { childArgs, backends } = options;
  const { ver, imageDir, args } = childArgs;

  const backendDefs = {
    jsdom: {
      path: './tools/generate_png_images.js',
      getArgs: () => {
        return [`../${ver}`, imageDir].concat(args);
      },
    },
    pptr: {
      path: './tools/generate_images_pptr.js',
      getArgs: () => {
        return [ver, imageDir].concat(args);
      },
    },
  };

  const execChild = (backend) => {
    log(`${backend} start`);
    const backendDef = backendDefs[backend];
    const child = spawn(childArgs.argv0, [backendDef.path].concat(backendDef.getArgs()));
    return new Promise((resolve) => {
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        log(`${backend} closed with code ${code}`);
        resolve({ backend, code });
      });
    });
  };

  const execChildren = async (backends) => {
    const error = false;
    for (const backend in backendDefs) {
      if (!backends.none && (backends.all || backends[backend])) {
        const { code } = await execChild(backend);
        if (code !== 0) {
          error = true;
        }
      }
    }
    return error;
  };

  fs.mkdirSync(imageDir, { recursive: true });

  const error = await execChildren(backends);
  if (error) {
    process.exit(1);
  }
};

appMain();
