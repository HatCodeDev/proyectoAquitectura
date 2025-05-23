import React from 'react';
import { Card, CardHeader, CardBody } from "@heroui/react";
import { Code, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/react";
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

interface RowDataItem {
  id: string;
  label: string;
  value: string;
  bits: number;
}

export const FieldsBreakdown: React.FC<FieldsBreakdownProps> = ({ fields, instructionType }) => {
  if (!fields || !instructionType || instructionType === 'Unknown') return null;

  const fieldInfoList = fieldDefinitions[instructionType];
  if (!fieldInfoList || fieldInfoList.length === 0) return null;

  const rowsData: RowDataItem[] = fieldInfoList
    .filter(fieldInfo => fields[fieldInfo.fieldKey] !== undefined)
    .map((fieldInfo, index) => ({
      id: `${instructionType}-${fieldInfo.fieldKey}-${index}`,
      label: fieldInfo.label.toUpperCase(),
      value: fields[fieldInfo.fieldKey] || 'N/A',
      bits: fieldInfo.bits,
    }));

  return (
    <Card className="w-full shadow-lg mt-6">
      <CardHeader>
        <h3 className="text-xl font-semibold text-foreground">
          Desglose de Campos (Formato {instructionType})
        </h3>
      </CardHeader>
      <CardBody>
        <Table removeWrapper aria-label={`Desglose de campos para instrucción tipo ${instructionType}`}>
          <TableHeader>
            <TableColumn>CAMPO</TableColumn>
            <TableColumn>VALOR BINARIO</TableColumn>
            <TableColumn className="text-right">BITS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay campos para mostrar.">
            {rowsData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.label}</TableCell>
                <TableCell>
                  <Code color="default" className="text-sm bg-transparent p-0">
                    {item.value}
                  </Code>
                </TableCell>
                <TableCell className="text-right text-default-500">{item.bits}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};
