// Importaciones existentes de HeroUI y configuración
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet"; // Usaremos Snippet para errores
import { Code } from "@heroui/code"; // << --- AÑADE ESTA IMPORTACIÓN SI NO LA TIENES
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

// --- NUEVAS IMPORTACIONES PARA EL INTÉRPRETE MIPS ---
import { MipsInputForm } from '@/components/mips/MipsInputForm';
import { useMipsInterpreter } from '@/hooks/useMipsInterpreter'; // Asegúrate que la ruta sea correcta

export default function IndexPage() {
  const { isLoading, result, error, processInstruction } = useMipsInterpreter();

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-10">
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

        {/* ---- SECCIÓN DE RESULTADOS/ERRORES (AÑADIR ESTO) ---- */}
        <div className="mt-8 w-full max-w-xl px-4 min-h-[100px]"> {/* min-h para evitar saltos de layout */}
          {isLoading && (
            <div className="text-center p-4 rounded-lg bg-default-100 dark:bg-default-50">
              <p className="text-lg font-medium text-primary">Procesando instrucción...</p>
              {/* Aquí podrías añadir un componente Spinner de HeroUI si quieres */}
            </div>
          )}

          {error && !isLoading && (
            <Snippet hideSymbol hideCopyButton color="danger" className="w-full">
               <strong>Error:</strong> {error.message} {error.stage && `(Etapa: ${error.stage})`}
            </Snippet>
          )}

          {result && !isLoading && (
            <div className="flex flex-col gap-2 p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-500">
              <h3 className="text-lg font-semibold text-success-700 dark:text-success-300">Resultado Simulado:</h3>
                {JSON.stringify(result, null, 2)}
            </div>
          )}
        </div>
        {/* ---- FIN DE LA SECCIÓN DE RESULTADOS/ERRORES ---- */}

        <div className="flex gap-3 mt-10">
          <Link
            isExternal
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "ghost",
            })}
            href={siteConfig.links.docs}
          >
            Documentación HeroUI
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