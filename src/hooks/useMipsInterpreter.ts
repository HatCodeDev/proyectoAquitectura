// src/hooks/useMipsInterpreter.ts
import { useState, useCallback } from 'react';
import { MipsInterpretationResult, MipsError } from '@/types'; // Ajusta la ruta
import { interpretMipsInstruction } from '@/features/mipsInterpreter/mipsLogic'; // Importa la nueva lógica

export const useMipsInterpreter = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Ahora result y error usarán los tipos definidos
  const [result, setResult] = useState<Partial<MipsInterpretationResult> | null>(null);
  const [error, setError] = useState<MipsError | null>(null);

  const processInstruction = useCallback(async (instructionString: string) => {
    console.log("Hook: Recibida instrucción para procesar:", instructionString);
    setIsLoading(true);
    setResult(null);
    setError(null);

    // Simular un pequeño retraso para que se vea el isLoading
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!instructionString.trim()) {
      setError({ message: 'La instrucción no puede estar vacía.', stage: 'tokenization' });
      setIsLoading(false);
      return;
    }

    // Llamar a la lógica de interpretación real
    const interpretation = interpretMipsInstruction(instructionString);

    // Verificar si la interpretación resultó en un error o un resultado
    if (interpretation && 'message' in interpretation && 'stage' in interpretation) { // Es un MipsError
      console.error("Hook: Error de mipsLogic", interpretation);
      setError(interpretation as MipsError); // Hacemos cast porque ya verificamos
      setResult(null);
    } else if (interpretation) { // Es un Partial<MipsInterpretationResult>
      console.log("Hook: Resultado de mipsLogic", interpretation);
      setResult(interpretation as Partial<MipsInterpretationResult>);
      setError(null);
    } else {
      // Esto no debería ocurrir si interpretMipsInstruction siempre devuelve algo o lanza error
      setError({ message: 'Error desconocido durante la interpretación.', stage: 'tokenization'});
      setResult(null);
    }

    setIsLoading(false);
  }, []);

  return {
    isLoading,
    result,
    error,
    processInstruction,
  };
};