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
%left OPAD
%left OPMU
%right UPLUSMINUS
%right OPOW
%%

expressions
    : expression EOF
        { return $expression; }
    ;

expression
    : expression OPAD expression
        { $$ = operate($OPAD, $1, $3); }
    | expression OPMU expression
        { $$ = operate($OPMU, $1, $3); }
    | expression OPOW expression
        { $$ = operate($OPOW, $1, $3); }
    | OPAD expression %prec UPLUSMINUS
        { $$ = operate($OPAD, 0, $2)}
    | term
        { $$ = $term; }
    ;

term
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
        case '/': {
            if (right === 0) {
                throw new Error('Invalid dividend');    
            }
            return left / right;
        }
        case '**': return Math.pow(left, right);
    }
}
