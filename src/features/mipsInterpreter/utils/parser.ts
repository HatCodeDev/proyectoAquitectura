/*
El archivo parser.ts 
se encarga de analizar y descomponer instrucciones 
MIPS escritas como texto. Sus funciones principales son:

Recibir la cadena de texto con una instrucción MIPS, 
elimina comentarios y espacios, y separa el mnemónico de los operandos. 

Toma los operandos extraídos y el formato esperado 
(por ejemplo, "rd, rs, rt" o "rt, offset(rs)") 
y los desglosa en partes individuales 
(como nombres de registros, valores inmediatos, etiquetas, etc.). Valida que la cantidad y el formato de los operandos sean correctos y devuelve un objeto estructurado con los operandos ya identificados, o un error si hay algún problema de formato.
*/