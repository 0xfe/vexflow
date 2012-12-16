#!/bin/bash

# Simple deployment script.
# Pushes only JavaScript, tests, and supporting HTML (tutorial, playground)

TARGET=~/www/vexflow

echo Building...
scons -c
./build.sh

curdir=`pwd`
mkdir -p $TARGET
mkdir -p $TARGET/docs
mkdir -p $TARGET/support

echo Copying over compiled sources...
cp build/vexflow/vexflow-min.js $TARGET/support

echo Copying over tests...
cp -r build/tests $TARGET
cp -r build/tests/flow.html $TARGET/tests/index.html

echo Copy over docs...
cp -r docs $TARGET
cp -r docs/index.html $TARGET

echo Done.
