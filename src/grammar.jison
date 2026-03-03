/* Lexer */
%lex
%%
\s+                                                 { /* skip whitespace */;      }
\/\/.*                                              { /* skip comment */;         }
\(                                                  { return 'LEFT_PARENTHESIS';  }
\)                                                  { return 'RIGHT_PARENTHESIS'; }
[0-9]+(\.[0-9]+)?([eE][-+][0-9]+)?                  { return 'NUMBER';            }
"**"                                                { return 'OPOW';              }
[*/]                                                { return 'OPMU';              }
[-+]                                                { return 'OPAD';              }
<<EOF>>                                             { return 'EOF';               }
.                                                   { return 'INVALID';           }
/lex

/* Parser */
%start expressions
%token NUMBER
%token LEFT_PARENTHESIS
%token RIGHT_PARENTHESIS
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
    : parenthesis_or_number OPOW expression_pow
        { $$ = operate($OPOW, $parenthesis_or_number, $expression_pow); }
    | parenthesis_or_number 
        { $$ = $parenthesis_or_number; }
    ;

parenthesis_or_number
    : NUMBER
        { $$ = Number(yytext); }
    | LEFT_PARENTHESIS expression RIGHT_PARENTHESIS
        { $$ = $expression; }
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
