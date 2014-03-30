#!/bin/bash
# Simple deployment script for vexflow.com.
#
# Pushes only JavaScript, tests, and supporting HTML (tutorial, playground)

TARGET='/home/mohit/www/vexflow'
SSH_TO="mohit@my.vexflow.com source ~/.bash_profile; cd $TARGET;"
SCP_TO="mohit@my.vexflow.com:$TARGET"

echo Building...
rake clean; rake; rake docs

ssh $SSH_TO "mkdir -p $TARGET; mkdir -p $TARGET/support"
if [ "$?" != "0" ]
  then
  echo "Cannot create remote directory."
  exit 1
fi

echo Copying over compiled sources...
scp build/vexflow/vexflow-min.js $SCP_TO/support
scp build/vexflow/vexflow-debug.js $SCP_TO/support

echo Copying over tests...
rsync -przvl --delete --stats tests $SCP_TO
scp tests/flow.html $SCP_TO/tests/index.html

echo Copy over docs...
rsync -przvl --delete --stats docs $SCP_TO
scp -r docs/index.html $SCP_TO

echo Done.
