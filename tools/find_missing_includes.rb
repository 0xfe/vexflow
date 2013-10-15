#!/usr/bin/ruby

# VexFlow - Copyright Mohit Muthanna Cheppudira 2012
#
# This script verifies that the .js files in /src are included in all the
# right places, e.g., SCons rules, HTML files, etc.

require 'pp'

SRCDIR = "../src"
HTML_FILES = [
  "../tests/flow.html"

  # Might not need these anymore.
  # "../docs/tutorial.html",
  # "../docs/sandbox.html"
]

unless File.exists?(SRCDIR)
  puts "This script needs to be run from the tools/ directory."
  exit 1
end

# Extract all .js files in src/ (non recursive)
files = Dir.glob("#{SRCDIR}/*.js").map { |f| f.gsub(SRCDIR + "/", "")}

# Work through HTML files and print out missing includes
HTML_FILES.each do |html|
  test_includes = File.readlines(html).
                       grep(/^.*script\ssrc.*\.\.\/src.*\.js.*/).
                       map { |f| f.chomp.gsub(/^.*"(.+)".*$/, '\1').
                           gsub(SRCDIR + "/", "") }

  puts "\nFiles in #{SRCDIR} but not in #{html}:"
  pp files - test_includes
end
