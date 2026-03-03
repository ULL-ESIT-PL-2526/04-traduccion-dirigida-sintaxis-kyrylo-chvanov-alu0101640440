/* Lexer */
%lex
%%
\s+                                                 { /* skip whitespace */; }
\/\/.*                                              { /* skip comment */;    }
[0-9]+(\.[0-9]+)?([eE][-+][0-9]+)?                  { return 'NUMBER';       }
"**"                                                { return 'OPOW';         }
[*/]                                                { return 'OPMU';         }
[-+]                                                { return 'OPAD';         }
<<EOF>>                                             { return 'EOF';          }
.                                                   { return 'INVALID';      }
/lex

/* Parser */
%start expressions
%token NUMBER
%%

expressions
    : expression EOF
        { return $expression; }
    ;

expression
    : expression OPAD $expression_mu
        { $$ = operate($OPAD, $expression, $expression_mu); }
    | expression_mu
        { $$ = $expression_mu; }
    ;

expression_mu
    : expression_mu OPMU expression_pow
        { $$ = operate($OPMU, $expression_mu, $expression_pow); }
    | expression_pow
        { $$ = $expression_pow; }
    ;

expression_pow
    : term OPOW expression_pow
        { $$ = operate($OPOW, $term, $expression_pow); }
    | term
        { $$ = $term; }
    ;

term
    : NUMBER
        { $$ = Number(yytext); }
    ;
%%

function operate(op, left, right) {
    switch (op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
        case '**': return Math.pow(left, right);
    }
}
