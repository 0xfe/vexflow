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

const usage = () => {
  log('Usage:');
  log('  node generate_images.js ver imageDir [--backend=<backend>] [--parallel=<jobs>]');
  log('Options:');
  log('  ver  : specify the version to run.');
  log('  imageDir  : specify the directory to save images.');
  log(
    '  --backend=<backend>  : specify backends to run. default is all. available backends are "jsdom", "pptr", "all". default is "all"'
  );
  log('  --parallel=<jobs>  : specify the number of parallel processes. default is the number of cpus');
  process.exit(1);
};

const parseArgs = () => {
  const argv = [...process.argv];
  if (argv.length < 4) {
    usage();
  }

  const argv0 = argv.shift();
  argv.shift(); // skip this script name.
  const childArgs = {
    argv0,
    ver: argv.shift(),
    imageDir: argv.shift(),
    args: [],
  };

  let backends;
  let parallel = require('os').cpus().length;

  argv.forEach((str) => {
    const prop = str.split('=');
    const name = (prop[0] || '').toLowerCase();
    const value = prop[1];
    const intValue = parseInt(value, 10);
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
                backends[backend] = true;
                break;
              default:
                log(`unknown backend: ${backend}`, 'error');
                usage();
                break;
            }
          });
        break;
      case '--parallel':
        if (value && !Number.isNaN(intValue)) {
          parallel = intValue;
        } else {
          log(`invalid value for --parallel: ${value}`, 'error');
          usage();
        }
        break;
      case '--help':
        usage();
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
    parallel: parallel <= 1 ? 1 : parallel,
  };
};

const resolveJobsOption = (ver) => {
  let numTestes = NaN;
  let pptrJobs = 1;

  try {
    global.Vex = require(`../${ver}/vexflow-debug-with-tests.js`);
    if (global.Vex) {
      const { Flow } = global.Vex;
      if (Flow) {
        const { Test } = Flow;
        if (Test && Test.tests && Test.parseJobOptions) {
          numTestes = Test.tests.length;
          pptrJobs = Math.ceil(numTestes / 10);
        }
      }
    }
  } catch (e) {
    // may old release, ignore
    log(e.toString());
  }

  return {
    numTestes,
    pptrJobs,
  };
};

const appMain = async () => {
  const options = parseArgs();
  const { childArgs, backends, parallel } = options;
  const { numTestes, pptrJobs } = resolveJobsOption(childArgs.ver);
  const { ver, imageDir, args } = childArgs;

  const backendDefs = {
    jsdom: {
      path: './tools/generate_png_images.js',
      getArgs: () => {
        return [`../${ver}`, imageDir].concat(args);
      },
      jobs: numTestes ? parallel : 1,
    },
    pptr: {
      path: './tools/generate_images_pptr.js',
      getArgs: () => {
        return [ver, imageDir].concat(args);
      },
      jobs: parallel <= 1 ? 1 : pptrJobs,
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
    log(
      JSON.stringify({
        numTestes,
        pptrJobs,
        backends,
        jsdom_jobs: backendDefs.jsdom.jobs,
        pptr_jobs: backendDefs.pptr.jobs,
      })
    );

    const race = async (ps) => {
      if (!ps.length) {
        return { code: 0 };
      }
      const { key: doneKey, code } = await Promise.race(ps);
      const keyIdx = keys.indexOf(doneKey);
      ps.splice(keyIdx, 1);
      keys.splice(keyIdx, 1);

      return { code };
    };

    for (const backend in backendDefs) {
      if (!exitCode && !backends.none && (backends.all || backends[backend])) {
        const { jobs } = backendDefs[backend];
        for (let i = 0; (!exitCode && i < jobs) || ps.length; ) {
          while (i < jobs && ps.length < parallel) {
            ps.push(execChild(backend, jobs, i, key));
            key += 1;
            keys.push(i);
            i += 1;
          }
          if (ps.length) {
            const { code } = await race(ps);
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

    while (ps.length && !exitCode) {
      const { code } = await race(ps);
      if (code) {
        exitCode = code;
      }
    }

    return exitCode;
  };

  fs.mkdirSync(imageDir, { recursive: true });

  const exitCode = await execChildren(backends);
  log('done.');
  process.exit(exitCode);
};

appMain();

// log('end of file ---------------------------------------');
