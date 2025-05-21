// src/types/mips.ts

// Necesitamos importar TokenizedInstruction desde donde la definiste
// Asumiendo que está en parser.ts y que tienes el alias @ configurado
import { TokenizedInstruction } from '@/features/mipsInterpreter/utils/parser';

// DEFINICIÓN DE TIPO DE INSTRUCCIÓN (R, I, J)
export type InstructionType = 'R' | 'I' | 'J' | 'Unknown';

// DEFINICIÓN DE UNA INSTRUCCIÓN EN EL CONJUNTO DE INSTRUCCIONES
// Esta es la que usa instructionSet.ts
export interface InstructionDefinition {
  mnemonic: string;
  type: InstructionType;
  opcode: string; // Binario, para comparación
  funct?: string; // Binario, para tipo R
  formatString: string; // Ej: "rd, rs, rt" o "rt, rs, immediate"
  description: string; // La explicación textual
}

// CAMPOS DESGLOSADOS DE UNA INSTRUCCIÓN (RESULTADO FINAL, BINARIO)
export interface MipsInstructionFields {
  opcode: string;
  rs?: string;
  rt?: string;
  rd?: string;
  shamt?: string;
  funct?: string;
  immediate?: string;
  address?: string;
}

// OPERANDOS PARSEADOS (ANTES DE CONVERTIR A NÚMEROS/BINARIO)
export interface ParsedOperands {
  // Para instrucciones tipo R y algunas I
  rdName?: string;         // Ej: "$t0"
  rsName?: string;         // Ej: "$s1"
  rtName?: string;         // Ej: "$s2"
  shamtValue?: number;

  // Para instrucciones tipo I (addi, lw, sw, beq)
  immediateValue?: number; // Para addi, o el offset para lw/sw, beq
  labelName?: string;      // Para beq, j (la etiqueta literal)

  // Para lw/sw con formato "offset(base)"
  // 'immediateValue' contendrá el offset.
  // 'rsName' (o un nuevo campo si prefieres) contendrá el registro base.
  // Por simplicidad inicial, podemos tratar de encajarlo en rsName e immediateValue
  // o podrías tener:
  // baseRegisterForOffset?: string; // Ej: "$sp" para lw $t0, 0($sp)

  // Para tipo J (j, jal)
  // 'labelName' o 'addressLabel' puede usarse para el target_address.

  // Para shamt en instrucciones de shift (aún no las implementamos)
  // shamtValue?: number;
}

// RESULTADO DE LA INTERPRETACIÓN (ESTA ES LA IMPORTANTE PARA EL ERROR DE 'tokenized')
export interface MipsInterpretationResult {
  rawInstruction: string;
  tokenized: TokenizedInstruction | null; // <<<--- AÑADIDO/ASEGURADO
  mnemonic: string;                       // <<<--- AÑADIDO/ASEGURADO
  type: InstructionType;                  // <<<--- AÑADIDO/ASEGURADO
  explanation: string;                    // <<<--- AÑADIDO/ASEGURADO

  // Los siguientes campos se añadirán en pasos futuros de lógica:
  parsedOperands?: ParsedOperands;
  fields?: MipsInstructionFields;
  binary?: string;
  hexadecimal?: string;
}

// Estructura para errores
export interface MipsError {
  message: string;
  stage?: 'tokenization' | 'parsing' | 'identification' | 'conversion' | 'field_extraction';
}