#!/usr/bin/env ruby
#
# Draw dependency graph of VexFlow classe.
#
# $ brew install graphviz
# 

puts " digraph G {"
Dir.glob("*.js").each do |file|
    f = File.open(file, "r")
    f.each_line do |line|
        if line =~ /Vex.Inherit\s*\(([^,]+),\s*([^\s,]+)/
            child = $1
            parent = $2.gsub(/Vex\.Flow\./, "")
            puts "  #{child} -> #{parent};"
        end
    end
end
puts "}"