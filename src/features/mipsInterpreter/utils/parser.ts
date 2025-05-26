// src/features/mipsInterpreter/utils/parser.ts
import { ParsedOperands, MipsError } from '@/types';
import { REGISTERS } from '@/config/mipsConstants';

// Interfaz TokenizedInstruction y función tokenizeInstruction (sin cambios)
export interface TokenizedInstruction {
  mnemonic: string;
  operandsString: string | null;
}

export function tokenizeInstruction(rawInstruction: string): TokenizedInstruction | MipsError {
  let cleanedInstruction = rawInstruction.split('#')[0].trim();
  if (!cleanedInstruction) {
    return {
      message: 'Instrucción vacía o solo comentarios.',
      stage: 'tokenization',
    };
  }
  const firstSpaceIndex = cleanedInstruction.indexOf(' ');
  let mnemonic: string;
  let operandsString: string | null = null;
  if (firstSpaceIndex === -1) {
    mnemonic = cleanedInstruction.toLowerCase();
  } else {
    mnemonic = cleanedInstruction.substring(0, firstSpaceIndex).toLowerCase();
    operandsString = cleanedInstruction.substring(firstSpaceIndex + 1).trim();
    if (operandsString === "") {
      operandsString = null;
    }
  }
  return { mnemonic, operandsString };
}

function isValidRegisterName(regName: string): boolean {
  return typeof regName === 'string' && regName.startsWith('$') && REGISTERS[regName] !== undefined;
}

export function parseOperands(
  operandsString: string | null,
  formatString: string
): ParsedOperands | MipsError {
  const parsedResult: ParsedOperands = {};

  if (!formatString && !operandsString) {
    return parsedResult;
  }
  if (formatString && !operandsString) {
    return { message: `Faltan operandos. Se esperaba el formato: ${formatString}`, stage: 'parsing' };
  }
  if (!formatString && operandsString) {
    return { message: `Se proporcionaron operandos '${operandsString}' pero no se esperaba formato alguno.`, stage: 'parsing' };
  }

  const receivedOperands = operandsString!.split(',').map(op => op.trim());
  const expectedOperandFormats = formatString.split(',').map(fmt => fmt.trim());

  if (receivedOperands.length !== expectedOperandFormats.length) {
    return {
      message: `Número incorrecto de operandos. Se esperaban ${expectedOperandFormats.length} para el formato '${formatString}', se recibieron ${receivedOperands.length} (${operandsString}).`,
      stage: 'parsing',
    };
  }

  for (let i = 0; i < expectedOperandFormats.length; i++) {
    const formatPart = expectedOperandFormats[i];
    const operandPart = receivedOperands[i];

    if (formatPart === 'rd' || formatPart === 'rs' || formatPart === 'rt') {
      if (!isValidRegisterName(operandPart)) {
        return { message: `Nombre de registro inválido para '${formatPart}': '${operandPart}'.`, stage: 'parsing' };
      }
      if (formatPart === 'rd') parsedResult.rdName = operandPart;
      if (formatPart === 'rs') parsedResult.rsName = operandPart;
      if (formatPart === 'rt') parsedResult.rtName = operandPart;
    } else if (formatPart === 'immediate') {
      let immVal: number;
      if (operandPart.toLowerCase().startsWith('0x')) { // Hexadecimal
        immVal = parseInt(operandPart.substring(2), 16);
        if (isNaN(immVal)) {
          return { message: `Valor inmediato hexadecimal inválido para '${formatPart}': '${operandPart}'.`, stage: 'parsing' };
        }
      } else { // Decimal
        immVal = parseInt(operandPart, 10);
        if (isNaN(immVal)) {
          return { message: `Se esperaba un valor inmediato numérico (decimal o 0x...) para '${formatPart}', se recibió '${operandPart}'.`, stage: 'parsing' };
        }
      }
      parsedResult.immediateValue = immVal;
    } else if (formatPart === 'shamt') { // <<<--- NUEVO MANEJO PARA SHAMT
      const shamtVal = parseInt(operandPart, 10); // shamt es usualmente decimal
      if (isNaN(shamtVal)) {
        return { message: `Se esperaba un valor numérico para 'shamt', se recibió '${operandPart}'.`, stage: 'parsing' };
      }
      // La validación de rango (0-31) para shamt es crucial y se hará más estrictamente
      // en numToBinary, pero una validación básica aquí es buena.
      if (shamtVal < 0 || shamtVal > 31) {
        return { message: `Valor de 'shamt' (${shamtVal}) fuera de rango. Debe ser entre 0 y 31.`, stage: 'parsing' };
      }
      parsedResult.shamtValue = shamtVal;
    } else if (formatPart === 'label' || formatPart === 'target_address') {
      // Para etiquetas o direcciones, guardamos el string como está.
      // converter.ts se encargará de interpretar si es decimal, hexadecimal (0x...) o una etiqueta simbólica.
      // Solo validamos que no tenga caracteres claramente separadores si no es un número simple o hex.
      if (!operandPart.toLowerCase().startsWith('0x') && !/^-?\d+$/.test(operandPart) && /[,\s()]/.test(operandPart)) {
        return { message: `Nombre de etiqueta/dirección inválido: '${operandPart}' contiene caracteres no permitidos (y no es un número o hexadecimal '0x...').`, stage: 'parsing' };
      }
      parsedResult.labelName = operandPart; // Guardar el string original, ej: "1024", "0x100", "loop"
    } else if (formatPart === 'offset(rs)') {
      const offsetBaseMatch = operandPart.match(/^(-?\d+|0x[0-9a-fA-F]+)\s*\(\s*(\$\w+)\s*\)$/i); // Soporte para offset decimal o hex
      if (!offsetBaseMatch) {
        return { message: `Formato de operando 'offset(base)' inválido: '${operandPart}'. Se esperaba algo como '0($sp)' o '0x10($s0)'.`, stage: 'parsing' };
      }

      const offsetStr = offsetBaseMatch[1];
      const baseRegName = offsetBaseMatch[2];

      if (!isValidRegisterName(baseRegName)) {
        return { message: `Registro base inválido en 'offset(base)': '${baseRegName}'.`, stage: 'parsing' };
      }

      let offsetVal: number;
      if (offsetStr.toLowerCase().startsWith('0x')) {
        offsetVal = parseInt(offsetStr.substring(2), 16);
      } else {
        offsetVal = parseInt(offsetStr, 10);
      }

      if (isNaN(offsetVal)) {
        return { message: `Valor de offset inválido en 'offset(base)': '${offsetStr}'.`, stage: 'parsing' };
      }
      parsedResult.immediateValue = offsetVal; // El offset se guarda como immediateValue
      parsedResult.rsName = baseRegName;         // El registro base se guarda como rsName
    } else {
      return { message: `Formato de operando desconocido en formatString: '${formatPart}'`, stage: 'parsing' };
    }
  }
  return parsedResult;
}