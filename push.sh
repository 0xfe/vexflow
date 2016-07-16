#!/bin/bash
# Simple deployment script for vexflow.com.
#
# Pushes only JavaScript, tests, and supporting HTML (tutorial, playground)

PRIMARY=static1.muthanna.com
BACKUP=static2.muthanna.com
CURRENT=vexflow.com

TARGET_SERVER=$CURRENT

TARGET='/home/mohit/www/vexflow'
SSH_TO="mohit@$TARGET_SERVER source ~/.bash_profile; cd $TARGET;"
SCP_TO="mohit@$TARGET_SERVER:$TARGET"

ssh $SSH_TO "mkdir -p $TARGET; mkdir -p $TARGET/support"
if [ "$?" != "0" ]
  then
  echo "Cannot create remote directory."
  exit 1
fi

echo Copying over compiled sources...
rsync -przvl --delete --stats build/* $SCP_TO/build
rsync -przvl --delete --stats releases/* $SCP_TO/releases

echo Copying over tests...
rsync -przvl --delete --stats tests/* $SCP_TO/tests
scp tests/flow.html $SCP_TO/tests/index.html

# echo Copy over docs...
rsync -przvl --delete --stats docs $SCP_TO
scp -r docs/index.html $SCP_TO
ssh $SSH_TO "rm docs/index.html"

echo Done.
