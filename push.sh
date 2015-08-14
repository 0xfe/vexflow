#!/bin/bash
# Simple deployment script for vexflow.com.
#
# Pushes only JavaScript, tests, and supporting HTML (tutorial, playground)

TARGET='/home/mohit/www/vexflow'
SSH_TO="mohit@my.vexflow.com source ~/.bash_profile; cd $TARGET;"
SCP_TO="mohit@my.vexflow.com:$TARGET"

echo Building...
grunt clean; grunt

ssh $SSH_TO "mkdir -p $TARGET; mkdir -p $TARGET/support"
if [ "$?" != "0" ]
  then
  echo "Cannot create remote directory."
  exit 1
fi

echo Copying over compiled sources...
scp releases/vexflow-min.js $SCP_TO/support
scp releases/vexflow-debug.js $SCP_TO/support
scp releases/vexflow-min.js.map $SCP_TO/support

scp -r releases/vexflow-min.js.map $SCP_TO

echo Copying over tests...
rsync -przvl --delete --stats tests $SCP_TO
scp tests/flow.html $SCP_TO/tests/index.html

echo Copy over docs...
rsync -przvl --delete --stats releases/docs $SCP_TO
scp -r docs/index.html $SCP_TO
ssh $SSH_TO "rm docs/index.html"

echo Done.
