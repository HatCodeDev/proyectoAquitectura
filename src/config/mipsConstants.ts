// src/config/mipsConstants.ts

export const REGISTERS: { [key: string]: number } = {
  '$zero': 0, '$0': 0,                                // Cero
  '$at': 1,                                         // Ensamblador Temporal
  '$v0': 2, '$v1': 3,                                // Valores de Retorno de Función
  '$a0': 4, '$a1': 5, '$a2': 6, '$a3': 7,            // Argumentos de Función
  '$t0': 8, '$t1': 9, '$t2': 10, '$t3': 11,          // Temporales
  '$t4': 12, '$t5': 13, '$t6': 14, '$t7': 15,
  '$s0': 16, '$s1': 17, '$s2': 18, '$s3': 19,          // Guardados (Saved)
  '$s4': 20, '$s5': 21, '$s6': 22, '$s7': 23,
  '$t8': 24, '$t9': 25,                               // Más Temporales
  '$k0': 26, '$k1': 27,                               // Reservados para el Kernel del OS
  '$gp': 28,                                        // Puntero Global
  '$sp': 29,                                        // Puntero de Pila (Stack Pointer)
  '$fp': 30, '$s8': 30,                              // Puntero de Marco (Frame Pointer) o $s8
  '$ra': 31                                         // Dirección de Retorno
};

// Opcodes para las instrucciones que vamos a definir inicialmente
// El valor es el string binario de 6 bits del opcode.
export const OPCODES: { [key: string]: string } = {
  'r_type': '000000', // Opcode para todas las instrucciones tipo R
  'addi':   '001000',
  'lw':     '100011',
  'sw':     '101011',
  'beq':    '000100',
  'j':      '000010',
  // --- NUEVOS OPCODES ---
  'bne':    '000101', // Branch on Not Equal
  // 'andi': '001100', // (Ejemplo para futuras expansiones)
  // 'ori':  '001101', // (Ejemplo para futuras expansiones)
};

// Funct codes para las instrucciones tipo R que vamos a definir inicialmente.
// El valor es el string binario de 6 bits del campo funct.
export const FUNCT_CODES: { [key: string]: string } = {
  'add':    '100000', // ADD (causa excepción en overflow)
  'sub':    '100010', // SUB (causa excepción en overflow)
  // --- NUEVOS FUNCT CODES ---
  'and':    '100100', // AND lógico
  'sll':    '000000', // Shift Left Logical (usa shamt, no rs)
  'slt':    '101010', // Set on Less Than (con signo)
  // 'or':   '100101', // (Ejemplo para futuras expansiones)
  // 'xor':  '100110', // (Ejemplo para futuras expansiones)
  // 'srl':  '000010', // (Ejemplo para futuras expansiones)
  // 'sra':  '000011', // (Ejemplo para futuras expansiones)
  // 'jr':   '001000', // (Ejemplo para futuras expansiones)
};