// src/components/mips/InstructionOutput.tsx
import React from 'react';
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import { Code } from '@heroui/code';
import { MipsInterpretationResult } from '@/types';
import {Chip} from "@heroui/chip";

interface InstructionOutputProps {
  result: Partial<MipsInterpretationResult>;
}

export const InstructionOutput: React.FC<InstructionOutputProps> = ({ result }) => {
  if (!result) {
    return null;
  }

  // Función para formatear la cadena binaria con espacios
  const formatBinaryString = (binaryStr: string | undefined, chunkSize = 8): string => {
    if (!binaryStr) return 'N/A';
    const chunks = [];
    for (let i = 0; i < binaryStr.length; i += chunkSize) {
      chunks.push(binaryStr.substring(i, i + chunkSize));
    }
    return chunks.join(' ');
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-2"> {/* Menos padding inferior para el header */}
        <h3 className="text-xl font-semibold text-foreground">Análisis General</h3>
      </CardHeader>
      <CardBody className="pt-2 space-y-3"> {/* Menos padding superior para el body */}
        <div>
          <p className="text-sm text-default-500 mb-2">Instrucción Original:</p>
          <Code className="block w-full text-sm p-2 bg-default-100 rounded-md break-all">
            {result.rawInstruction || 'N/A'}
          </Code>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-sm text-default-500 mb-2">Mnemónico:</p>
            <Chip color="secondary" variant="shadow">
              {result.mnemonic || 'N/A'}
            </Chip>
            
          </div>
          <div>
            <p className="text-sm text-default-500 mb-2">Tipo:</p>
            <Chip color="primary" variant="shadow">
              {result.type || 'N/A'}
            </Chip>
            
          </div>
        </div>
        {result.binary && (
          <div>
            <p className="text-sm text-default-500 mb-2">Binario (32 bits):</p>
            <Code className="block w-full text-xs sm:text-sm p-2 bg-default-100 rounded-md break-all">
              {formatBinaryString(result.binary)}
            </Code>
          </div>
        )}
        {result.hexadecimal && (
          <div>
            <p className="text-sm text-default-500 mb-2">Hexadecimal:</p>
            <Code className="block w-full text-sm p-2 bg-default-100 rounded-md">
              {result.hexadecimal || 'N/A'}
            </Code>
          </div>
        )}
      </CardBody>
      {result.explanation && (
        <CardFooter className="flex flex-col items-start pt-2 border-t border-default-200 dark:border-default-100">
          <p className="text-sm font-medium text-default-600  dark:text-white mb-1">Explicación:</p>
          <p className="text-sm text-default-700 dark:text-white">{result.explanation}</p>
        </CardFooter>
      )}
    </Card>
  );
};