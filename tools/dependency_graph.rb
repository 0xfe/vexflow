#!/usr/bin/env ruby
#
# Draw dependency graph of VexFlow classes.
#
# $ brew install graphviz
# $ ./dependency_graph.rb | dot -Tpdf -o graph.pdf

require 'optparse'
require 'pp'

$options = {
    inheritance: true,
    dependencies: true,
}

OptionParser.new do |opts|
  opts.banner = "Usage: dependency_graph.rb [options]"
  opts.on("-i", "--inheritance", "Show inheritance graph only") do
    $options[:dependencies] = false
  end
  opts.on("-d", "--dependencies", "Show dependency graph only") do
    $options[:inheritance] = false
  end
end.parse!

# pp $options

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
    next if file =~ /smufl.js$/;

    f.each_line do |line|
        if line =~ /export\s+class\s+(\S+)\s*{/
            puts "  #{$1} [color = burlywood3, fontcolor = coral3];"
            parent = $1
        end
        if line =~ /export\s+class\s+(\S+)\s+extends\s+(\S+)\s*{/
            puts "  #{$1} [color = burlywood3, fontcolor = coral3];"
            parent = $1
            inherits = $2
        end
        if line =~ /import\s+{\s*(\S+)\s*} from/
            next if $1 == "Vex"
            next if $1 == "Flow"
            uses << $1
        end

        # Old JS syntax: remove after all files cleaned up
        if line =~ /export\s+var\s+(\S+)\s*=\s*\(\s*function/
            puts "  #{$1} [color = burlywood3, fontcolor = coral3];"
            parent = $1
        end
        if line =~ /Vex.Inherit\s*\(([^,]+),\s*([^\s,]+)/
            inherits = $2
        end
    end

    uses.each do |child|
        puts "  #{parent} -> #{child} [color = cadetblue];" if (child != inherits) && $options[:dependencies]
    end

    puts "  #{parent} -> #{inherits} [color = burlywood3];" if (inherits != "")  && $options[:inheritance] 
end
puts "}"
