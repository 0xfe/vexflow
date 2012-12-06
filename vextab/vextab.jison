/*
  LALR(1) Grammar for VexTab
  Mohit Cheppudira <mohit@muthanna.com>

  Process with Jison: http://zaach.github.com/jison/

  Note: This file is new. The current parser in vextab.js is
  a hand-rolled recursive descent parser.
*/

%lex
%s notes
%%

"notes"               { this.begin('notes'); return 'NOTES'; }
"tabstave"            return 'TABSTAVE'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
":"                   return ':'
"="                   return '='
"("                   return '('
")"                   return ')'
"["                   return '['
"]"                   return ']'
"#"                   return '#'
"|"                   return '|'
"."                   return '.'
"v"                   return 'v'
"V"                   return 'V'

/* These are valid inside fret/string expressions only */
<notes>[b]            return 'b'
<notes>[s]            return 's'
<notes>[h]            return 'h'
<notes>[p]            return 'p'
<notes>[t]            return 't'
<notes>[q]            return 'q'
<notes>[w]            return 'w'
<notes>[h]            return 'h'
<notes>[d]            return 'd'
<notes>[0-9]+         return 'NUMBER'

/* New lines reset your state */
[\r\n]+               { this.begin('INITIAL'); }
<INITIAL>[a-zA-Z#/0-9]+\b      return 'WORD'
\s+                   /* skip whitespace */
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%start e

%%

e:
  vextab maybe_EOF
  ;

maybe_EOF
  :
  | EOF
  ;

vextab
  : stave
  | vextab stave
  | EOF
  ;

stave
  : TABSTAVE
  | TABSTAVE options
  | TABSTAVE notelist
  | TABSTAVE options notelist
  ;

options
  : WORD '=' WORD
  | options WORD '=' WORD
  ;

notelist
  : NOTES notes
  | notelist NOTES notes
  ;

notes
  : lingo
  | lingo notes
  | '[' lingo ']'
  | '[' lingo ']' notes
  | '[' lingo notes ']'
  | '[' lingo notes ']' notes
  ;

lingo
  : line
  | chord
  ;

time
  : ':' time_values maybe_dot
  ;

time_values
  : NUMBER
  | 'q'
  | 'w'
  | 'h'
  ;

maybe_dot
  :
  | 'd'
  ;

line
  : frets decorator '/' string
  | time
  | '|'
  ;


chord
  : '(' chord_line ')' decorator
  | articulation chord
  ;

chord_line
  : line
  | chord_line '.' line
  ;

frets
  : NUMBER
  | articulation timed_fret
  | frets articulation timed_fret
  ;

timed_fret
  : ':' time_values ':' NUMBER
  |  NUMBER
  ;

string
  : NUMBER
  ;

articulation
  : '-'
  | 's'
  | 't'
  | 'b'
  | 'h'
  | 'p'
  ;

decorator
  : 'v'
  | 'V'
  |
  ;
