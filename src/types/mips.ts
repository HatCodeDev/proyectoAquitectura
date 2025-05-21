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
  rsName?: string; // Ej: $t0
  rtName?: string;
  rdName?: string;
  immediateValue?: number | string; // Puede ser número o etiqueta antes de resolver
  addressLabel?: string; // Para saltos
  shamtValue?: number;
  // Para formatos como offset(base) en lw/sw
  offset?: number | string; // Puede ser número o etiqueta
  baseRegister?: string; // Ej: $sp
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