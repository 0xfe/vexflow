const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { argv } = process;

const log = (msg = 'undefined', type) => {
  if (type && type.length) {
    process.stdout.write(`${type}: `);
  }
  process.stdout.write(msg);
  process.stdout.write('\n');
};

const jobLog = (msg, type, jobInfo) => {
  const prefix = jobInfo ? `${jobInfo.jobId}/${jobInfo.jobs}: ` : '';
  log(`${prefix}${msg}`, type);
};

const usage = () => {
  if (!options.IMAGE_OUTPUT_DIR) {
    log(
      `Usage: node ${argv[1]} SCRIPT_VER IMAGE_OUTPUT_DIR [--module=moduleToTest] [--parallel=1] [--jobs=<jobs>] [--jobId=<jobId>]`
    );
    process.exit(1);
  }
};

const progress = (msg) => {
  process.stdout.write(`\u001B[0G${msg}\u001B[0K`);
  // log(msg);
};

const options = {
  jobs: require('os').cpus().length,
  jobId: NaN,
  SCRIPT_VER: argv[2] || 'build',
  IMAGE_OUTPUT_DIR: argv[3],
  TIMEOUT: 30 * 1000,
};
const args = process.argv.slice(4);
// console.log(args);
args.forEach((str) => {
  const arg = str.match(/--([^=]+)=(.+)/);
  if (arg) {
    const name = arg[1];
    switch (name) {
      case 'jobs':
      case 'jobId':
      case 'parallel':
        options[name] = parseInt(arg[2]);
        break;
      case 'module':
        options[name] = arg[2];
        break;
      /*
      case 'xxx':
        options[name] = arg[2];
        break;
      */
      default:
        break;
    }
  }
});

usage();

const savePNGData = (filename, pngDataURL) => {
  let ret = false;
  if (pngDataURL.split) {
    const imageData = pngDataURL.split(';base64,').pop();
    const imageBuffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(filename, imageBuffer, { encoding: 'base64' });
    ret = true;
  }
  return ret;
};

const launch = async (query, jobInfo) => {
  const browser = await puppeteer.launch({ headless: true, devtools: false });
  const page = await browser.newPage();
  page.on('error', (msg) => {
    jobLog(msg, 'error', jobInfo);
    process.exit(2);
  });
  page.on('pageerror', (msg) => {
    jobLog(msg.toString(), 'pageerror', jobInfo);
    process.exit(1);
  });
  await page.goto('file://' + path.join(process.cwd(), `tests/flow.html${query ? query : ''}`)).catch((error) => {
    log(error);
    process.exit(3);
  });
  return {
    browser,
    page,
  };
};

const getTestModules = async () => {
  const { browser, page } = await launch('?module=unknown');
  await page.waitForTimeout(1000);
  const testModules = await page.$eval('#qunit-modulefilter', (selectElm) => {
    const ret = [];
    Array.from(selectElm.options).forEach((optionElm) => {
      const { value } = optionElm;
      if (value && value.length) {
        ret.push(value);
      }
    });
    return ret;
  });
  return testModules;
};

const launchTestPage = async (jobs, jobId) => {
  // log(`launchChild ${jobId}/${jobs}`);
  const moduleArg = options.module ? `&module=${options.module}` : '';
  const { browser, page } = await launch(`?jobs=${jobs}&jobId=${jobId}&ver=${options.SCRIPT_VER}${moduleArg}`, {
    jobs,
    jobId,
  });

  const genImages = async (onFinish) => {
    const onFinishArgs = {};
    const elmDefs = await page.$$eval('#vexflow_testoutput .testcanvas', (elms) => {
      window.VF_TEST_GLOBAL = {};
      const { VF_TEST_GLOBAL } = window;
      const ret = [];
      VF_TEST_GLOBAL.elmDefs = ret;
      Array.from(elms).forEach((elm) => {
        let nameStr = (elm.querySelector('.name') || {}).innerText;
        nameStr = encodeURIComponent(nameStr.replace(/[:›]/g, '-').replace(/[\s]/g, '_'));

        let type = 'png';
        let el = elm.querySelector('canvas.vex-tabdiv');
        if (!el) {
          type = 'svg';
          el = elm.querySelector('.vex-tabdiv svg');
        }
        if (el) {
          // FIXME: Renderer.Random: Ignore the border style to always produce the same image.
          el.style.border = 'none';
          ret.push({
            nameStr,
            el: el,
            elIdx: ret.length,
            type,
          });
        }
      });

      VF_TEST_GLOBAL.svg2png = async (svgStr) => {
        if (!VF_TEST_GLOBAL.vfTmpCanvasArray) {
          VF_TEST_GLOBAL.vfTmpCanvasArray = [];
        }
        let c = VF_TEST_GLOBAL.vfTmpCanvasArray.pop();
        if (!c) {
          c = document.createElement('canvas');
          document.body.appendChild(c);
        }
        const i = new Image();
        const b = new window.Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const bUrl = URL.createObjectURL(b);
        i.src = bUrl;

        return new Promise((resolve, reject) => {
          i.onload = () => {
            URL.revokeObjectURL(bUrl);
            c.width = i.width;
            c.height = i.height;
            const c2d = c.getContext('2d');
            c2d.clearRect(0, 0, i.width, i.height);
            c2d.drawImage(i, 0, 0);
            const pngDataURL = c.toDataURL();
            VF_TEST_GLOBAL.vfTmpCanvasArray.push(c);
            resolve(pngDataURL);
          };
          i.onerror = (error) => {
            if (c) {
              VF_TEST_GLOBAL.vfTmpCanvasArray.push(c);
            }
            reject(error);
          };
        });
      };
      return ret;
    });

    const doIt = async (elmDef) => {
      result = 'error';
      const filename = `${options.IMAGE_OUTPUT_DIR}/pptr-${elmDef.nameStr}`;
      try {
        let data;
        const { type } = elmDef;
        switch (elmDef.type) {
          case 'png':
            data = {
              pngDataURL: await page.evaluate((elIdx) => {
                const el = window.VF_TEST_GLOBAL.elmDefs[elIdx].el;
                return el.toDataURL();
              }, elmDef.elIdx),
            };

            if (data && data.pngDataURL && savePNGData(`${filename}.${type}`, data.pngDataURL)) {
              result = 'success';
            }
            break;
          case 'svg':
            data = await page.evaluate(async (elIdx) => {
              const el = window.VF_TEST_GLOBAL.elmDefs[elIdx].el;
              const svgStr = new XMLSerializer().serializeToString(el);
              const pngDataURL = await window.VF_TEST_GLOBAL.svg2png(svgStr);
              return {
                svgStr,
                pngDataURL,
              };
            }, elmDef.elIdx);

            if (data && data.svgStr && data.pngDataURL && savePNGData(`${filename}.svg.png`, data.pngDataURL)) {
              fs.writeFileSync(`${filename}.${type}`, data.svgStr);
              result = 'success';
            }
            break;
          default:
            break;
        }
      } catch (e) {
        progress(e);
      }
      return result;
    };

    const ret = {
      results: {},
      elmDefs,
    };

    for (let elmDef of elmDefs) {
      // progress(`${jobId}/${jobs}: ${elmDef.nameStr}`);
      ret.results[elmDef.nameStr] = await doIt(elmDef);
    }

    return ret;
  };

  const func = async () => {
    let startTime = Date.now();
    while (true) {
      const data = await page.evaluate((selector) => {
        const elm = document.querySelector(selector);
        if (elm) {
          return elm.textContent;
        }
        return 'loading..';
      }, '#qunit-testresult.result');

      const d = Date.now() - startTime;
      if (d > options.TIMEOUT) {
        await browser.close();
        throw Error(`Error: test timeout (${d / 1000} sec).`);
        break;
      }

      if (!data.startsWith('Tests completed in')) {
        progress(`${jobId}/${jobs}: ${data}`);
        page.waitForTimeout(200);
      } else {
        progress(`${jobId}/${jobs}: ${data}`);
        const ret = await genImages();

        // console.log(JSON.stringify(args.results, null, 2));
        log('');
        jobLog(
          `done: ${Object.keys(ret.results || {}).length}/${ret.elmDefs.length} test images are generated.`,
          'info',
          options
        );
        await browser.close();
        break;
      }
    }
  };
  await func();
};

const execChild = async (jobs, jobId) => {
  log(`${jobId}/${jobs}: start`);
  const { argv } = process;
  const args = [argv[1], argv[2], argv[3], `--jobs=${jobs}`, `--jobId=${jobId}`];
  if (options.module) {
    args.push(`--module=${options.module}`);
  }

  const child = spawn(argv[0], args);

  return new Promise((resolve) => {
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      log(`${jobId}/${jobs} closed with code ${code}`);
      resolve({ jobId, code });
    });
  });
};

const appMain = async () => {
  const { jobs, jobId, SCRIPT_VER } = options;
  let numTestes = NaN;
  let allJobs = 1;
  let exitCode = 0;
  if (Number.isNaN(jobId)) {
    try {
      global.Vex = require(`../${SCRIPT_VER}/vexflow-debug-with-tests.js`);
      if (options.parallel !== 1 && !options.module && global.Vex) {
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
      // log(e.toString());
    }

    fs.mkdirSync(options.IMAGE_OUTPUT_DIR, { recursive: true });
    log(`${SCRIPT_VER} ${options.IMAGE_OUTPUT_DIR}`);
    log(`numTests=${Number.isNaN(numTestes) ? 'unknown' : numTestes}, allJobs=${allJobs}, jobs=${jobs}`);
    let ps = [];
    let keys = [];
    for (let i = 0; i < allJobs || ps.length; ) {
      while (i < allJobs && ps.length < jobs) {
        ps.push(execChild(allJobs, i));
        keys.push(i);
        i += 1;
      }
      if (ps.length) {
        const { jobId: doneKey, code } = await Promise.race(ps);
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
    if (!ps.length) {
      log('end');
    }
  } else {
    await launchTestPage(jobs, jobId).catch((e) => {
      // jobLog(e.toString(), 'joberror', options);
      jobLog(e.stack, 'joberror', options);
      exitCode = 4;
    });
  }
  process.exit(exitCode);
};

appMain();
