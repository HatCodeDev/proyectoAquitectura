# Proyecto Final: Simulador de Instrucciones MIPS

Este proyecto fue desarrollado para la materia de Arquitectura de Computadoras. Su objetivo principal es simular el procesamiento de instrucciones MIPS, permitiendo al usuario ingresar una instrucción y recibir un análisis detallado de la misma.

---

##  Objetivos del Proyecto

El simulador está diseñado para cumplir con los siguientes objetivos clave:

1.  **Ingreso de Instrucciones:** Permitir al usuario ingresar instrucciones en formato MIPS.
2.  **Identificación del Tipo:** Clasificar la instrucción ingresada como Tipo R, Tipo I o Tipo J.
3.  **Conversión a Binario:** Transformar la instrucción MIPS a su representación binaria de 32 bits.
4.  **Valor Hexadecimal:** Mostrar el valor hexadecimal correspondiente a la representación binaria.
5.  **Desglose de Campos:** Detallar los campos de la instrucción según su tipo:
    * **Opcode**: Código de operación.
    * **rs**: Registro fuente.
    * **rt**: Registro fuente/destino.
    * **rd**: Registro destino.
    * **shamt**: Cantidad de desplazamiento (shift amount).
    * **funct**: Código de función (para instrucciones tipo R).
    * **inmediato**: Valor inmediato (para instrucciones tipo I).
    * **dirección**: Dirección de salto (para instrucciones tipo J).
6.  **Explicación Funcional:** Proveer una descripción textual clara del funcionamiento de la instrucción 

---

## Características Principales (Salida del Simulador)

Al ingresar una instrucción MIPS, el simulador proporcionará:

* **Tipo de Instrucción:** (R, I, J)
* **Representación Binaria:** (ej: `000000 10001 10010 01000 00000 100000`)
* **Valor Hexadecimal:** (ej: `0x02324020`)
* **Desglose de Campos:**
    * `Opcode`: (ej: `000000`)
    * `rs`: (ej: `10001` - $17 o `$s1`)
    * `rt`: (ej: `10010` - $18 o `$s2`)
    * `rd`: (ej: `01000` - $8 o `$t0`)
    * `shamt`: (ej: `00000` - 0)
    * `funct`: (ej: `100000` - add)
    * `inmediato`: (N/A para tipo R, ej: `0000000000000100` - 4 para tipo I)
    * `dirección`: (N/A para tipo R/I, ej: `00000000000000000000000100` - 4 para tipo J)
* **Explicación de la Instrucción:** Descripción en lenguaje natural de lo que hace la instrucción (ej: "Suma el contenido del registro $s1 con el contenido del registro $s2 y almacena el resultado en el registro $t0").

---

##  Tecnologías Utilizadas

Este proyecto fue construido utilizando las siguientes tecnologías:

* [Vite](https://vitejs.dev/guide/): Un entorno de desarrollo frontend moderno y rápido.
* [HeroUI](https://heroui.com): Colección de componentes UI pre-construidos.
* [Tailwind CSS](https://tailwindcss.com): Un framework CSS "utility-first" para diseño rápido.
* [Tailwind Variants](https://tailwind-variants.org): Para gestionar variantes de estilos con Tailwind.
* [TypeScript](https://www.typescriptlang.org): Un superconjunto de JavaScript que añade tipado estático.
* [Framer Motion](https://www.framer.com/motion): Una librería para crear animaciones fluidas.

---

## Cómo Empezar

Ejecuta el siguiente comando para clonar el proyecto:

```bash
git clone https://github.com/HatCodeDev/proyectoAquitectura.git
```

### Instala las depecndencias

Puedes usar `npm`, `yarn`, `pnpm`, `bun`, ejemplo usando `npm`:

```bash
npm install
```

###  Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

###  Configuración de pnpm (Opcional)

Si estás utilizando pnpm, necesitas añadir el siguiente código a tu archivo .npmrc en la raíz del proyecto:

```bash
public-hoist-pattern[]=*@heroui/*
```
Después de modificar el archivo .npmrc, necesitas ejecutar pnpm install nuevamente para asegurar que las dependencias se instalen correctamente.
