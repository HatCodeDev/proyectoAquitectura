// src/features/mipsInterpreter/utils/parser.ts
import { ParsedOperands, MipsError } from '@/types';
import { REGISTERS } from '@/config/mipsConstants';

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

// Función auxiliar para validar registros
function isValidRegisterName(regName: string): boolean {
  return typeof regName === 'string' && regName.startsWith('$') && REGISTERS[regName] !== undefined;
}

export function parseOperands(
  operandsString: string | null,
  formatString: string
): ParsedOperands | MipsError {
  const parsedResult: ParsedOperands = {};

  // Manejo de casos donde no se esperan/proveen operandos
  if (!formatString && !operandsString) {
    return parsedResult; // OK: No se esperaba formato, no se dieron operandos.
  }
  if (formatString && !operandsString) {
    return { message: `Faltan operandos. Se esperaba el formato: ${formatString}`, stage: 'parsing' };
  }
  if (!formatString && operandsString) {
    return { message: `Se proporcionaron operandos '${operandsString}' pero no se esperaba formato alguno.`, stage: 'parsing' };
  }

  // Si llegamos aquí, operandsString y formatString existen.
  const receivedOperands = operandsString!.split(',').map(op => op.trim());
  const expectedOperandFormats = formatString.split(',').map(fmt => fmt.trim());

  if (receivedOperands.length !== expectedOperandFormats.length) {
    return {
      message: `Número incorrecto de operandos. Se esperaban ${expectedOperandFormats.length} para el formato '${formatString}', se recibieron ${receivedOperands.length} (${operandsString}).`,
      stage: 'parsing',
    };
  }

  // --- INICIO DEL BUCLE FOR CON VALIDACIONES ---
  for (let i = 0; i < expectedOperandFormats.length; i++) {
    const formatPart = expectedOperandFormats[i];
    const operandPart = receivedOperands[i];

    if (formatPart === 'rd' || formatPart === 'rs' || formatPart === 'rt') {
      if (!isValidRegisterName(operandPart)) { // <<<--- VALIDACIÓN DE REGISTRO AQUÍ
        return { message: `Nombre de registro inválido para '${formatPart}': '${operandPart}'.`, stage: 'parsing' };
      }
      if (formatPart === 'rd') parsedResult.rdName = operandPart;
      if (formatPart === 'rs') parsedResult.rsName = operandPart;
      if (formatPart === 'rt') parsedResult.rtName = operandPart;
    } else if (formatPart === 'immediate') {
      const immVal = parseInt(operandPart, 10);
      if (isNaN(immVal)) {
        return { message: `Se esperaba un valor inmediato numérico para '${formatPart}', se recibió '${operandPart}'.`, stage: 'parsing' };
      }
      parsedResult.immediateValue = immVal;
    } else if (formatPart === 'label' || formatPart === 'target_address') {
      if (/[,\s()]/.test(operandPart)) {
        return { message: `Nombre de etiqueta/dirección inválido: '${operandPart}' contiene caracteres no permitidos.`, stage: 'parsing' };
      }
      parsedResult.labelName = operandPart;
    } else if (formatPart === 'offset(rs)') {
      const offsetBaseMatch = operandPart.match(/^(-?\d+)\s*\(\s*(\$\w+)\s*\)$/);
      if (!offsetBaseMatch) {
        return { message: `Formato de operando 'offset(base)' inválido: '${operandPart}'. Se esperaba algo como '0($sp)'.`, stage: 'parsing' };
      }
      const offsetValStr = offsetBaseMatch[1];
      const baseRegName = offsetBaseMatch[2];

      if (!isValidRegisterName(baseRegName)) { // <<<--- VALIDACIÓN DE REGISTRO BASE AQUÍ
        return { message: `Registro base inválido en 'offset(base)': '${baseRegName}'.`, stage: 'parsing' };
      }
      const offsetVal = parseInt(offsetValStr, 10);
      if (isNaN(offsetVal)) {
        return { message: `Valor de offset inválido en 'offset(base)': '${offsetValStr}'.`, stage: 'parsing' };
      }
      parsedResult.immediateValue = offsetVal;
      parsedResult.rsName = baseRegName; // El registro base se mapea a rsName
    } else {
      return { message: `Formato de operando desconocido en formatString: '${formatPart}'`, stage: 'parsing' };
    }
  }
  // --- FIN DEL BUCLE FOR CON VALIDACIONES ---

  return parsedResult;
}