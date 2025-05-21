import { ParsedOperands, MipsError } from '@/types';
export interface TokenizedInstruction {
  mnemonic: string;
  operandsString: string | null;
}

export function tokenizeInstruction(rawInstruction: string): TokenizedInstruction | null {
  // 1. Remover comentarios (todo lo que sigue a '#')
  let cleanedInstruction = rawInstruction.split('#')[0];

  // 2. Recortar espacios al inicio y final de la instrucción
  cleanedInstruction = cleanedInstruction.trim();

  // 3. Si la cadena está vacía después de limpiar, no hay nada que tokenizar
  if (!cleanedInstruction) {
    return null; // Indica que no hay instrucción válida
  }

  // 4. Buscar el primer espacio para separar el mnemónico del resto
  const firstSpaceIndex = cleanedInstruction.indexOf(' ');

  let mnemonic: string;
  let operandsString: string | null = null;

  if (firstSpaceIndex === -1) {
    // No hay espacios, significa que es una instrucción sin operandos (ej. "syscall")
    mnemonic = cleanedInstruction.toLowerCase(); // Convertir a minúsculas para consistencia
  } else {
    // Hay espacios, separar mnemónico y operandos
    mnemonic = cleanedInstruction.substring(0, firstSpaceIndex).toLowerCase();
    operandsString = cleanedInstruction.substring(firstSpaceIndex + 1).trim();
    // Si operandsString queda vacío después del trim, es como no tener operandos
    if (operandsString === "") {
        operandsString = null;
    }
  }

  // No debería ser necesario este chequeo si cleanedInstruction tiene contenido,
  // pero por si acaso.
  // if (!mnemonic) return null;

  return { mnemonic, operandsString };
}


export function parseOperands(
  operandsString: string | null,
  formatString: string // Ej: "rd, rs, rt", "rt, rs, immediate", "rt, offset(rs)", "rs, rt, label", "target_address"
): ParsedOperands | MipsError {
  const parsedResult: ParsedOperands = {};

  // Si no se esperan operandos según el formato y no se proporcionaron, está bien.
  if (!formatString && !operandsString) {
    return parsedResult;
  }

  // Si se esperan operandos pero no se proporcionaron (o viceversa de forma simple)
  if (!operandsString && formatString) {
    return { message: `Faltan operandos. Se esperaba el formato: ${formatString}`, stage: 'parsing' };
  }
  if (operandsString && !formatString) {
    return { message: `Se proporcionaron operandos '${operandsString}' pero no se esperaba ninguno.`, stage: 'parsing' };
  }

  // Si llegamos aquí, operandsString no es null
  const receivedOperands = operandsString!.split(',').map(op => op.trim());
  const expectedOperandFormats = formatString.split(',').map(fmt => fmt.trim());

  if (receivedOperands.length !== expectedOperandFormats.length) {
    return {
      message: `Número incorrecto de operandos. Se esperaban <span class="math-inline">\{expectedOperandFormats\.length\} \(</span>{formatString}), se recibieron <span class="math-inline">\{receivedOperands\.length\} \(</span>{operandsString}).`,
      stage: 'parsing',
    };
  }

  for (let i = 0; i < expectedOperandFormats.length; i++) {
    const formatPart = expectedOperandFormats[i];
    const operandPart = receivedOperands[i];

    if (formatPart === 'rd') {
      parsedResult.rdName = operandPart;
    } else if (formatPart === 'rs') {
      parsedResult.rsName = operandPart;
    } else if (formatPart === 'rt') {
      parsedResult.rtName = operandPart;
    } else if (formatPart === 'immediate') {
      const immVal = parseInt(operandPart, 10); // Intenta parsear como base 10
      if (isNaN(immVal)) {
        // Podría ser un inmediato hexadecimal "0x..." o una etiqueta que se resolverá luego.
        // Por ahora, si no es un número decimal, lo tratamos como un error para 'immediate' simple.
        // O, si tu diseño lo permite, podrías guardar 'operandPart' como string y resolverlo después.
        return { message: `Se esperaba un valor inmediato numérico para '<span class="math-inline">\{formatPart\}', se recibió '</span>{operandPart}'.`, stage: 'parsing' };
      }
      parsedResult.immediateValue = immVal;
    } else if (formatPart === 'label' || formatPart === 'target_address') {
      // Para etiquetas y direcciones de salto, guardamos el nombre tal cual.
      // La conversión a dirección numérica se hará después.
      parsedResult.labelName = operandPart;
    } else if (formatPart.includes('offset(rs)')) { // Manejo especial para "rt, offset(rs)" -> formatPart es "offset(rs)"
      // Esto es para lw y sw donde el formato es "rt, offset(rs)"
      // El 'rt' ya fue manejado por una iteración anterior si formatString es "rt, offset(rs)"
      // Aquí, formatPart es "offset(rs)" y operandPart es, por ej., "0($sp)"
      const offsetBaseMatch = operandPart.match(/^(-?\d+)\s*\(\s*(\$\w+)\s*\)$/); // ej: "0($sp)", "-4($t0)"
      if (!offsetBaseMatch) {
        return { message: `Formato de operando 'offset(base)' inválido: '${operandPart}'. Se esperaba algo como '0($sp)'.`, stage: 'parsing' };
      }
      parsedResult.immediateValue = parseInt(offsetBaseMatch[1], 10); // El offset es el inmediato
      parsedResult.rsName = offsetBaseMatch[2]; // El registro base
                                                  // Nota: Si el formatString fuera solo "offset(rs)",
                                                  // y rs no se hubiera definido de otra forma.
                                                  // En el caso de "rt, offset(rs)", rs es el registro base.
    } else {
      return { message: `Formato de operando desconocido en formatString: '${formatPart}'`, stage: 'parsing' };
    }
  }

  // Aquí podrías añadir validaciones más específicas por operando (ej. si es un nombre de registro válido)

  return parsedResult;
}