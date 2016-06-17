#!/usr/bin/env ruby
#
# Draw inheritance graph of VexFlow classe.
#
# $ brew install graphviz
# $ ./graph.rb | dot -Tpdf -o graph.pdf
#
# Convert to PNG
# $ brew install imagemagick ghostscript
# $ convert -density 300 graph.pdf -resize 25% graph.png

puts "digraph G {"
puts '  graph[rankdir=LR]'
puts "  node[fontname=Arial,fontsize=10]"
Dir.glob("../src/*.js").each do |file|
    f = File.open(file, "r")
    f.each_line do |line|
    if line =~ /export\s+var\s+(\S+)\s*=\s*\(\s*function/
            puts "  #{$1};"
        end
        if line =~ /Vex.Inherit\s*\(([^,]+),\s*([^\s,]+)/
            child = $1
            parent = $2.gsub(/Vex\.Flow\./, "")
            puts "  #{child} -> #{parent};"
        end
    end
end
puts "}"