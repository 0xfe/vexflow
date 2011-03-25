#!/bin/bash

# Simple deployment script.
# Pushes only JavaScript, tests, and supporting HTML (tutorial, playground)

TARGET=~/www/vexflow

echo Building...
./build.sh

curdir=`pwd`
mkdir -p $TARGET
mkdir -p $TARGET/licensed
mkdir -p $TARGET/downloads
mkdir -p $TARGET/docs

echo Copying over compiled sources...
cp build/vexflow/vexflow-free.js $TARGET/vexflow.js
cp build/tabdiv/vextabdiv-free.js $TARGET/vextabdiv.js
cp tabdiv/tabdiv.css $TARGET

echo Copying over archives...
cp build/tabdiv-free.zip $TARGET/downloads

echo Copying over tests...
cp -r build/tests $TARGET
cp -r build/tests/flow.html $TARGET/tests/index.html

echo Copying over vextab...
cp -r build/vextab $TARGET

echo Copying over tabdiv HTML...
mkdir -p $TARGET/tabdiv
mkdir -p $TARGET/tabdiv/support
cp tabdiv/support/* $TARGET/tabdiv/support
cp tabdiv/*.html $TARGET/tabdiv
cp tabdiv/*.css $TARGET/tabdiv

echo Copy over VexTab HTML...
cp tabdiv/vextab.html $TARGET/vextab/index.html
cp tabdiv/tutorial.html $TARGET/vextab
cp tabdiv/tutorial.html $TARGET/tabdiv
cp tabdiv/playground.html $TARGET/vextab
cp tabdiv/*.css $TARGET/vextab

echo Copy over docs...
cp -r docs $TARGET

echo Done.
