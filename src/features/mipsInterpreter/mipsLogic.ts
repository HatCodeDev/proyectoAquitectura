// src/features/mipsInterpreter/mipsLogic.ts
import { tokenizeInstruction, parseOperands } from './utils/parser';
// VVV--- AÑADE LAS IMPORTACIONES DEL CONVERTIDOR ---VVV
import { assembleInstruction, binaryToHex } from './utils/converter';
import {
  MipsInterpretationResult, MipsError, InstructionDefinition,
  ParsedOperands, MipsInstructionFields // <<<--- AÑADE MipsInstructionFields si no estaba
} from '@/types';
import { MIPS_INSTRUCTION_SET } from './data/instructionSet';

export function interpretMipsInstruction(
  rawInstruction: string
): Partial<MipsInterpretationResult> | MipsError {

  const tokenizedVal = tokenizeInstruction(rawInstruction);
  if (!tokenizedVal) { /* ... maneja error ... */ return { message: 'Error tokenización', stage: 'tokenization'}; }

  const instructionDef = MIPS_INSTRUCTION_SET[tokenizedVal.mnemonic];
  if (!instructionDef) { /* ... maneja error ... */ return { message: `Mnemónico desconocido: '${tokenizedVal.mnemonic}'`, stage: 'parsing' };}

  const parsedOperandsResult = parseOperands(tokenizedVal.operandsString, instructionDef.formatString);
  if ('message' in parsedOperandsResult) return parsedOperandsResult;
  const currentParsedOperands: ParsedOperands = parsedOperandsResult;

  // --- NUEVA LÓGICA DE CONVERSIÓN ---
  const assemblyResult = assembleInstruction(instructionDef, currentParsedOperands);
  if ('message' in assemblyResult) { // Es un MipsError
    return assemblyResult; // Propagamos el error del ensamblaje
  }

  // Si llegamos aquí, assemblyResult tiene .binary y .fields
  const { binary: assembledBinary, fields: assembledFields } = assemblyResult;

  const hexValueResult = binaryToHex(assembledBinary);
  if (typeof hexValueResult !== 'string' && 'message' in hexValueResult) { // Es un MipsError
      return hexValueResult; // Propagamos el error de la conversión a hexadecimal
  }
  const finalHexValue = hexValueResult as string; // Sabemos que es string si no es MipsError

  // --- FIN NUEVA LÓGICA ---

  const result: Partial<MipsInterpretationResult> = {
    rawInstruction: rawInstruction,
    tokenized: tokenizedVal,
    mnemonic: instructionDef.mnemonic,
    type: instructionDef.type,
    explanation: instructionDef.description,
    parsedOperands: currentParsedOperands,
    // --- AÑADIR NUEVOS CAMPOS AL RESULTADO ---
    binary: assembledBinary,
    hexadecimal: finalHexValue,
    fields: assembledFields,
  };

  return result;
}