# Práctica 5: Traducción Dirigida por la Sintaxis: Gramática

Esta práctica tiene como objetivo aplicar la **traducción dirigida por la sintaxis (SDD)** para
implementar con Jison una calculadora aritmética sencilla. A partir de una gramática anotada con
reglas semánticas, se construye un analizador capaz de evaluar expresiones con números enteros
y en punto flotante.

El contexto de la práctica parte del repositorio utilizado en la práctica anterior, que ya contenía
una implementación básica en Jison para una calculadora. En esta sesión de laboratorio se
profundiza en:

- **Definir y analizar** la SDD original y sus limitaciones respecto a precedencia y asociatividad.
- **Modificar la gramática** para respetar los convenios matemáticos habituales.
- **Extender el lenguaje** con soporte completo para números en punto flotante y expresiones
  entre paréntesis.
- **Validar el comportamiento** mediante un conjunto de tests automáticos con Jest.

## Desarrollo

### 1. Partiendo de la gramática y las siguientes frases 4.0-2.0*3.0, 2\*\*3\*\*2 y 7-4/2:

#### 1.1. Escriba la derivación para cada una de las frases

- **4.0-2.0\*3.0**:  
  $$L \Rightarrow E\,\text{eof} \Rightarrow E * T\,\text{eof} \Rightarrow E * 3.0\,\text{eof} \Rightarrow E - T * 3.0\,\text{eof} \Rightarrow E - 2.0 * 3.0\,\text{eof} \Rightarrow T - 2.0 * 3.0\,\text{eof} \Rightarrow 4.0 - 2.0 * 3.0\,\text{eof}$$

- **2\*\*3\*\*2**:  
  $$L \Rightarrow E\,\text{eof} \Rightarrow E\,\text{**}\ T\,\text{eof} \Rightarrow E\,\text{**}\ 2\,\text{eof} \Rightarrow E\,\text{**}\ T\,\text{**}\ 2\,\text{eof} \Rightarrow E\,\text{**}\ 3\,\text{**}\ 2\,\text{eof} \Rightarrow T\,\text{**}\ 3\,\text{**}\ 2\,\text{eof} \Rightarrow 2\,\text{**}\ 3\,\text{**}\ 2\,\text{eof}$$

- **7-4/2**:  
  $$L \Rightarrow E\,\text{eof} \Rightarrow E / T\,\text{eof} \Rightarrow E / 2\,\text{eof} \Rightarrow E - T / 2\,\text{eof} \Rightarrow E - 4 / 2\,\text{eof} \Rightarrow T - 4 / 2\,\text{eof} \Rightarrow 7 - 4 / 2\,\text{eof}$$

En los tres casos la gramática fuerza una **asociatividad por la izquierda** y no distingue entre
precedencias de operadores: todos los `op` se tratan igual.

#### 1.2. Escriba el árbol de análisis sintáctico (parse tree) para cada una de las frases

Para representar los árboles utilizo mermaid y la gramática original.

- **4.0-2.0\*3.0** \(\Rightarrow ((4.0 - 2.0) * 3.0)\)

```mermaid
graph TD
  L --> E
  E --> E1
  E --> op2["op: *"]
  E --> T3

  E1 --> E2
  E1 --> op1["op: -"]
  E1 --> T2

  E2 --> T1

  T1 --> n1["number: 4.0"]
  T2 --> n2["number: 2.0"]
  T3 --> n3["number: 3.0"]
```

- **2\*\*3\*\*2** \(\Rightarrow ((2 ** 3) ** 2)\)

```mermaid
graph TD
  L --> E
  E --> E1
  E --> op2["op: **"]
  E --> T3

  E1 --> E2
  E1 --> op1["op: **"]
  E1 --> T2

  E2 --> T1

  T1 --> n1["number: 2"]
  T2 --> n2["number: 3"]
  T3 --> n3["number: 2"]
```

- **7-4/2** \(\Rightarrow ((7 - 4) / 2)\)

```mermaid
graph TD
  L --> E
  E --> E1
  E --> op2["op: /"]
  E --> T3

  E1 --> E2
  E1 --> op1["op: -"]
  E1 --> T2

  E2 --> T1

  T1 --> n1["number: 7"]
  T2 --> n2["number: 4"]
  T3 --> n3["number: 2"]
```

#### 1.3. ¿En qué orden se evalúan las acciones semánticas para cada una de las frases?

En esta SDD las acciones semánticas se aplican **de abajo hacia arriba en el árbol de análisis**:
primero se calculan los atributos de los nodos `T` (con `convert(number.lexvalue)`) y después los
de los nodos `E` (con `operate(op.lexvalue, E1.value, T.value)`), siguiendo la estructura
impuesta por `E → E op T`.

Aplicado a cada frase:

- **4.0-2.0\*3.0**  
  1. Se convierten los tres `number` a valores: `4.0`, `2.0` y `3.0`.  
  2. Se evalúa primero `E1.value = operate('-', 4.0, 2.0)` ⇒ \(4.0 - 2.0 = 2.0\).  
  3. Después se evalúa `E.value = operate('*', E1.value, 3.0)` ⇒ \(2.0 * 3.0 = 6.0\).  
  El resultado es `6.0`, que **no respeta la precedencia esperada** (debería ser `4.0 - (2.0*3.0)`).

- **2\*\*3\*\*2**  
  1. Se convierten los `number`: `2`, `3` y `2`.  
  2. Primero se calcula `operate('**', 2, 3)` ⇒ \(2 ** 3 = 8\).  
  3. Luego `operate('**', 8, 2)` ⇒ \((2 ** 3) ** 2 = 64\).  
  El operador potencia se aplica como **asociativo por la izquierda**, en lugar de por la derecha.

- **7-4/2**  
  1. Se convierten `7`, `4` y `2`.  
  2. Primero se evalúa `operate('-', 7, 4)` ⇒ \(7 - 4 = 3\).  
  3. Luego `operate('/', 3, 2)` ⇒ \((7 - 4) / 2 = 1.5\).  
  De nuevo, el resultado corresponde a una agrupación \((7 - 4) / 2\) y no a la precedencia habitual
  \(7 - (4 / 2)\).

En resumen, la SDD original **no distingue precedencia entre operadores** y fuerza una
asociatividad por la izquierda en todos los casos, por lo que la evaluación no coincide con los
convenios matemáticos ni con los de los lenguajes de programación habituales.
En consecuencia, cuando se añaden los tests de precedencia en `prec.test.js` (punto 1.4 del guión),
la implementación original **no respeta la precedencia ni la asociatividad esperadas** y varias
pruebas fallan, evidenciando la necesidad de modificar la gramática.

### 2. Modificación de la gramática para respetar precedencia y asociatividad

En el fichero `src/grammar.jison` se ha simplificado la gramática utilizando **un único no terminal
`expression`** y reglas de precedencia de Jison:

- En el **léxico**, todos los operadores se clasifican en tres tokens:
  - `OPAD` para `+` y `-` (operadores aditivos),
  - `OPMU` para `*` y `/` (operadores multiplicativos),
  - `OPOW` para `**` (potencia).
- En la **sección de precedencias** se declara:
  - `%left OPAD` para hacer `+` y `-` asociativos por la izquierda,
  - `%left OPMU` para `*` y `/`, también asociativos por la izquierda y con mayor precedencia que `OPAD`,
  - `%right OPOW` para `**`, asociativo por la derecha y con mayor precedencia que `OPMU`.
- En la **gramática**, las producciones principales son:
  - `expression OPAD expression`, `expression OPMU expression`, `expression OPOW expression`,
    todas evaluadas mediante `operate($2, $1, $3)`,
  - un no terminal `term` que recoge tanto números (`NUMBER`) como expresiones entre paréntesis
    (`LEFT_PARENTHESIS expression RIGHT_PARENTHESIS`).

De este modo, la combinación de los tokens `OPAD/OPMU/OPOW` con las reglas de precedencia de Jison
garantiza que la evaluación respeta la precedencia y asociatividad descritas en el guión de la práctica.

### 3. Tests de precedencia, flotantes y operadores unarios

Además de los tests ya existentes en `__tests__/parser.test.js`, se ha creado y extendido el fichero
`__tests__/prec.test.js` con un conjunto amplio de pruebas:

- **Pruebas con números enteros** (las indicadas en el enunciado) para verificar que:
  - La multiplicación y la división se evalúan antes que la suma y la resta.
  - La potencia tiene la máxima precedencia.
  - La potencia es asociativa por la derecha.
- **Pruebas con números en punto flotante**, usando notaciones como `2.35e-3`, `2.35e+3`,
  `2.35E-3`, `2.35`, `23` y `2E+3`, combinadas en expresiones aritméticas para comprobar que
  se respeta la misma precedencia y asociatividad que con enteros.
- **Pruebas con operadores unarios `+` y `-`**, tanto sobre números sueltos como combinados con
  operaciones binarias y paréntesis:
  - Casos como `-3`, `+3`, `1 ++ 2`, `1 -- 2`, `2 * -3`, `10 / -2`, `(-2) ** 3`,
  - y expresiones más complejas como `1.5 + (-2) ** 3 * (4 - 6.0 / 3)` o
    `((1 + 2.5) * (-3) ** 2) / +(4 - 1.0 / 2)`.

Estas pruebas se apoyan en `toBeCloseTo` de Jest para comprobar resultados con decimales y cubren
una gran variedad de combinaciones de operadores, paréntesis, enteros y flotantes.

### 4. Soporte de expresiones entre paréntesis

En el mismo fichero `src/grammar.jison` se ha añadido soporte para **expresiones entre paréntesis**
tal y como indica el guión:

- En el **léxico**, se han introducido los tokens `LEFT_PARENTHESIS` y `RIGHT_PARENTHESIS` para
  reconocer `(` y `)`.
- En la **gramática**, el no terminal `term` permite:
  - reducir un `NUMBER` directamente a su valor (`Number(yytext)`),
  - o bien reconocer `( expression )` y devolver el valor de la subexpresión interna.

Con estos cambios, las expresiones entre paréntesis se evalúan correctamente, pueden anidarse y
combinarse con todos los operadores (`+`, `-`, `*`, `/`, `**`) y con operadores unarios.

### 5. Tests para expresiones entre paréntesis y casos límite

En `__tests__/prec.test.js` se han añadido bloques específicos de tests para:

- **Sobrescritura de la precedencia por defecto**:
  - Expresiones como `(1 + 2) * 3`, `2 * (3 + 4)` o `(1 + 2) * (3 + 4)` demuestran que los
    paréntesis fuerzan el orden de evaluación esperado.
- **Paréntesis anidados**:
  - Casos como `((1 + 2) * (3 + 4))` o `10 - (2 * (3 + 4))` verifican el manejo de anidamiento.
- **Combinación con potencia, flotantes y unarios**:
  - Expresiones como `(2 + 3) ** 2`, `2 ** (1 + 2)`, `(1.5 + 2.5) * 2`,
    `2E+3 / (-(1 + 1) + 6.0)` o `((+2.0) ** 3 - (-4.0 / 2)) * (1.5 + -0.5)` muestran que
    paréntesis, números en punto flotante, notación científica y operadores unarios conviven
    correctamente respetando la precedencia.

## Resultados

Tras las modificaciones realizadas:

- La **gramática Jison respeta la precedencia y la asociatividad** de los operadores aditivos,
  multiplicativos y de potencia, de acuerdo con los convenios matemáticos habituales.
- El analizador es capaz de **reconocer y evaluar correctamente números en punto flotante** en
  distintas notaciones (con y sin exponente).
- Se ha añadido soporte completo para **expresiones entre paréntesis**, incluyendo anidamiento y
  combinación con todos los operadores, así como para el uso de **operadores unarios `+` y `-`**
  en distintos contextos.
- Se ha incorporado lógica específica para **detectar y rechazar divisiones por cero**, de forma
  que expresiones como `5 / 0` o `0 / 0` producen un error controlado.
- Todos los tests definidos en `parser.test.js` y `prec.test.js` se ejecutan correctamente,
  proporcionando evidencia automática de que la implementación cumple los requisitos de la práctica.