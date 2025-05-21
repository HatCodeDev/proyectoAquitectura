import React, { useState } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';

interface MipsInputFormProps {
  onSubmit: (instruction: string) => Promise<void>;
  isLoading?: boolean;
}

export const MipsInputForm: React.FC<MipsInputFormProps> = ({ onSubmit, isLoading }) => {
  const [instruction, setInstruction] = useState<string>('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(instruction);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4 w-full max-w-xl">
      <Input
        type="text"
        label="Instrucción MIPS"
        placeholder="Ej: add $t0, $s1, $s2"
        value={instruction}
        onValueChange={setInstruction}
        isRequired
        isClearable
        className="flex-grow"
        disabled={isLoading}
      />
      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        disabled={isLoading || !instruction.trim()}
        className="w-full sm:w-auto"
        size="lg"
      >
        {isLoading ? 'Procesando...' : 'Interpretar'}
      </Button>
    </form>
  );
};