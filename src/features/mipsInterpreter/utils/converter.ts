// src/features/mipsInterpreter/utils/converter.ts
import { REGISTERS } from '@/config/mipsConstants';
import { MipsError, ParsedOperands, InstructionDefinition, MipsInstructionFields } from '@/types';

/**
 * Convierte un número a su representación binaria con un número específico de bits.
 * Puede manejar números con signo usando complemento a dos.
 */


/**
 * Obtiene la representación binaria de 5 bits para un nombre de registro.
 */
function getRegisterBinary(regName: string | undefined, operandRole: string): string | MipsError {
  if (typeof regName !== 'string' || !regName) {
    return { message: `Registro ${operandRole} no definido.`, stage: 'conversion' };
  }
  const regNum = REGISTERS[regName];
  if (regNum === undefined) {
    return { message: `Registro <span class="math-inline">\{operandRole\} inválido\: '</span>{regName}'.`, stage: 'conversion' };
  }
  return numToBinary(regNum, 5, false) as string; // Sabemos que no será MipsError aquí si regNum es válido
}


/**
 * Ensambla la instrucción binaria de 32 bits y los campos desglosados.
 */
export function assembleInstruction(
  definition: InstructionDefinition,
  operands: ParsedOperands
): { binary: string; fields: MipsInstructionFields } | MipsError {
  const fields: MipsInstructionFields = { opcode: definition.opcode };
  let binaryAccumulator = definition.opcode; // Siempre 6 bits del opcode

  let rsBin: string | MipsError;
  let rtBin: string | MipsError;
  let rdBin: string | MipsError;
  let shamtBin: string | MipsError;
  let immBin: string | MipsError;
  let addrBin: string | MipsError;

  if (definition.type === 'R') {
    rsBin = getRegisterBinary(operands.rsName, 'rs');
    if (typeof rsBin !== 'string') return rsBin;
    rtBin = getRegisterBinary(operands.rtName, 'rt');
    if (typeof rtBin !== 'string') return rtBin;
    rdBin = getRegisterBinary(operands.rdName, 'rd');
    if (typeof rdBin !== 'string') return rdBin;

    shamtBin = numToBinary(operands.shamtValue || 0, 5, false); // shamt es siempre 5 bits, sin signo
    if (typeof shamtBin !== 'string') return shamtBin; // Error de numToBinary

    if (!definition.funct) return { message: "Definición de instrucción tipo R no tiene campo 'funct'.", stage: 'conversion' };

    fields.rs = rsBin; fields.rt = rtBin; fields.rd = rdBin; fields.shamt = shamtBin; fields.funct = definition.funct;
    binaryAccumulator += rsBin + rtBin + rdBin + shamtBin + definition.funct;

  } else if (definition.type === 'I') {
    // Para tipo I, rt es a menudo el destino (addi, lw) o una fuente (sw, beq)
    // rs es siempre una fuente.
    rsBin = getRegisterBinary(operands.rsName, 'rs (o base para lw/sw)');
    if (typeof rsBin !== 'string') return rsBin;
    rtBin = getRegisterBinary(operands.rtName, 'rt');
    if (typeof rtBin !== 'string') return rtBin;

    if (operands.immediateValue === undefined) return { message: "Valor inmediato no definido para tipo I.", stage: 'conversion' };
    if (typeof operands.immediateValue !== 'number') return { message: `Valor inmediato '${operands.immediateValue}' no es un número.`, stage: 'conversion' };

    immBin = numToBinary(operands.immediateValue, 16, true); // Inmediato de 16 bits, con signo extendido
    if (typeof immBin !== 'string') return immBin; // Error de numToBinary

    fields.rs = rsBin; fields.rt = rtBin; fields.immediate = immBin;
    binaryAccumulator += rsBin + rtBin + immBin;

  } else if (definition.type === 'J') {
    if (operands.labelName === undefined) return { message: "Etiqueta/dirección no definida para tipo J.", stage: 'conversion' };

    // La conversión de etiqueta a dirección numérica real es compleja (requiere tabla de símbolos o PC actual).
    // Por ahora, si es un número, lo usamos. Si no, placeholder.
    let targetAddressNum: number;
    if (typeof operands.labelName === 'number') {
        targetAddressNum = operands.labelName;
    } else if (typeof operands.labelName === 'string' && /^\d+$/.test(operands.labelName)) {
        targetAddressNum = parseInt(operands.labelName, 10);
    } else {
        // Placeholder para etiquetas no numéricas. Un ensamblador real resolvería esto.
        // Aquí podrías devolver un error o usar un valor por defecto (ej. 0) y una advertencia.
        console.warn(`Advertencia: Etiqueta de salto '${operands.labelName}' no resuelta a número. Usando 0.`);
        targetAddressNum = 0;
    }

    // En MIPS, la dirección de salto de 26 bits se refiere a una dirección de palabra,
    // y se combina con los 4 bits superiores del PC actual.
    // La dirección real = (PC+4)[31:28] || (target_address * 4)
    // Aquí, el 'target_address' en la instrucción es (dirección_real / 4) & 0x03FFFFFF
    const pseudoDirectAddress = Math.floor(targetAddressNum / 4); // Simplificación: Asumimos que targetAddressNum ya es la dirección de palabra deseada.
                                                               // Un ensamblador real manejaría esto con más precisión.

    addrBin = numToBinary(pseudoDirectAddress, 26, false); // Dirección de 26 bits, sin signo
    if (typeof addrBin !== 'string') return addrBin; // Error de numToBinary

    fields.address = addrBin;
    binaryAccumulator += addrBin;
  } else {
    return { message: "Tipo de instrucción desconocido para ensamblaje.", stage: 'conversion' };
  }

  if (binaryAccumulator.length !== 32) {
    return { message: `Error de ensamblaje: longitud binaria final es ${binaryAccumulator.length} bits, se esperaban 32.`, stage: 'conversion' };
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
  return "0x" + hex.toUpperCase().padStart(8, '0'); // Asegurar 8 dígitos hexadecimales
}