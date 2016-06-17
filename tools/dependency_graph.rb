#!/usr/bin/env ruby
#
# Draw dependency graph of VexFlow classes.
#
# $ brew install graphviz
# $ ./dependency_graph.rb | dot -Tpdf -o graph.pdf

puts "digraph G {"
puts "  node[fontname=Arial,fontsize=10]"
puts "  graph[rankdir=LR]"
Dir.glob("../src/*.js").each do |file|
    f = File.open(file, "r")
    
    uses = []
    inherits = ""
    parent = file
    next if file =~ /index.js$/;
    next if file =~ /tables.js$/;
    next if file =~ /vex.js$/;

    f.each_line do |line|
        if line =~ /export\s+var\s+(\S+)\s*=\s*\(\s*function/
            puts "  #{$1} [color = burlywood3, fontcolor = coral3];"
            parent = $1
        end
        if line =~ /import\s+{\s*(\S+)\s*} from/
            next if $1 == "Vex"
            next if $1 == "Flow"
            next if $1 == "Font"
            uses << $1
        end
        if line =~ /Vex.Inherit\s*\(([^,]+),\s*([^\s,]+)/
            inherits = $2
        end
    end

    uses.each do |child|
        puts "  #{parent} -> #{child} [color = cadetblue];" if child != inherits
    end

    puts "  #{parent} -> #{inherits} [color = burlywood3];" if inherits != "" 
end
puts "}"