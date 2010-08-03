"""
VexFlow / TabDiv Build Script
Requires: SCons, Git, and Google Closure Compiler

Copyright Mohit Cheppudira 2010
"""

import os
from datetime import datetime
from SCons.Script import *

"""
Make the default zip action use the external zip command. Also
add -j (--junk-paths) to the command to store only the name of the
file and strip out the directory name.
"""
DefaultEnvironment(ZIPCOM = "zip -r -j $TARGET $SOURCES")

default_env = Environment(
    VEX_BUILD_PREFIX = "debug-4",
    VEX_VERSION = "1.0-pre",
    VEX_BUILD_DATE = str(datetime.now()),
    JAVA = "java",
    JS_COMPILER = "support/compiler.jar",
    JS_DEFINES = {},
    JS_COMPILATION_LEVEL = "SIMPLE_OPTIMIZATIONS",
    ENV = os.environ)

def js_builder(target, source, env):
  """ A JavaScript builder using Google Closure Compiler. """

  cmd = env.subst(
      "$JAVA -jar $JS_COMPILER --compilation_level $JS_COMPILATION_LEVEL");

  # Add defines to the command
  for define in env['JS_DEFINES'].keys():
    cmd += " --define=\"%s=%s\"" % (define, env['JS_DEFINES'][define])

  # Add the source files
  for file in source:
    cmd += " --js " + str(file)

  # Add the output file
  cmd += " --js_output_file " + str(target[0])

  # Log the command and run
  print env.subst(cmd)
  os.system(env.subst(cmd))

def vexflow_stamper(target, source, env):
  """ A Build Stamper for VexFlow """

  cmd =  "sed "
  cmd += " -e s/__VEX_BUILD_PREFIX__/$VEX_BUILD_PREFIX/"
  cmd += " -e s/__VEX_VERSION__/$VEX_VERSION/"
  cmd += ' -e "s/__VEX_BUILD_DATE__/${VEX_BUILD_DATE}/"'
  cmd += " -e s/__VEX_GIT_SHA1__/`git rev-list --max-count=1 HEAD`/ "
  cmd += ("%s > %s" % (source[0], target[0]))

  print env.subst(cmd)
  os.system(env.subst(cmd))

"""
Add our custom builders to the environment.
"""
default_env.Append(
    BUILDERS = {'JavaScript': Builder(action = js_builder),
                'VexFlowStamp': Builder(action = vexflow_stamper)})

def build_and_stamp(target, sources, env):
  """
  A helper command to build the javascript output and stamp
  the header files.
  """

  pre_node = env.JavaScript(target + ".pre", sources)
  final_node = env.VexFlowStamp(target, pre_node)
  return final_node

def mkdir_with_cleanup(dirname, env):
  """
  Helper function to create directories and attach cleanup
  handlers. This is the only way to get implicitly created directories
  cleaned up.
  """
  dir = env.subst(dirname)
  t = Command(dir, [], Mkdir("$TARGET"))
  Clean(t, dir) # Cleanup handler

def cpdir_with_cleanup(targetdirname, srcdirname, env):
  """
  Helper function to copy directories and attach cleanup
  handlers. This is the only way to get implicitly created directories
  cleaned up.
  """
  targetdir = env.subst(targetdirname)
  srcdir = env.subst(srcdirname)
  t = Command(targetdir, srcdir, Copy("$TARGET", "$SOURCE"))
  Clean(t, targetdir)
