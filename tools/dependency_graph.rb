#!/usr/bin/env ruby
#
# Draw dependency graph of VexFlow classe.
#
# $ brew install graphviz
# $ ./graph.rb | dot -Tpdf -o graph.pdf
# $ ./graph.rb | dot -Tpng -o graph.png
#
# Convert to PNG
# $ brew install imagemagick ghostscript
# $ convert -density 300 graph.pdf -resize 25% graph.png

puts "digraph G {"
puts "  node[fontname=Arial,fontsize=10]"
Dir.glob("../src/*.js").each do |file|
    f = File.open(file, "r")
    
    children = []
    parent = file
    next if file =~ /index.js$/;
    next if file =~ /tables.js$/;

    f.each_line do |line|
        if line =~ /export\s+var\s+(\S+)\s*=\s*\(\s*function/
            puts "  #{$1};"
            parent = $1
        end
        if line =~ /import\s+{\s*(\S+)\s*} from/
            next if $1 == "Vex"
            next if $1 == "Flow"
            children << $1
        end
    end

    children.each do |child|
        puts "  #{parent} -> #{child};"
    end
end
puts "}"