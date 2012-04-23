#!/usr/bin/env ruby -w

# VexFlow - Copyright Mohit Muthanna Cheppudira 2012
#
# This script verifies that the .js files in /src are included in all the
# right places, e.g., SCons rules, HTML files, etc.

require 'pp'

SRCDIR = "../src"
SCONSTRUCT = "#{SRCDIR}/SConstruct"
HTML_FILES = [
  "../tests/flow.html", "../docs/tutorial.html",
  "../tabdiv/playground.html", "../tabdiv/tutorial.html",
  "../tabdiv/vextab.html" ]

unless File.exists?(SRCDIR)
  puts "This script needs to be run from the tools/ directory."
  exit 1
end

# Extract .js files from SCONSTRUCT
includes = File.readlines(SCONSTRUCT).
                grep(/^\s+.*\.js.*/).
                map { |f| f.chomp.gsub(/^.*"(.+)".*$/, '\1') }

# Extract all .js files in src/
files = Dir.glob("#{SRCDIR}/*.js").map { |f| f.gsub(SRCDIR + "/", "")}


puts "Files in #{SCONSTRUCT} but not in #{SRCDIR}:"
pp includes - files

puts "\nFiles in #{SRCDIR} but not in #{SCONSTRUCT}:"
pp files - includes


# Work through HTML files and print out missing includes
HTML_FILES.each do |html|
  test_includes = File.readlines(html).
                       grep(/^.*script\ssrc.*\.\.\/src.*\.js.*/).
                       map { |f| f.chomp.gsub(/^.*"(.+)".*$/, '\1').gsub(SRCDIR + "/", "") }

  puts "\nFiles in #{SRCDIR} but not in #{html}:"
  pp files - test_includes
end
