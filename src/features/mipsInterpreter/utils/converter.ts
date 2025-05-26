// src/features/mipsInterpreter/utils/converter.ts
import { REGISTERS } from '@/config/mipsConstants';
import { MipsError, ParsedOperands, InstructionDefinition, MipsInstructionFields } from '@/types';

/**
 * Convierte un número a su representación binaria con un número específico de bits.
 * Puede manejar números con signo usando complemento a dos.
 */
export function numToBinary(num: number, bits: number, signed: boolean = false): string | MipsError {
  if (isNaN(num)) {
    return { message: `Valor inválido para conversión a binario: no es un número.`, stage: 'conversion' };
  }

  let minValue, maxValue;
  if (signed) {
    minValue = -Math.pow(2, bits - 1);
    maxValue = Math.pow(2, bits - 1) - 1;
  } else {
    minValue = 0;
    maxValue = Math.pow(2, bits) - 1;
  }

  if (num < minValue || num > maxValue) {
    return {
      message: `Número ${num} fuera de rango para ${bits} bits${signed ? ' con signo' : ''}. Rango esperado: [${minValue} a ${maxValue}].`,
      stage: 'conversion',
    };
  }

  let binaryString;
  if (signed && num < 0) {
    // Cálculo explícito de complemento a dos para el número de bits especificado
    binaryString = (Math.pow(2, bits) + num).toString(2);
    // Asegurar que tenga la longitud correcta (puede ser más corto si Math.pow(2,bits) + num es pequeño y positivo)
    binaryString = binaryString.padStart(bits, '0'); // Pad inicial por si acaso
    if (binaryString.length > bits) { // Si num era muy negativo, podría tener más de 'bits' si no se valida el rango antes
        binaryString = binaryString.slice(binaryString.length - bits);
    }


  } else {
    binaryString = num.toString(2).padStart(bits, '0');
  }

  // Failsafe final, aunque las validaciones de rango deberían prevenir esto.
  if (binaryString.length !== bits) {
     // Esto sería una condición de error inesperada si las validaciones de rango son correctas.
     console.error(`Error interno en numToBinary: longitud de bits inesperada. Num: ${num}, Bits: ${bits}, Result: ${binaryString}`);
     return { message: `Error interno al generar binario de ${bits} bits para ${num}.`, stage: 'conversion' };
  }

  return binaryString;
}

/**
 * Obtiene la representación binaria de 5 bits para un nombre de registro.
 */
function getRegisterBinary(regName: string | undefined, operandRole: string): string | MipsError {
  if (typeof regName !== 'string' || !regName) {
    return { message: `Registro para '${operandRole}' no definido.`, stage: 'conversion' };
  }
  const regNum = REGISTERS[regName];
  if (regNum === undefined) {
    // Mensaje de error corregido, sin HTML/markdown
    return { message: `Registro para '${operandRole}' inválido: '${regName}'.`, stage: 'conversion' };
  }
  // numToBinary para registros siempre es sin signo y 5 bits.
  // El chequeo de rango en numToBinary (0 a 31 para 5 bits sin signo) cubrirá si regNum es inválido.
  const binaryReg = numToBinary(regNum, 5, false);
  if (typeof binaryReg !== 'string') { // Propagar error de numToBinary
      return { message: `Error al convertir número de registro para '${operandRole}' ('${regName}'): ${binaryReg.message}`, stage: 'conversion'};
  }
  return binaryReg;
}

/**
 * Ensambla la instrucción binaria de 32 bits y los campos desglosados.
 */
export function assembleInstruction(
  definition: InstructionDefinition,
  operands: ParsedOperands
): { binary: string; fields: MipsInstructionFields } | MipsError {
  const fields: MipsInstructionFields = { opcode: definition.opcode };
  let binaryAccumulator = definition.opcode;

  let rsBin: string | MipsError;
  let rtBin: string | MipsError;
  let rdBin: string | MipsError;
  let shamtVal: number;
  let shamtBin: string | MipsError;
  let immVal: number; // Para el valor numérico del inmediato/offset
  let immBin: string | MipsError;
  let addrBin: string | MipsError; // Para el campo de dirección de J-type

  if (definition.type === 'R') {
    // --- LÓGICA PARA TIPO R (INCLUYENDO SLL) ---
    rdBin = getRegisterBinary(operands.rdName, 'rd');
    if (typeof rdBin !== 'string') return rdBin;

    // Para sll, srl, sra: el operando ensamblador es rd, rt, shamt.
    // El campo 'rs' en la instrucción máquina es 0.
    if (definition.mnemonic === 'sll' || definition.mnemonic === 'srl' || definition.mnemonic === 'sra') {
      rsBin = "00000"; // Campo rs es 0 para sll, srl, sra
      rtBin = getRegisterBinary(operands.rtName, 'rt (fuente para shift)');
      if (typeof rtBin !== 'string') return rtBin;

      if (operands.shamtValue === undefined || typeof operands.shamtValue !== 'number') {
           return { message: `Valor de shamt no definido o inválido para '${definition.mnemonic}'. Se esperaba un número.`, stage: 'conversion' };
      }
      shamtVal = operands.shamtValue; // Ya validado en parser.ts (0-31)
    } else { // Para otras instrucciones R como add, sub, and, slt
      rsBin = getRegisterBinary(operands.rsName, 'rs');
      if (typeof rsBin !== 'string') return rsBin;
      rtBin = getRegisterBinary(operands.rtName, 'rt');
      if (typeof rtBin !== 'string') return rtBin;
      shamtVal = 0; // Para add, sub, and, slt, etc., el campo shamt es 0
    }

    shamtBin = numToBinary(shamtVal, 5, false);
    if (typeof shamtBin !== 'string') return { message: `Error en valor de shamt (${shamtVal}) para '${definition.mnemonic}': ${shamtBin.message}`, stage: 'conversion'};

    if (!definition.funct) return { message: `Definición de instrucción tipo R '${definition.mnemonic}' no tiene campo 'funct'.`, stage: 'conversion' };

    fields.rs = rsBin; fields.rt = rtBin; fields.rd = rdBin; fields.shamt = shamtBin; fields.funct = definition.funct;
    binaryAccumulator += rsBin + rtBin + rdBin + shamtBin + definition.funct;

  } else if (definition.type === 'I') {
    // --- LÓGICA PARA TIPO I (INCLUYENDO BNE Y HEXADECIMALES) ---
    rsBin = getRegisterBinary(operands.rsName, 'rs (o base)');
    if (typeof rsBin !== 'string') return rsBin;
    rtBin = getRegisterBinary(operands.rtName, 'rt');
    if (typeof rtBin !== 'string') return rtBin;

    let immediateSource: string | number | undefined;

    // Para beq, bne, el parser guarda la etiqueta/offset en labelName
    // según formatString "rs, rt, label"
    if (definition.mnemonic === 'beq' || definition.mnemonic === 'bne') {
        immediateSource = operands.labelName;
        if (immediateSource === undefined) {
            return { message: `Etiqueta/offset no definido para instrucción '${definition.mnemonic}'.`, stage: 'conversion'};
        }
    } else { // Para otras instrucciones tipo I como addi, lw, sw
        immediateSource = operands.immediateValue;
        if (immediateSource === undefined) {
            return { message: `Valor inmediato no definido para instrucción tipo I '${definition.mnemonic}'.`, stage: 'conversion' };
        }
    }

    // Convertir la fuente a un número (immVal), permitiendo hexadecimal
    if (typeof immediateSource === 'number') {
        immVal = immediateSource;
    } else if (typeof immediateSource === 'string') {
        if (immediateSource.toLowerCase().startsWith('0x')) { // Hexadecimal
            immVal = parseInt(immediateSource.substring(2), 16);
            if (isNaN(immVal)) {
                return { message: `Valor inmediato/offset hexadecimal inválido '${immediateSource}' para '${definition.mnemonic}'.`, stage: 'conversion'};
            }
        } else if (/^-?\d+$/.test(immediateSource)) { // Decimal
            immVal = parseInt(immediateSource, 10);
        } else { // Etiqueta simbólica no numérica
            if (definition.mnemonic === 'beq' || definition.mnemonic === 'bne') {
                return {
                    message: `Etiqueta de salto simbólica '${immediateSource}' para '${definition.mnemonic}' no se puede resolver. Ingrese un offset numérico (decimal o 0xhex).`,
                    stage: 'conversion'
                };
            } else { // Para addi, lw, sw, etc., un inmediato no numérico (y no hex) es un error.
                return { message: `Valor inmediato '${immediateSource}' para '${definition.mnemonic}' no es un número válido (decimal o 0xhex).`, stage: 'conversion' };
            }
        }
    } else {
         return { message: `Fuente de inmediato/etiqueta inválida para '${definition.mnemonic}': '${String(immediateSource)}'. Se esperaba un número o una cadena.`, stage: 'conversion'};
    }

    // Ahora immVal es un número. numToBinary validará el rango (16 bits con signo).
    // Para beq/bne, immVal debe ser el offset de palabras.
    immBin = numToBinary(immVal, 16, true);
    if (typeof immBin !== 'string') {
        return { message: `Error en valor inmediato/offset (${immVal}) para '${definition.mnemonic}': ${immBin.message}`, stage: 'conversion'};
    }

    fields.rs = rsBin; fields.rt = rtBin; fields.immediate = immBin;
    binaryAccumulator += rsBin + rtBin + immBin;

  } else if (definition.type === 'J') {
    // --- LÓGICA PARA TIPO J (INCLUYENDO HEXADECIMALES) ---
    // El parser guarda la dirección/etiqueta en labelName para 'j'
    const addressSource = operands.labelName !== undefined ? operands.labelName : operands.immediateValue;

    if (addressSource === undefined) {
        return { message: `Etiqueta/dirección no definida para instrucción tipo J '${definition.mnemonic}'.`, stage: 'conversion' };
    }

    let targetAddressNum: number;

    if (typeof addressSource === 'number') {
        targetAddressNum = addressSource;
    } else if (typeof addressSource === 'string') {
        if (addressSource.toLowerCase().startsWith('0x')) { // Hexadecimal
            targetAddressNum = parseInt(addressSource.substring(2), 16);
            if (isNaN(targetAddressNum)) {
                return { message: `Dirección hexadecimal inválida '${addressSource}' para '${definition.mnemonic}'.`, stage: 'conversion'};
            }
        } else if (/^-?\d+$/.test(addressSource)) { // Decimal
            targetAddressNum = parseInt(addressSource, 10);
        } else { // Etiqueta simbólica no numérica
            return {
                message: `Etiqueta de salto simbólica '${addressSource}' para '${definition.mnemonic}' no se puede resolver a una dirección numérica. Ingrese una dirección numérica (decimal o 0xhex).`,
                stage: 'conversion'
            };
        }
        // Para J, la dirección de destino no debe ser negativa.
        if (targetAddressNum < 0) {
             return { message: `La dirección de salto para '${definition.mnemonic}' no puede ser negativa: '${addressSource}'.`, stage: 'conversion'};
        }
    } else {
         return { message: `Fuente de dirección inválida para tipo J: '${String(addressSource)}'. Se esperaba un número o una cadena.`, stage: 'conversion'};
    }

    if (targetAddressNum % 4 !== 0) {
        return { message: `La dirección de destino para '${definition.mnemonic}' (${targetAddressNum}) debe ser divisible por 4 (alineada a palabra).`, stage: 'conversion'};
    }
    const pseudoDirectAddressField = targetAddressNum / 4; // El campo en la instrucción es la dirección de palabra/4

    addrBin = numToBinary(pseudoDirectAddressField, 26, false); // 26 bits para el campo de dirección
    if (typeof addrBin !== 'string') {
        return { message: `Error al convertir dirección para '${definition.mnemonic}' (campo de 26 bits para ${pseudoDirectAddressField}): ${addrBin.message}`, stage: 'conversion'};
    }

    fields.address = addrBin;
    binaryAccumulator += addrBin;

  } else {
    return { message: "Tipo de instrucción desconocido para ensamblaje.", stage: 'conversion' };
  }

  if (binaryAccumulator.length !== 32) {
    return { message: `Error de ensamblaje: longitud binaria final es ${binaryAccumulator.length} bits para la instrucción '${definition.mnemonic}', se esperaban 32.`, stage: 'conversion' };
  }
  return { binary: binaryAccumulator, fields };
}

/**
 * Convierte una cadena binaria de 32 bits a su representación hexadecimal.
 */
export function binaryToHex(binary: string): string | MipsError {
  if (typeof binary !== 'string' || binary.length !== 32 || !/^[01]+$/.test(binary)) {
    return { message: "Entrada inválida para binaryToHex: no es una cadena binaria de 32 bits.", stage: 'conversion' };
  }
  let hex = "";
  for (let i = 0; i < binary.length; i += 4) {
    const nibble = binary.substring(i, i + 4);
    hex += parseInt(nibble, 2).toString(16);
  }
  return "0x" + hex.toUpperCase().padStart(8, '0');
}