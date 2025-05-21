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
  // Usaremos 'r_type' como un identificador genérico para instrucciones tipo R en instructionSet.
  // El opcode real para TODAS las instrucciones tipo R es '000000'.
  'r_type': '000000',
  'addi':   '001000', // ADDI, ADDIU (usaremos ADDI por ahora)
  'lw':     '100011', // Load Word
  'sw':     '101011', // Store Word
  'beq':    '000100', // Branch on Equal
  'j':      '000010', // Jump
  // Podrías añadir más aquí si quieres, ej:
  // 'andi': '001100',
  // 'ori':  '001101',
  // 'slti': '001010',
  // 'lui':  '001111',
  // 'bne':  '000101',
  // 'jal':  '000011',
};

// Funct codes para las instrucciones tipo R que vamos a definir inicialmente.
// El valor es el string binario de 6 bits del campo funct.
export const FUNCT_CODES: { [key: string]: string } = {
  'add':    '100000', // ADD (con overflow)
  'sub':    '100010', // SUB (con overflow)
  // Podrías añadir más aquí si quieres, ej:
  // 'addu': '100001',
  // 'subu': '100011',
  // 'and':  '100100',
  // 'or':   '100101',
  // 'xor':  '100110',
  // 'nor':  '100111',
  // 'slt':  '101010',
  // 'sltu': '101011',
  // 'sll':  '000000', // Shift Left Logical (rd, rt, shamt)
  // 'srl':  '000010', // Shift Right Logical
  // 'jr':   '001000', // Jump Register (usa rs)
};