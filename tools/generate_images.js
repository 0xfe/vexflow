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
        parallel = parseInt(value);
        break;
      default:
        childArgs.args.push(str);
        break;
    }
  });

  backends = backends || {
    all: true,
  };

  return {
    childArgs,
    backends,
    parallel,
  };
};

const resolveJobsOption = (childArgs) => {
  let numTestes = NaN;
  let allJobs = 1;

  try {
    global.Vex = require(`../${childArgs.ver}/vexflow-debug-with-tests.js`);
    if (global.Vex) {
      const { Flow } = global.Vex;
      if (Flow) {
        const { Test } = Flow;
        if (Test && Test.tests && Test.parseJobOptions) {
          numTestes = Test.tests.length;
          allJobs = Math.ceil(numTestes / 10);
        }
      }
    }
  } catch (e) {
    // may old release, ignore
    log(e.toString());
  }

  return {
    numTestes,
    allJobs,
  };
};

const appMain = async () => {
  const options = parseArgs();
  const { childArgs, backends, parallel } = options;
  const { numTestes, allJobs } = resolveJobsOption(childArgs);
  const { ver, imageDir, args } = childArgs;

  const jobs = parallel <= 1 ? 1 : allJobs;

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

  const execChild = (backend, jobs, jobId, key) => {
    const proc = `${ver}_${backend}_${jobId}_${jobs}-${key}`;
    log(`${proc} start`);
    const backendDef = backendDefs[backend];
    const child = spawn(
      childArgs.argv0,
      [backendDef.path].concat(backendDef.getArgs(), [`--jobs=${jobs}`, `--jobId=${jobId}`])
    );
    return new Promise((resolve) => {
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        log(`${proc} closed with code ${code}`);
        resolve({ key, code });
      });
    });
  };

  const execChildren = async (backends) => {
    let exitCode = 0;
    let ps = [];
    let keys = [];
    let key = 0;
    const procs = require('os').cpus().length;
    log(JSON.stringify(backends));
    for (const backend in backendDefs) {
      if (!exitCode && !backends.none && (backends.all || backends[backend])) {
        for (let i = 0; (!exitCode && i < jobs) || ps.length; ) {
          while (i < jobs && ps.length < procs) {
            ps.push(execChild(backend, jobs, i, key));
            key += 1;
            keys.push(i);
            i += 1;
          }
          if (ps.length) {
            const { key: doneKey, code } = await Promise.race(ps);
            const keyIdx = keys.indexOf(doneKey);
            ps.splice(keyIdx, 1);
            keys.splice(keyIdx, 1);
            if (code) {
              exitCode = code;
              log('remote error. aborting...');
              break;
            }
          }
        }
      }
      if (!ps.length) {
        // log(`${backend} end`);
      }
    }
    return exitCode;
  };

  fs.mkdirSync(imageDir, { recursive: true });

  const exitCode = await execChildren(backends);
  // log('end of execChildren =======================');
  process.exit(exitCode);
};

appMain();

// log('end of file ---------------------------------------');
