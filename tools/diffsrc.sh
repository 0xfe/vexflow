#!/bin/bash

a=`mktemp -t vexflow`
b=`mktemp -t vexflow`

srcdir=../src
cwd=`pwd`

cd $srcdir
cat $srcdir/SConstruct | egrep '^ +.*js.*' | perl -pe 's/.*"(.+)",/$1/;' \
      | sort >a
ls *.js | sort >b
diff a b
rm a b
cd $cwd
