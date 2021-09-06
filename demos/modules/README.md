# Using VexFlow with ES Modules

Use `test.sh`to build and copy `vexflow-debug.js` into this folder. Or do this manually:

```
grunt
cp ../../build/vexflow-debug.js vexflow-debug.js
```

Start a web server in this folder.

```
npx http-server

Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
Hit CTRL-C to stop the server

```

Then load the `index.html` in a browser by visiting http://127.0.0.1:8080.
