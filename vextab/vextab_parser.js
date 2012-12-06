/* Jison generated parser */
var vextab_parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"e":3,"vextab":4,"maybe_EOF":5,"EOF":6,"stave":7,"TABSTAVE":8,"maybe_options":9,"maybe_notelist":10,"options":11,"WORD":12,"=":13,"notelist":14,"NOTES":15,"notes":16,"lingo":17,"[":18,"]":19,"line":20,"chord":21,"time":22,":":23,"time_values":24,"maybe_dot":25,"NUMBER":26,"q":27,"w":28,"h":29,"d":30,"frets":31,"maybe_decorator":32,"/":33,"string":34,"|":35,"(":36,"chord_line":37,")":38,"articulation":39,".":40,"timed_fret":41,"-":42,"s":43,"t":44,"b":45,"p":46,"v":47,"V":48,"$accept":0,"$end":1},
terminals_: {2:"error",6:"EOF",8:"TABSTAVE",12:"WORD",13:"=",15:"NOTES",18:"[",19:"]",23:":",26:"NUMBER",27:"q",28:"w",29:"h",30:"d",33:"/",35:"|",36:"(",38:")",40:".",42:"-",43:"s",44:"t",45:"b",46:"p",47:"v",48:"V"},
productions_: [0,[3,2],[5,0],[5,1],[4,1],[4,2],[4,1],[7,3],[9,0],[9,1],[11,3],[11,4],[10,0],[10,1],[14,2],[14,3],[16,1],[16,2],[16,3],[16,4],[16,4],[16,5],[17,1],[17,1],[22,3],[24,1],[24,1],[24,1],[24,1],[25,0],[25,1],[20,4],[20,1],[20,1],[21,4],[21,2],[37,1],[37,3],[31,1],[31,2],[31,4],[41,5],[41,1],[34,1],[39,1],[39,1],[39,1],[39,1],[39,1],[39,1],[32,1],[32,1],[32,0]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
}
},
table: [{3:1,4:2,6:[1,4],7:3,8:[1,5]},{1:[3]},{1:[2,2],5:6,6:[1,8],7:7,8:[1,5]},{1:[2,4],6:[2,4],8:[2,4]},{1:[2,6],6:[2,6],8:[2,6]},{1:[2,8],6:[2,8],8:[2,8],9:9,11:10,12:[1,11],15:[2,8]},{1:[2,1]},{1:[2,5],6:[2,5],8:[2,5]},{1:[2,3]},{1:[2,12],6:[2,12],8:[2,12],10:12,14:13,15:[1,14]},{1:[2,9],6:[2,9],8:[2,9],12:[1,15],15:[2,9]},{13:[1,16]},{1:[2,7],6:[2,7],8:[2,7]},{1:[2,13],6:[2,13],8:[2,13],15:[1,17]},{16:18,17:19,18:[1,20],20:21,21:22,22:24,23:[1,29],26:[1,28],29:[1,34],31:23,35:[1,25],36:[1,26],39:27,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{13:[1,36]},{12:[1,37]},{16:38,17:19,18:[1,20],20:21,21:22,22:24,23:[1,29],26:[1,28],29:[1,34],31:23,35:[1,25],36:[1,26],39:27,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{1:[2,14],6:[2,14],8:[2,14],15:[2,14]},{1:[2,16],6:[2,16],8:[2,16],15:[2,16],16:39,17:19,18:[1,20],19:[2,16],20:21,21:22,22:24,23:[1,29],26:[1,28],29:[1,34],31:23,35:[1,25],36:[1,26],39:27,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{17:40,20:21,21:22,22:24,23:[1,29],26:[1,28],29:[1,34],31:23,35:[1,25],36:[1,26],39:27,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{1:[2,22],6:[2,22],8:[2,22],15:[2,22],18:[2,22],19:[2,22],23:[2,22],26:[2,22],29:[2,22],35:[2,22],36:[2,22],42:[2,22],43:[2,22],44:[2,22],45:[2,22],46:[2,22]},{1:[2,23],6:[2,23],8:[2,23],15:[2,23],18:[2,23],19:[2,23],23:[2,23],26:[2,23],29:[2,23],35:[2,23],36:[2,23],42:[2,23],43:[2,23],44:[2,23],45:[2,23],46:[2,23]},{29:[2,52],32:41,33:[2,52],42:[2,52],43:[2,52],44:[2,52],45:[2,52],46:[2,52],47:[1,42],48:[1,43]},{1:[2,32],6:[2,32],8:[2,32],15:[2,32],18:[2,32],19:[2,32],23:[2,32],26:[2,32],29:[2,32],35:[2,32],36:[2,32],38:[2,32],40:[2,32],42:[2,32],43:[2,32],44:[2,32],45:[2,32],46:[2,32]},{1:[2,33],6:[2,33],8:[2,33],15:[2,33],18:[2,33],19:[2,33],23:[2,33],26:[2,33],29:[2,33],35:[2,33],36:[2,33],38:[2,33],40:[2,33],42:[2,33],43:[2,33],44:[2,33],45:[2,33],46:[2,33]},{20:45,22:24,23:[1,29],26:[1,28],29:[1,34],31:23,35:[1,25],37:44,39:46,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{21:47,23:[1,50],26:[1,51],29:[1,34],36:[1,26],39:49,41:48,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{29:[2,38],33:[2,38],42:[2,38],43:[2,38],44:[2,38],45:[2,38],46:[2,38],47:[2,38],48:[2,38]},{24:52,26:[1,53],27:[1,54],28:[1,55],29:[1,56]},{23:[2,44],26:[2,44],29:[2,44],36:[2,44],42:[2,44],43:[2,44],44:[2,44],45:[2,44],46:[2,44]},{23:[2,45],26:[2,45],29:[2,45],36:[2,45],42:[2,45],43:[2,45],44:[2,45],45:[2,45],46:[2,45]},{23:[2,46],26:[2,46],29:[2,46],36:[2,46],42:[2,46],43:[2,46],44:[2,46],45:[2,46],46:[2,46]},{23:[2,47],26:[2,47],29:[2,47],36:[2,47],42:[2,47],43:[2,47],44:[2,47],45:[2,47],46:[2,47]},{23:[2,48],26:[2,48],29:[2,48],36:[2,48],42:[2,48],43:[2,48],44:[2,48],45:[2,48],46:[2,48]},{23:[2,49],26:[2,49],29:[2,49],36:[2,49],42:[2,49],43:[2,49],44:[2,49],45:[2,49],46:[2,49]},{12:[1,57]},{1:[2,10],6:[2,10],8:[2,10],12:[2,10],15:[2,10]},{1:[2,15],6:[2,15],8:[2,15],15:[2,15]},{1:[2,17],6:[2,17],8:[2,17],15:[2,17],19:[2,17]},{16:59,17:19,18:[1,20],19:[1,58],20:21,21:22,22:24,23:[1,29],26:[1,28],29:[1,34],31:23,35:[1,25],36:[1,26],39:27,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{29:[1,34],33:[1,60],39:61,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{1:[2,50],6:[2,50],8:[2,50],15:[2,50],18:[2,50],19:[2,50],23:[2,50],26:[2,50],29:[2,50],33:[2,50],35:[2,50],36:[2,50],42:[2,50],43:[2,50],44:[2,50],45:[2,50],46:[2,50]},{1:[2,51],6:[2,51],8:[2,51],15:[2,51],18:[2,51],19:[2,51],23:[2,51],26:[2,51],29:[2,51],33:[2,51],35:[2,51],36:[2,51],42:[2,51],43:[2,51],44:[2,51],45:[2,51],46:[2,51]},{38:[1,62],40:[1,63]},{38:[2,36],40:[2,36]},{23:[1,50],26:[1,51],41:48},{1:[2,35],6:[2,35],8:[2,35],15:[2,35],18:[2,35],19:[2,35],23:[2,35],26:[2,35],29:[2,35],35:[2,35],36:[2,35],42:[2,35],43:[2,35],44:[2,35],45:[2,35],46:[2,35]},{29:[2,39],33:[2,39],42:[2,39],43:[2,39],44:[2,39],45:[2,39],46:[2,39],47:[2,39],48:[2,39]},{21:47,29:[1,34],36:[1,26],39:49,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{24:64,26:[1,53],27:[1,54],28:[1,55],29:[1,56]},{29:[2,42],33:[2,42],42:[2,42],43:[2,42],44:[2,42],45:[2,42],46:[2,42],47:[2,42],48:[2,42]},{1:[2,29],6:[2,29],8:[2,29],15:[2,29],18:[2,29],19:[2,29],23:[2,29],25:65,26:[2,29],29:[2,29],30:[1,66],35:[2,29],36:[2,29],38:[2,29],40:[2,29],42:[2,29],43:[2,29],44:[2,29],45:[2,29],46:[2,29]},{1:[2,25],6:[2,25],8:[2,25],15:[2,25],18:[2,25],19:[2,25],23:[2,25],26:[2,25],29:[2,25],30:[2,25],35:[2,25],36:[2,25],38:[2,25],40:[2,25],42:[2,25],43:[2,25],44:[2,25],45:[2,25],46:[2,25]},{1:[2,26],6:[2,26],8:[2,26],15:[2,26],18:[2,26],19:[2,26],23:[2,26],26:[2,26],29:[2,26],30:[2,26],35:[2,26],36:[2,26],38:[2,26],40:[2,26],42:[2,26],43:[2,26],44:[2,26],45:[2,26],46:[2,26]},{1:[2,27],6:[2,27],8:[2,27],15:[2,27],18:[2,27],19:[2,27],23:[2,27],26:[2,27],29:[2,27],30:[2,27],35:[2,27],36:[2,27],38:[2,27],40:[2,27],42:[2,27],43:[2,27],44:[2,27],45:[2,27],46:[2,27]},{1:[2,28],6:[2,28],8:[2,28],15:[2,28],18:[2,28],19:[2,28],23:[2,28],26:[2,28],29:[2,28],30:[2,28],35:[2,28],36:[2,28],38:[2,28],40:[2,28],42:[2,28],43:[2,28],44:[2,28],45:[2,28],46:[2,28]},{1:[2,11],6:[2,11],8:[2,11],12:[2,11],15:[2,11]},{1:[2,18],6:[2,18],8:[2,18],15:[2,18],16:67,17:19,18:[1,20],19:[2,18],20:21,21:22,22:24,23:[1,29],26:[1,28],29:[1,34],31:23,35:[1,25],36:[1,26],39:27,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{19:[1,68]},{26:[1,70],34:69},{23:[1,50],26:[1,51],41:71},{1:[2,52],6:[2,52],8:[2,52],15:[2,52],18:[2,52],19:[2,52],23:[2,52],26:[2,52],29:[2,52],32:72,35:[2,52],36:[2,52],42:[2,52],43:[2,52],44:[2,52],45:[2,52],46:[2,52],47:[1,42],48:[1,43]},{20:73,22:24,23:[1,29],26:[1,28],29:[1,34],31:23,35:[1,25],39:46,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{23:[2,29],25:74,30:[1,66]},{1:[2,24],6:[2,24],8:[2,24],15:[2,24],18:[2,24],19:[2,24],23:[2,24],26:[2,24],29:[2,24],35:[2,24],36:[2,24],38:[2,24],40:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[2,24],46:[2,24]},{1:[2,30],6:[2,30],8:[2,30],15:[2,30],18:[2,30],19:[2,30],23:[2,30],26:[2,30],29:[2,30],35:[2,30],36:[2,30],38:[2,30],40:[2,30],42:[2,30],43:[2,30],44:[2,30],45:[2,30],46:[2,30]},{1:[2,19],6:[2,19],8:[2,19],15:[2,19],19:[2,19]},{1:[2,20],6:[2,20],8:[2,20],15:[2,20],16:75,17:19,18:[1,20],19:[2,20],20:21,21:22,22:24,23:[1,29],26:[1,28],29:[1,34],31:23,35:[1,25],36:[1,26],39:27,42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,35]},{1:[2,31],6:[2,31],8:[2,31],15:[2,31],18:[2,31],19:[2,31],23:[2,31],26:[2,31],29:[2,31],35:[2,31],36:[2,31],38:[2,31],40:[2,31],42:[2,31],43:[2,31],44:[2,31],45:[2,31],46:[2,31]},{1:[2,43],6:[2,43],8:[2,43],15:[2,43],18:[2,43],19:[2,43],23:[2,43],26:[2,43],29:[2,43],35:[2,43],36:[2,43],38:[2,43],40:[2,43],42:[2,43],43:[2,43],44:[2,43],45:[2,43],46:[2,43]},{29:[2,40],33:[2,40],42:[2,40],43:[2,40],44:[2,40],45:[2,40],46:[2,40],47:[2,40],48:[2,40]},{1:[2,34],6:[2,34],8:[2,34],15:[2,34],18:[2,34],19:[2,34],23:[2,34],26:[2,34],29:[2,34],35:[2,34],36:[2,34],42:[2,34],43:[2,34],44:[2,34],45:[2,34],46:[2,34]},{38:[2,37],40:[2,37]},{23:[1,76]},{1:[2,21],6:[2,21],8:[2,21],15:[2,21],19:[2,21]},{26:[1,77]},{29:[2,41],33:[2,41],42:[2,41],43:[2,41],44:[2,41],45:[2,41],46:[2,41],47:[2,41],48:[2,41]}],
defaultActions: {6:[2,1],8:[2,3]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};

  Vex.L("Starting parser.");
/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0: this.begin('notes'); return 15; 
break;
case 1:return 8
break;
case 2:return 12
break;
case 3:return 33
break;
case 4:return 42
break;
case 5:return '+'
break;
case 6:return 23
break;
case 7:return 13
break;
case 8:return 36
break;
case 9:return 38
break;
case 10:return 18
break;
case 11:return 19
break;
case 12:return 35
break;
case 13:return 40
break;
case 14:return 45
break;
case 15:return 43
break;
case 16:return 29
break;
case 17:return 46
break;
case 18:return 44
break;
case 19:return 27
break;
case 20:return 28
break;
case 21:return 29
break;
case 22:return 30
break;
case 23:return 47
break;
case 24:return 48
break;
case 25:return 26
break;
case 26: this.begin('INITIAL'); 
break;
case 27:/* skip whitespace */
break;
case 28:return 6
break;
case 29:return 'INVALID'
break;
}
};
lexer.rules = [/^(?:notes\b)/,/^(?:tabstave\b)/,/^(?:[^\s=]+)/,/^(?:\/)/,/^(?:-)/,/^(?:\+)/,/^(?::)/,/^(?:=)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\|)/,/^(?:\.)/,/^(?:[b])/,/^(?:[s])/,/^(?:[h])/,/^(?:[p])/,/^(?:[t])/,/^(?:[q])/,/^(?:[w])/,/^(?:[h])/,/^(?:[d])/,/^(?:[v])/,/^(?:[V])/,/^(?:[0-9]+)/,/^(?:[\r\n]+)/,/^(?:\s+)/,/^(?:$)/,/^(?:.)/];
lexer.conditions = {"notes":{"rules":[0,1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29],"inclusive":true},"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,26,27,28,29],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = vextab_parser;
exports.Parser = vextab_parser.Parser;
exports.parse = function () { return vextab_parser.parse.apply(vextab_parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    var source, cwd;
    if (typeof process !== 'undefined') {
        source = require('fs').readFileSync(require('path').resolve(args[1]), "utf8");
    } else {
        source = require("file").path(require("file").cwd()).join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}