#!/usr/bin/env bash
# Build vexflow-debug.js if it does not exist.
BUILD_FILE=../../build/vexflow-debug.js
LOCAL_FILE=vexflow-debug.js

if [ ! -f "$LOCAL_FILE" ]; then
  printf "\n$LOCAL_FILE not found. Copy it from the build folder.\n"

  if [ ! -f "$BUILD_FILE" ]; then
    printf "\n$BUILD_FILE not found. Running grunt.\n\n"
    grunt
  fi

  # Copy vexflow-debug.js into this folder.
  cp $BUILD_FILE $LOCAL_FILE
fi

# Launch a web server to test index.html and index.classic.html
npx http-server
