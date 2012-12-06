#!/bin/bash
# Before running, install Node and Jison.
#
# brew install node
# apt-get install node
#
# npm install jison

./node_modules/.bin/jison vextab.jison -o vextab_parser.js
