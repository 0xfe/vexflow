# vexflow/tools/esm/

`package.json` is copied to `vexflow/build/esm/`. The file specifies `"type": "module"`, to indicate that all \*.js files in `vexflow/build/esm/` are ES modules.

`fix-imports-and-exports.js` is used by Gruntfile.js to add .js extensions to all imports and exports under the `vexflow/build/esm/` directory. ES module import statements do not work without the .js extension.
