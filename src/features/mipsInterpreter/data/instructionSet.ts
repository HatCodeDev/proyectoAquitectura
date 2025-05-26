// src/features/mipsInterpreter/data/instructionSet.ts
import { InstructionDefinition } from '@/types'; // Ajusta la ruta si es necesario
import { OPCODES, FUNCT_CODES } from '@/config/mipsConstants';   // Ajusta la ruta si es necesario

// Este es el conjunto inicial de instrucciones que soportará nuestro intérprete.
// La clave del Record es el mnemónico de la instrucción en minúsculas.
export const MIPS_INSTRUCTION_SET: Record<string, InstructionDefinition> = {
  // --- Tipo R ---
  'add': {
    mnemonic: 'add', type: 'R', opcode: OPCODES.r_type, funct: FUNCT_CODES.add,
    formatString: "rd, rs, rt",
    description: "Suma el contenido de 'rs' y 'rt' (con signo) y almacena el resultado en 'rd'. Causa excepción en overflow."
  },
  'sub': { // <<<--- NUEVA (o descomentada y completada)
    mnemonic: 'sub', type: 'R', opcode: OPCODES.r_type, funct: FUNCT_CODES.sub,
    formatString: "rd, rs, rt",
    description: "Resta el contenido de 'rt' de 'rs' (con signo) y almacena el resultado en 'rd'. Causa excepción en overflow."
  },
  'and': { // <<<--- NUEVA
    mnemonic: 'and', type: 'R', opcode: OPCODES.r_type, funct: FUNCT_CODES.and,
    formatString: "rd, rs, rt",
    description: "Realiza un AND lógico bit a bit entre 'rs' y 'rt', y almacena el resultado en 'rd'."
  },
  'sll': { // <<<--- NUEVA
    mnemonic: 'sll', type: 'R', opcode: OPCODES.r_type, funct: FUNCT_CODES.sll,
    // El formato ensamblador es rd, rt, shamt. El campo 'rs' de la instrucción máquina es 0.
    formatString: "rd, rt, shamt", // shamt es un valor inmediato de 5 bits
    description: "Desplaza lógicamente a la izquierda el contenido de 'rt' por 'shamt' bits, rellenando con ceros. El resultado se almacena en 'rd'. El campo 'rs' de la instrucción máquina es cero."
  },
  'slt': { // <<<--- NUEVA
    mnemonic: 'slt', type: 'R', opcode: OPCODES.r_type, funct: FUNCT_CODES.slt,
    formatString: "rd, rs, rt",
    description: "Establece 'rd' a 1 si 'rs' (con signo) es menor que 'rt' (con signo), de lo contrario establece 'rd' a 0."
  },

  // --- Tipo I ---
  'addi': {
    mnemonic: 'addi', type: 'I', opcode: OPCODES.addi,
    formatString: "rt, rs, immediate",
    description: "Suma 'rs' con el inmediato de 16 bits (con signo extendido) y almacena en 'rt'. Causa excepción en overflow."
  },
  'lw': {
    mnemonic: 'lw', type: 'I', opcode: OPCODES.lw,
    formatString: "rt, offset(rs)",
    description: "Carga una palabra desde la memoria a 'rt'. Dirección = 'rs' + offset (16 bits con signo extendido)."
  },
  'sw': { // Asumo que ya la tenías, si no, añádela también.
    mnemonic: 'sw', type: 'I', opcode: OPCODES.sw,
    formatString: "rt, offset(rs)",
    description: "Almacena la palabra de 'rt' en memoria. Dirección = 'rs' + offset (16 bits con signo extendido)."
  },
  'beq': {
    mnemonic: 'beq', type: 'I', opcode: OPCODES.beq,
    formatString: "rs, rt, label", // label es un offset de 16 bits
    description: "Si 'rs' == 'rt', salta a la dirección PC + 4 + (offset << 2). El offset es con signo."
  },
  'bne': { // <<<--- NUEVA
    mnemonic: 'bne', type: 'I', opcode: OPCODES.bne,
    formatString: "rs, rt, label", // label es un offset de 16 bits
    description: "Si 'rs' != 'rt', salta a la dirección PC + 4 + (offset << 2). El offset es con signo."
  },


  // --- Tipo J ---
  'j': {
    mnemonic: 'j',
    type: 'J',
    opcode: OPCODES.j,
    formatString: "target_address", // target_address es una pseudo-dirección de 26 bits
    description: "Salta incondicionalmente a la dirección de instrucción especificada por 'target_address'. Los 4 bits más significativos de la nueva dirección se toman del PC actual."
  }
};