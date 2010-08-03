"""
VexFlow / TabDiv Build Script
Requires: SCons, Git, and Google Closure Compiler

Copyright Mohit Muthanna Cheppudira 2010
"""

from vexflow_scons import *

# Create debug, opt, and licensed construction environments.

env = default_env.Clone(VEX_VERSION = "1.0-pre2")

# Create build directories and attach cleanup handlers to them

mkdir_with_cleanup("build", env)
mkdir_with_cleanup("build/vexflow", env)
mkdir_with_cleanup("build/tabdiv", env)

dbg = env.Clone(
    JS_DEFINES = {
      "Vex.Debug": "true",
      "Vex.LogLevel": "4"
    });

opt = env.Clone(
    VEX_BUILD_PREFIX = "prod-2",
    JS_DEFINES = {
      "Vex.Debug": "false",
      "Vex.LogLevel": "4"
    });

# Export construction environments to SConscripts
Export("dbg opt")

# Build VexFlow
SConscript("src/SConstruct", variant_dir="build/vexflow", duplicate=0)

# Build TabDiv
SConscript("tabdiv/SConstruct", variant_dir="build/tabdiv", duplicate=0)

# Create Zip archives for distribution

Zip("build/tabdiv-free.zip",
      ["build/vexflow/vexflow-free.js",
       "build/tabdiv/vextabdiv-free.js",
       "tabdiv/tabdiv.css"])

# Copy over tests for distribution

cpdir_with_cleanup("build/tests", "tests", env)
cpdir_with_cleanup("build/vextab", "vextab", env)
