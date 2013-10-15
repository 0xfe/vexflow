# Rakefile for VexFlow
# Copyright 2013 Mohit Cheppudira <mohit@muthanna.com>

require 'bundler/setup'
require 'fileutils'
require 'rake/testtask'
require 'Time'
require 'erb'
require 'uglifier'

DIR = File.dirname(__FILE__)
TARGET_DIR = "build/vexflow"
TARGET = "#{TARGET_DIR}/vexflow-min.js"

BUILD_VERSION = "1.2 Custom"
BUILD_PREFIX = "0xFE"
BUILD_DATE = Time.now()
BUILD_COMMIT = `git rev-list --max-count=1 HEAD`.chomp

directory TARGET_DIR
directory 'build/tests'
directory 'build/tests/support'

# Ordered list of Vexflow source files. If you have dependencies
# between files, order them here.
base_sources = [
  "src/vex.js",
  "src/flow.js",
  "src/fraction.js",
  "src/tables.js",
  "src/fonts/vexflow_font.js",
  "src/glyph.js",
  "src/stave.js",
  "src/tabstave.js",
  "src/tickable.js",
  "src/note.js",
  "src/modifier.js",
  "src/modifiercontext.js",
  "src/stavemodifier.js",
  "src/music.js",
  "src/stavetie.js",
  "src/tabtie.js",
]

# Don't minify these files.
reject = [
  "src/header.js"
]

js_files = Dir.glob('src/*.js')
js_files.reject! {|file| base_sources.include?(file)}
js_files.reject! {|file| reject.include?(file)}
vexflow_sources = base_sources + js_files

# Creates a rake task named "name" to copy files
# from "path_glob" to "dest_dir"
def copy_path(path_glob, dest_dir, name)
  FileList[path_glob].each do |source|
    target = "#{dest_dir}/#{File.basename(source)}"
    file target => [source, dest_dir] do
      if not File.directory? source
        cp source, target, :verbose => true
      end
    end

    desc "Copy data in: #{path_glob}"
    task name => target
  end
end

# Rake task to compile and minify VexFlow.
file TARGET => vexflow_sources  do
  # Fill fields in header
  header = ERB.new(File.read("src/header.js")).result(binding)
  File.open(TARGET, "w") do |f|
    f.write header

    vexflow_sources.each do |file|
      puts "Minifying: " + file
      min = Uglifier.new(
        {:output =>
          {:comments => :none}
        }).compile(File.read(file))
      f.write(min)
    end
  end

  puts "Generated: " + TARGET
end

copy_path("tests/*", "build/tests", :build_copy)
copy_path("tests/support/*", "build/tests/support", :build_copy)

task :clean do
  sh 'rm -rf build'
end

task :make => [:build_copy, TARGET_DIR, TARGET]

task :default => [:make]
