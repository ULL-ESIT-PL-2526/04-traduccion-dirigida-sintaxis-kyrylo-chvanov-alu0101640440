# Práctica de laboratorio #4. Traducción dirigida por la sintaxis: léxico

El objetivo de esta práctica es implementar una calculadora mediante traducción dirigida por la sintaxis (SDD) 
usando Jison. Se parte de una gramática independiente del contexto para expresiones aritméticas con tokens 
`number` y `op`, y de una definición dirigida por la sintaxis que asocia el atributo `value` a cada símbolo 
para calcular el resultado durante el análisis. El contexto incluye el uso del generador de analizadores Jison 
(lexer + parser), la integración con Node.js y la verificación con Jest.

## Desarrollo

### 1. Configuración del proyecto y ejecución

**1.1.** Se instalaron las dependencias del proyecto con `npm i`, de modo que quedan disponibles Jison
(generador del parser) y Jest (entorno de pruebas).

**1.2.** Se generó el parser ejecutando `npx jison src/grammar.jison -o src/parser.js`. 
Este comando toma la especificación léxica y gramatical de `grammar.jison` y produce el 
módulo `src/parser.js` que exporta la función `parse` utilizada por la aplicación y por los tests.

**1.3.** Se ejecutaron las pruebas con `npm test`. La configuración de Jest está en `package.json`
(atributo `"jest"` y dependencia de desarrollo), y las pruebas se encuentran en `__tests__/parser.test.js`.

### 2. Especificación del analizador léxico (bloque %lex)

En Jison, la parte del fichero que define los tokens corresponde al **analizador léxico (lexer)** y va dentro
del bloque `%lex`. Cada regla tiene un patrón y una acción (por ejemplo, devolver un token o no devolver nada).

**2.1. Diferencia entre "skip whitespace" y devolver un token**

- **`/* skip whitespace */`**: La regla `\s+` hace que el lexer *consuma* los caracteres de espacio en blanco
(espacios, tabulaciones, etc.) pero **no devuelve ningún token**. El lexer sigue leyendo la entrada y busca el 
siguiente lexema. Así el espacio no llega al parser y no forma parte de la gramática.

- **Devolver un token**: Cuando una regla hace `return 'NUMBER'`, `return 'OP'`, etc., el lexer **devuelve un 
token** al parser. Ese token (y opcionalmente su valor léxico) se usa en el análisis sintáctico. Devolver un 
token es necesario para todo lo que la gramática debe reconocer (números, operadores, fin de entrada, etc.).

En resumen: "skip" solo avanza en la entrada; "devolver un token" informa al parser de que se ha reconocido un 
símbolo terminal.

**2.2. Secuencia exacta de tokens para la entrada `123**45+@`**

Suponiendo el lexer del enunciado (con `[0-9]+`, `"**"`, `[-+*/]`, etc.), la secuencia de tokens es:

1. **NUMBER** (lexema `123`)
2. **OP** (lexema `**`)
3. **NUMBER** (lexema `45`)
4. **OP** (lexema `+`)
5. **INVALID** (lexema `@`)

Ya que el lexer no reconoce el lexema `@`, se devuelve el token `INVALID` y el parser lanza un error.

**2.3. Por qué `**` debe aparecer antes que `[-+*/]`**

El lexer suele aplicar la regla que **más caracteres consume** (maximal munch). Si `[-+*/]` estuviera antes 
que `"**"`, al leer `**` se reconocería primero un solo `*` como `OP` y quedaría otro `*` para la siguiente 
llamada, dando dos tokens `OP` en lugar del operador de exponenciación. Colocando `"**"` antes que `[-+*/]` se 
asegura que los dos caracteres `*` se reconozcan juntos como un único token `OP` (exponenciación), que es lo 
que se desea para  la calculadora.

**2.4. Cuándo se devuelve EOF**

Se devuelve **EOF** cuando el lexer llega al **final del flujo de entrada**, es decir, cuando no
queda más texto que leer.

**2.5. Por qué existe la regla `.` que devuelve INVALID**

La regla `.` coincide con **cualquier carácter** que no haya sido reconocido por ninguna regla anterior. 
Así, caracteres no permitidos (letras, `@`, `#`, etc.) se reconocen explícitamente como token **INVALID**. 
Sin esta regla, esos caracteres no  coincidirían con ningún patrón y el lexer podría entrar en un estado de 
error o comportamiento indefinido. Devolver INVALID permite que el parser reciba un token definido y pueda 
fallar de forma controlada (por ejemplo, error de sintaxis), en lugar de dejar el analizador en un estado 
inconsistente.

### 3. Comentarios de una línea con `//`

Se modificó el analizador léxico en `grammar.jison` para **ignorar comentarios de una línea** que empiezan por 
`//`. Se añadió la regla:

- `\/\/.*` → se asocia a la acción que **ignora** los comentarios de una línea (/* skip comment */).

### 4. Números en punto flotante

Se modificó el analizador léxico para reconocer **números en punto flotante** con los formatos indicados en el 
enunciado. La definición del token NUMBER se amplió con una expresión regular que permite:

- Enteros: `[0-9]+`
- Parte decimal opcional: `(\.[0-9]+)?`
- Exponente opcional con signo: `([eE][-+][0-9]+)?`

Con ello se reconocen ejemplos como: `23`, `2.35`, `2.35e-3`, `2.35e+3`, `2.35E-3`, etc. El valor numérico se 
obtiene en el parser con `Number(yytext)` (equivalente a la función `convert` del enunciado), que interpreta 
correctamente todos estos formatos. La operación de exponenciación en la calculadora usa `**` (y `Math.pow` en 
la implementación), en lugar del símbolo `↑` del enunciado.

### 5. Pruebas añadidas

Se añadieron pruebas en `__tests__/parser.test.js` para las extensiones del lexer:

- **Comentarios**: En la sección "Student additions" hay tests que comprueban que se ignoran comentarios de una 
línea (`// ...`), tanto al final de una expresión (`1 - 2 // hello`, `10 - 4 - 3 //`) como en líneas que son 
solo comentario (`// Cool comment`, `//`). Se espera que se produzca un error incluso si solo hay un comentario
pero no hay ninguna expresión.
- **Punto flotante**: Tests que comprueban números con decimales (`2.0`), notación científica con `e` y `E` y 
signo en el exponente (`43.2e-1`, `5E+3`, `5e+3`, `50e-1`, `230E-1`), y que las operaciones aritméticas con 
estos números dan el resultado correcto (usando `toBeCloseTo` cuando hay comparaciones con decimales).

Con ello se verifica que las modificaciones del analizador léxico (comentarios y números en punto flotante) se 
integran bien con el parser y la SDD.

## Resultados

Se ha configurado el proyecto (dependencias, generación del parser con Jison y ejecución de Jest) y se ha 
descrito la especificación del analizador léxico del fichero `grammar.jison`, respondiendo a las preguntas 
sobre la diferencia entre omitir espacios y devolver tokens, la secuencia de tokens para `123**45+@`, el orden 
de las reglas `**` y `[-+*/]`, el uso de EOF y el papel del token INVALID. Además, se ha documentado cómo se 
extendió el lexer para comentarios de una línea (`//`) y para números en punto flotante (incluyendo notación 
científica), y cómo se han añadido pruebas en Jest para ambas extensiones. La solución implementada incluye una 
calculadora que evalúa expresiones aritméticas (incluyendo exponenciación con `**`) con números enteros y en 
punto flotante, ignorando espacios y comentarios, y las pruebas cubren casos básicos, precedencia, 
asociatividad, expresiones complejas, casos límite y las nuevas funcionalidades léxicas.
