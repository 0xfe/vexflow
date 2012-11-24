#!/usr/bin/ruby

# VexFlow - Copyright Mohit Muthanna Cheppudira 2012
#
# Look for >80 lines and hard tabs.

SRCDIR = "../src"
DIRS = [ "../src/*.js", "../vextab/*.js" ]

unless File.exists?(SRCDIR)
  puts "This script needs to be run from the tools/ directory."
  exit 1
end

DIRS.each do |dir|
  files = Dir.glob(dir)
  files.each do |file|
    line = 0
    File.read(file).each_line do |l|
      line += 1
      puts "#{file}:#{line} -- #{l.length}" if l.length > 80
    end
  end
end
