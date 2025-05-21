export interface TokenizedInstruction {
  mnemonic: string;
  operandsString: string | null;
}

export function tokenizeInstruction(rawInstruction: string): TokenizedInstruction | null {
  // 1. Remover comentarios (todo lo que sigue a '#')
  let cleanedInstruction = rawInstruction.split('#')[0];

  // 2. Recortar espacios al inicio y final de la instrucción
  cleanedInstruction = cleanedInstruction.trim();

  // 3. Si la cadena está vacía después de limpiar, no hay nada que tokenizar
  if (!cleanedInstruction) {
    return null; // Indica que no hay instrucción válida
  }

  // 4. Buscar el primer espacio para separar el mnemónico del resto
  const firstSpaceIndex = cleanedInstruction.indexOf(' ');

  let mnemonic: string;
  let operandsString: string | null = null;

  if (firstSpaceIndex === -1) {
    // No hay espacios, significa que es una instrucción sin operandos (ej. "syscall")
    mnemonic = cleanedInstruction.toLowerCase(); // Convertir a minúsculas para consistencia
  } else {
    // Hay espacios, separar mnemónico y operandos
    mnemonic = cleanedInstruction.substring(0, firstSpaceIndex).toLowerCase();
    operandsString = cleanedInstruction.substring(firstSpaceIndex + 1).trim();
    // Si operandsString queda vacío después del trim, es como no tener operandos
    if (operandsString === "") {
        operandsString = null;
    }
  }

  // No debería ser necesario este chequeo si cleanedInstruction tiene contenido,
  // pero por si acaso.
  // if (!mnemonic) return null;

  return { mnemonic, operandsString };
}