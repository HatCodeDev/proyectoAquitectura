// src/pages/index.tsx
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import {Alert} from "@heroui/alert";
import { MipsInputForm } from '@/components/mips/MipsInputForm';
import { useMipsInterpreter } from '@/hooks/useMipsInterpreter';
import { InstructionOutput } from '@/components/mips/InstructionOutput';
import { FieldsBreakdown } from '@/components/mips/FieldsBreakdown';

export default function IndexPage() {
  const { isLoading, result, error, processInstruction } = useMipsInterpreter();
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-10">
        {/* ... (Título y descripción de la página) ... */}
         <div className="inline-block max-w-2xl text-center justify-center">
           <h1 className="text-4xl font-bold sm:text-5xl">
             Intérprete de Instrucciones <span className="text-primary">MIPS</span>
           </h1>
           <p className="mt-4 text-lg text-default-600 dark:text-default-400">
             Ingresa una instrucción MIPS para analizarla. Obtendrás su tipo, formato binario, hexadecimal,
             el desglose de sus campos y una explicación de su funcionamiento.
           </p>
         </div>


        <div className="mt-8 w-full flex justify-center px-4">
          <MipsInputForm onSubmit={processInstruction} isLoading={isLoading} />
        </div>

        <div className="mt-8 w-full max-w-xl px-4 min-h-[100px]">
          {isLoading && (
            <div className="text-center p-4 rounded-lg bg-default-100 dark:bg-default-50">
              <p className="text-lg font-medium text-primary">Procesando instrucción...</p>
            </div>
          )}

          {error && !isLoading && (
            <Alert
            color="danger"
            description={error.stage}
            title={error.message}
            variant="faded"
            />
          )}

          

          {result && !isLoading && (
            <div className="w-full flex flex-col gap-6"> 
              <InstructionOutput result={result} />
              <FieldsBreakdown fields={result.fields} instructionType={result.type} />
            </div>
          )}
        </div>

        {/* ... (Enlaces a Documentación y GitHub) ... */}
        <div className="flex gap-3 mt-10">
           <Link
             isExternal
             className={buttonStyles({
               color: "primary",
               radius: "full",
               variant: "ghost",
             })}
             href= "https://docs.google.com/document/d/15tOtJuFUu27OmmSu3ZK5unWYdtx8h-SQ5qMJf4wjwXk/edit?usp=sharing"
           >
             Documentación
           </Link>
           <Link
             isExternal
             className={buttonStyles({ variant: "bordered", radius: "full" })}
             href={siteConfig.links.github}
           >
             <GithubIcon size={20} />
             GitHub del Proyecto
           </Link>
         </div>
      </section>
    </DefaultLayout>
  );
}