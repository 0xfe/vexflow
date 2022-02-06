#!/usr/bin/env ruby
#
# Draw dependency graphs of VexFlow classes.
#   brew install graphviz
#   ./dependency_graph.rb | dot -T pdf -o graph.pdf
#   ./dependency_graph.rb --dependencies | dot -T svg -o graph_dependencies.svg
#   ./dependency_graph.rb --inheritance  | dot -T png -o graph_inheritance.png

# If you have dependency cruiser installed, you can make a graph that highlights edges on mouse hover:
#   npm install -g dependency-cruiser
#   ./dependency_graph.rb | dot -T svg | depcruise-wrap-stream-in-html > graph.html
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


folder_name = "../src/"
# Uncomment the following line to start from the VexFlow entry files.
# folder_name = "../entry/"

files = folder_name + "*.ts"

puts "digraph G {"
puts "  graph[rankdir=LR]"
# puts "  graph[splines=spline]"
puts "  graph[splines=polyline]"
puts "  node[fontname=Arial, fontsize=12, shape=oval]"
Dir.glob(files).each do |file|
  f = File.open(file, "r")
  
  uses = []
  inherits = ""
  parent = file.gsub(folder_name, "")

  # Skip these files.
  next if file =~ /index.ts$/;
  next if file =~ /tables.ts$/;
  next if file =~ /flow.ts$/;
  next if file =~ /vex.ts$/;
  next if file =~ /typeguard.ts$/;

  f.each_line do |line|
    if line =~ /export\s+.*?class\s+(\S+)/
      puts "  #{$1} [color = burlywood3, fontcolor = coral3];"
      parent = $1
    end
    if line =~ /\s+extends\s+(\S+)\s*{/
      puts "  #{$1} [color = burlywood3, fontcolor = coral3];"
      inherits = $1
    end
    # import { A, B, C } from './hello';
    # import { X } from './goodbye';
    if line =~ /^import\s+{\s*(.+?)\s*} from/
      classes_imported = $1.split(/\s*,\s*/)
      classes_imported.each do |c|
        next if c == "Category" # Skip Category because it is a const enum that is erased during compilation.
        next if c == "Tables"
        next if c == "RuntimeError" 
        next if c[0] == c[0].downcase # Ignore function imports (which start with a lowercase letter).
        uses << c
      end
    end
  end

  # draw the lines / edges of the graph
  uses.each do |child|
      puts "  \"#{parent}\" -> #{child} [color = cadetblue];" if (child != inherits) && $options[:dependencies]
  end

  puts "  \"#{parent}\" -> #{inherits} [color = burlywood3, penwidth=2];" if (inherits != "")  && $options[:inheritance] 
end
puts "}"
