// src/features/mipsInterpreter/mipsLogic.ts
import { tokenizeInstruction } from './utils/parser';
import { MipsInterpretationResult, MipsError, InstructionDefinition } from '@/types'; // Ajusta la ruta
import { MIPS_INSTRUCTION_SET } from './data/instructionSet'; // Importa el conjunto de instrucciones

export function interpretMipsInstruction(
  rawInstruction: string
): Partial<MipsInterpretationResult> | MipsError {

  const tokenized = tokenizeInstruction(rawInstruction);

  if (!tokenized) {
    return {
      message: 'Instrucción vacía o solo comentarios.',
      stage: 'tokenization',
    };
  }

  // Buscar la definición de la instrucción basada en el mnemónico
  const instructionDef: InstructionDefinition | undefined = MIPS_INSTRUCTION_SET[tokenized.mnemonic];

  if (!instructionDef) {
    return {
      message: `Mnemónico desconocido: '${tokenized.mnemonic}'`,
      stage: 'parsing', // Cambiamos la etapa del error
    };
  }

  // Si encontramos la definición, podemos empezar a poblar más campos del resultado
  const result: Partial<MipsInterpretationResult> = {
    rawInstruction: rawInstruction,
    tokenized: tokenized,
    mnemonic: instructionDef.mnemonic, // Tomado de la definición
    type: instructionDef.type,         // Tomado de la definición
    explanation: instructionDef.description, // Tomado de la definición
    // Campos como binary, hexadecimal, fields, parsedOperands se añadirán en los siguientes pasos.
  };

  return result;
}