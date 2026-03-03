## Desarrollo

### 1. Partiendo de la gramática y las siguientes frases 4.0-2.0*3.0, 2**3**2 y 7-4/2:

#### 1.1. Escriba la derivación para cada una de las frases

##### 4.0-2.0*3.0:  
`L => E eof => E * T eof => E * 3.0 eof => E - T * 3.0 eof => E - 2.0 * 3.0 eof => T - 2.0 * 3.0 eof => 4.0 - 2.0 * 3.0 eof`

#### 1.2. Escriba el árbol de análisis sintáctico (parse tree) para cada una de las frases.

Para representar los árboles utilizaré mermaid.

##### 4.0-2.0*3.0: 

#### 1.3. ¿En qué orden se evaluan las acciones semánticas para cada una de las frases?

Las acciones semánticas se evalúan en orden de derecha a izquierda, sin cumplir las reglas de precedencia y asociatividad.
Esto ocurre debido a como están definidas las reglas de la SDD.
$$
\begin{array}{|c|l|}
\hline
\textbf{Producción} & \textbf{Regla semántica} \\
\hline
L \rightarrow E~eof & L.value = E.value \\
E \rightarrow E_1~op~T & E.value = operate(op.lexvalue, E_1.value, T.value) \\
E \rightarrow T & E.value = T.value \\
T \rightarrow \text{number} & T.value = convert(number.lexvalue) \\
\hline
\end{array}
$$
