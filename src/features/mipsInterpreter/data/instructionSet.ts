// src/features/mipsInterpreter/data/instructionSet.ts
import { InstructionDefinition, InstructionType } from '@/types'; // Ajusta la ruta si es necesario
import { OPCODES, FUNCT_CODES } from '@/config/mipsConstants';   // Ajusta la ruta si es necesario

// Este es el conjunto inicial de instrucciones que soportará nuestro intérprete.
// La clave del Record es el mnemónico de la instrucción en minúsculas.
export const MIPS_INSTRUCTION_SET: Record<string, InstructionDefinition> = {
  // --- Tipo R ---
  'add': {
    mnemonic: 'add',
    type: 'R',
    opcode: OPCODES.r_type, // Todas las tipo R tienen opcode '000000'
    funct: FUNCT_CODES.add,
    formatString: "rd, rs, rt", // Orden de operandos en la sintaxis assembly
    description: "Suma el contenido de los registros 'rs' y 'rt' (interpretados como números con signo) y almacena el resultado en el registro 'rd'. Si ocurre un desbordamiento (overflow), se genera una excepción."
  },
  // (Podrías añadir 'sub' aquí de manera similar si quieres)
  // 'sub': {
  //   mnemonic: 'sub',
  //   type: 'R',
  //   opcode: OPCODES.r_type,
  //   funct: FUNCT_CODES.sub,
  //   formatString: "rd, rs, rt",
  //   description: "Resta el contenido del registro 'rt' del registro 'rs' (interpretados como números con signo) y almacena el resultado en 'rd'. Si ocurre un desbordamiento (overflow), se genera una excepción."
  // },

  // --- Tipo I ---
  'addi': {
    mnemonic: 'addi',
    type: 'I',
    opcode: OPCODES.addi,
    // funct no aplica para tipo I
    formatString: "rt, rs, immediate", // rt es el destino, rs es fuente, immediate es valor de 16 bits con signo extendido
    description: "Suma el contenido del registro 'rs' con el valor inmediato de 16 bits (extendido con signo a 32 bits) y almacena el resultado en el registro 'rt'. Si ocurre un desbordamiento (overflow), se genera una excepción."
  },
  'lw': {
    mnemonic: 'lw',
    type: 'I', // Load Word es una instrucción de tipo I
    opcode: OPCODES.lw,
    formatString: "rt, offset(rs)", // rt es el destino, offset es el inmediato, rs es el registro base
    description: "Carga una palabra (32 bits) desde la memoria a 'rt'. La dirección de memoria se calcula sumando 'offset' (inmediato de 16 bits, con signo extendido) al contenido de 'rs'."
  },
  'sw': {
    mnemonic: 'sw',
    type: 'I', // Store Word es una instrucción de tipo I
    opcode: OPCODES.sw,
    formatString: "rt, offset(rs)", // rt es la fuente, offset es el inmediato, rs es el registro base
    description: "Almacena una palabra (32 bits) desde 'rt' en la memoria. La dirección de memoria se calcula sumando 'offset' (inmediato de 16 bits, con signo extendido) al contenido de 'rs'."
  },
  'beq': {
    mnemonic: 'beq',
    type: 'I', // Branch on Equal es de tipo I (opcode, rs, rt, offset/label)
    opcode: OPCODES.beq,
    formatString: "rs, rt, label", // rs y rt son registros a comparar, label es el desplazamiento relativo de 16 bits (multiplicado por 4)
    description: "Si el contenido del registro 'rs' es igual al contenido del registro 'rt', salta a la dirección indicada por 'label'. El 'label' es un desplazamiento relativo a la instrucción siguiente, multiplicado por 4."
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