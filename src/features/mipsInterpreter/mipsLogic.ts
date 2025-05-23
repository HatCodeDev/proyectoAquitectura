// src/features/mipsInterpreter/mipsLogic.ts
import { assembleInstruction, binaryToHex } from './utils/converter';
import {
  MipsInterpretationResult, MipsError, InstructionDefinition,
  ParsedOperands, MipsInstructionFields // Asegúrate que ParsedOperands esté aquí
} from '@/types';
import { tokenizeInstruction, parseOperands, TokenizedInstruction } from './utils/parser';
import { MIPS_INSTRUCTION_SET } from './data/instructionSet';

export function interpretMipsInstruction(
  rawInstruction: string
): Partial<MipsInterpretationResult> | MipsError {

  const tokenizedResult = tokenizeInstruction(rawInstruction);
  if ('message' in tokenizedResult) {
    return tokenizedResult;
  }
  const currentTokenized: TokenizedInstruction = tokenizedResult;

  const instructionDef = MIPS_INSTRUCTION_SET[currentTokenized.mnemonic];
  if (!instructionDef) {
    return { message: `Mnemónico desconocido: '${currentTokenized.mnemonic}'`, stage: 'parsing' };
  }

  // VVV --- ESTA ES LA PARTE QUE NECESITA CORRECCIÓN/ADICIÓN --- VVV
  const parsedOperandsResult = parseOperands(currentTokenized.operandsString, instructionDef.formatString);

  // Chequear si parseOperands devolvió un error
  if (parsedOperandsResult && 'message' in parsedOperandsResult) { // Es un MipsError
    return parsedOperandsResult; // Propagamos el error del parseo de operandos
  }
  // Si no es error, entonces es ParsedOperands. Lo asignamos a currentParsedOperands.
  const currentParsedOperands: ParsedOperands = parsedOperandsResult as ParsedOperands;
  // ^^^ --- FIN DE LA CORRECCIÓN/ADICIÓN --- ^^^

  // --- LÓGICA DE CONVERSIÓN (AHORA currentParsedOperands está definida) ---
  const assemblyResult = assembleInstruction(instructionDef, currentParsedOperands); // Ahora debería encontrarla
  if ('message' in assemblyResult) { // Es un MipsError
    return assemblyResult;
  }
  const { binary: assembledBinary, fields: assembledFields } = assemblyResult;

  const hexValueResult = binaryToHex(assembledBinary);
  if (typeof hexValueResult !== 'string' && 'message' in hexValueResult) {
      return hexValueResult;
  }
  const finalHexValue = hexValueResult as string;

  const result: Partial<MipsInterpretationResult> = {
    rawInstruction: rawInstruction,
    tokenized: currentTokenized,
    mnemonic: instructionDef.mnemonic,
    type: instructionDef.type,
    explanation: instructionDef.description,
    parsedOperands: currentParsedOperands, // También se usa aquí
    binary: assembledBinary,
    hexadecimal: finalHexValue,
    fields: assembledFields,
  };

  return result;
}