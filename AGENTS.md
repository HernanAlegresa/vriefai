# AGENTS.md — VRIEFAI

> Límite: 250 líneas. Leé esto completo antes de cada sesión. No asumas nada que no esté acá.

---

## Qué es VRIEFAI

SaaS multi-tenant para agencias de marketing de contenido. El diferencial: una IA que conoce a fondo a cada cliente y genera la programación mensual de contenido automáticamente, con contexto estructurado y acumulado por marca.

**El problema real que resuelve:** Sofía Alzaga, dueña de Manso Studio (agencia de marketing en Uruguay), tarda entre 1h15 y 2h por marca para armar una programación mensual de contenido usando IA de forma manual en ChatGPT, reconstruyendo el contexto desde cero cada vez. VRIEFAI elimina esa fricción.

**Modelo de negocio:** agencias pagan por workspace y cantidad de clientes activos.

---

## Personas

- **Hernán Alegresa** — co-fundador técnico, Full Stack con foco en frontend. Stack: Next.js, TypeScript estricto, Tailwind CSS, Supabase, Framer Motion, Vercel.
- **Sofía Alzaga** — co-fundadora, dueña de Manso Studio. Domain expert. Valida todo lo relacionado al flujo de agencia y calidad del output de IA.

---

## Lo que ya está validado (no rediseñar sin razón)

Estas decisiones tienen respaldo de pruebas reales. Cambiarse solo si hay evidencia concreta:

1. **Dos capas de contexto por marca:**
   - `brief_permanente` — se llena una vez en el onboarding. Nunca cambia salvo actualización manual.
   - `brief_mensual` — intenciones específicas del mes: lanzamientos, foco, acciones puntuales.

2. **Generación por formato, secuencial:** reels → carruseles → historias. La agencia aprueba cada bloque antes de continuar. No generar todo junto (degrada calidad y hace difícil iterar).

3. **Fase 1 = estructura en texto. Fase 2 = diseño.** La IA no genera diseño, genera el esqueleto: idea, storytelling, copy, texto slide por slide. Diseño es posterior.

4. **El análisis de redes es input esencial.** El brief solo no alcanza. En v1: la agencia pega un análisis externo (generado con ChatGPT u otra herramienta). En v2: integración con Instagram Graph API.

5. **Output validado por Sofía con marca real (Valka Barefoot):** carruseles e historias fueron aprobados para uso directo. Reels necesitan ajuste en el mix de pilares según etapa de posicionamiento de la marca.

---

## Stack técnico

```
Framework:     Next.js 14+ (App Router)
Lenguaje:      TypeScript estricto (strict: true)
Estilos:       Tailwind CSS
Base de datos: Supabase (PostgreSQL + Auth + Storage)
IA:            Anthropic API — modelo claude-sonnet-4-6
Animaciones:   Framer Motion (con criterio, no decorativo)
Deploy:        Vercel
Control de versiones: Git vía CLI (gh)
```

**Reglas de código:**
- TypeScript estricto siempre. Sin `any`, sin casting innecesario.
- Llamadas a la API de Anthropic siempre desde API routes de Next.js, nunca desde el cliente.
- Variables de entorno sensibles en `.env.local`, nunca hardcodeadas.
- Componentes pequeños y con responsabilidad única.
- Explicá el *por qué* de las decisiones no obvias, no solo el *qué*.

---

## El prompt del sistema de IA (núcleo del producto)

Este es el system prompt validado. Está en producción desde v0. Modificar solo con evidencia de Sofía:

```
Sos un estratega de contenido senior especializado en marcas de lifestyle 
y consumo en redes sociales, trabajando dentro de una agencia de marketing. 
Tu trabajo es generar la estructura de contenido mensual para una marca, 
en texto, lista para pasar a diseño.

Recibís: el brief permanente de la marca, el brief del mes, el análisis 
de su presencia en redes y los parámetros de volumen.

Reglas:
- Generás solo estructura e idea. No describís diseño visual ni colores ni tipografías.
- Cada pieza debe ser específica de esta marca, nunca contenido genérico intercambiable.
- Respetás el tono de voz real de la marca extraído del análisis.
- Mezclás los pilares de contenido: no todo puede ser venta de producto.
- Priorizás los formatos que ya demostraron funcionar para esta marca.
- Cada reel incluye: idea central, gancho de apertura, desarrollo del storytelling, cierre/CTA.
- Escribís en el español rioplatense de la marca.
- Considerás la etapa de posicionamiento de la marca (nueva vs establecida) 
  para definir el mix entre educación, lifestyle y venta directa.
```

---

## Flujo de la app (cómo trabaja la agencia)

```
1. Onboarding de marca
   → La agencia crea el cliente
   → Completa el brief permanente (formulario estructurado)
   → Carga el análisis de redes (texto pegado en v1)

2. Inicio de mes
   → La agencia completa el brief mensual (lanzamientos, foco, parámetros)
   → Define volumen: cuántos reels / carruseles / historias

3. Generación secuencial
   → Genera reels → revisa y aprueba → genera carruseles → revisa → genera historias
   → Cada bloque se puede regenerar de forma independiente

4. Output
   → Estructura en texto lista para pasar a diseño
   → (v2) exportar a herramientas de diseño o scheduling
```

---

## Estructura de base de datos (diseño inicial)

```sql
workspaces        → agencias (multi-tenant root)
clients           → marcas por workspace
brand_briefs      → brief permanente por cliente (1:1 con clients)
monthly_briefs    → brief mensual (N por cliente)
generations       → programaciones generadas (vinculadas a monthly_brief)
generation_items  → piezas individuales (reel, carrusel, historia) por generation
```

---

## Qué construir primero (v0 — objetivo de esta sesión)

**Una sola página funcional.** Sin auth, sin multi-tenant, sin base de datos todavía.

Objetivo: demostrar el flujo de punta a punta.

```
/app/page.tsx
  → Formulario con 3 campos:
      - brief_permanente (textarea)
      - analisis_redes (textarea)  
      - brief_mensual (textarea)
  → Selector: qué generar (reels / carruseles / historias)
  → Botón "Generar"
  → Output en streaming debajo

/app/api/generate/route.ts
  → Recibe los 3 campos + tipo de contenido
  → Construye el prompt con el system prompt del núcleo
  → Llama a la API de Anthropic con streaming
  → Devuelve el stream al cliente
```

**Criterio de éxito de v0:** pegar el brief de Valka, el análisis de Instagram y el brief mensual simulado, hacer clic en Generar, y ver los reels aparecer en pantalla con calidad comparable a lo validado con Sofía.

---

## Lo que NO hacer en v0

- No construir auth todavía
- No conectar Supabase todavía
- No construir multi-tenant todavía
- No optimizar tokens ni RAG
- No integrar Instagram API
- No diseño elaborado — funcionalidad primero

---

## Aprendizajes clave del test de validación

- Sin análisis de redes el output es genérico. Con él, es específico de marca.
- El brief de marca tiene que capturar la **etapa de posicionamiento** (marca nueva vs establecida). Cambia el mix de contenido.
- "Guardarropas" no es rioplatense. El tono coloquial importa y el modelo lo respeta si el análisis es bueno.
- Sofía tarda 1h15 en una programación que debería llevarle 30min. El dolor es real y medido.

---

## Cómo comportarse en esta sesión

- Construí v0 funcional antes de proponer features adicionales.
- Si algo no está claro, preguntá una sola cosa antes de proceder.
- No sobrediseñes. El objetivo es que funcione, no que sea bonito.
- Si encontrás una decisión técnica importante no cubierta acá, planteala antes de implementarla.
- El criterio de éxito es simple: Hernán puede pegar el brief de Valka y ver output de calidad en pantalla.