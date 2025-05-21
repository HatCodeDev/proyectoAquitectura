// src/components/mips/FieldsBreakdown.tsx
import React from 'react';
// --- IMPORTACIONES SEPARADAS DE HEROUI ---
import { Card, CardHeader, CardBody } from "@heroui/card"; // CardFooter no se usa aquí
import { Code } from '@heroui/code';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from "@heroui/table";
// --- FIN IMPORTACIONES HEROUI ---
import { MipsInstructionFields, InstructionType } from '@/types';

interface FieldsBreakdownProps {
  fields?: MipsInstructionFields;
  instructionType?: InstructionType;
}

const fieldDefinitions: Record<InstructionType, Array<{ fieldKey: keyof MipsInstructionFields; label: string; bits: number }>> = {
  'R': [
    { fieldKey: 'opcode', label: 'Opcode', bits: 6 },
    { fieldKey: 'rs', label: 'rs', bits: 5 },
    { fieldKey: 'rt', label: 'rt', bits: 5 },
    { fieldKey: 'rd', label: 'rd', bits: 5 },
    { fieldKey: 'shamt', label: 'shamt', bits: 5 },
    { fieldKey: 'funct', label: 'funct', bits: 6 },
  ],
  'I': [
    { fieldKey: 'opcode', label: 'Opcode', bits: 6 },
    { fieldKey: 'rs', label: 'rs', bits: 5 },
    { fieldKey: 'rt', label: 'rt', bits: 5 },
    { fieldKey: 'immediate', label: 'Immediate', bits: 16 },
  ],
  'J': [
    { fieldKey: 'opcode', label: 'Opcode', bits: 6 },
    { fieldKey: 'address', label: 'Address', bits: 26 },
  ],
  'Unknown': [],
};

const columns = [
  { key: 'label', label: 'CAMPO' },
  { key: 'value', label: 'VALOR BINARIO' },
  { key: 'bits', label: 'BITS' },
];

// Definimos el tipo para nuestros items de fila para mayor claridad y seguridad de tipos
interface RowDataItem {
  id: string;
  label: string;
  value: string; // El valor del campo MIPS (binario)
  bits: number;
}

export const FieldsBreakdown: React.FC<FieldsBreakdownProps> = ({ fields, instructionType }) => {
  if (!fields || !instructionType || instructionType === 'Unknown' || !fieldDefinitions[instructionType] || fieldDefinitions[instructionType].length === 0) {
    return null;
  }

  const rowsData: RowDataItem[] = fieldDefinitions[instructionType]
    .filter(fieldInfo => fields[fieldInfo.fieldKey] !== undefined)
    .map((fieldInfo, index) => ({
      id: `${instructionType}-${fieldInfo.fieldKey}-${index}`,
      label: fieldInfo.label.toUpperCase(),
      value: fields[fieldInfo.fieldKey] || 'N/A',
      bits: fieldInfo.bits,
    }));

  if (rowsData.length === 0) {
    return null;
  }

  return (
    <Card className="w-full shadow-lg mt-6">
      <CardHeader className="pb-2">
        <h3 className="text-xl font-semibold text-foreground">Desglose de Campos (Formato {instructionType})</h3>
      </CardHeader>
      <CardBody className="pt-2">
        <Table
          aria-label={`Desglose de campos para instrucción tipo ${instructionType}`}
          removeWrapper
          className="min-w-full"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                className="text-left text-sm font-semibold text-default-600 dark:text-default-300 uppercase bg-default-100 dark:bg-default-50/50 px-3 py-2"
                style={{ textAlign: column.key === 'bits' ? 'right' : 'left' }}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={rowsData} emptyContent={"No hay campos para mostrar."}>
            {(item: RowDataItem) => ( // Especificamos el tipo de 'item'
              <TableRow key={item.id} className="border-b border-default-200 dark:border-default-100 last:border-b-0">
                {(columnKey) => {
                  // Acceso directo a la propiedad del item usando la columnKey
                  // Aseguramos que columnKey es una clave válida de RowDataItem
                  const cellValue = item[columnKey as keyof RowDataItem];

                  return (
                    <TableCell
                      className={`px-3 py-2 ${columnKey === 'label' ? 'font-medium text-foreground' : ''} ${columnKey === 'bits' ? 'text-right text-default-500' : ''}`}
                    >
                      {columnKey === 'value' ? (
                        <Code color="default" className="text-sm bg-transparent p-0">
                          {String(cellValue)}
                        </Code>
                      ) : (
                        String(cellValue) 
                      )}
                    </TableCell>
                  );
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};