import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sos un estratega de contenido senior especializado en marcas de lifestyle y consumo en redes sociales, trabajando dentro de una agencia de marketing. Tu trabajo es generar la programación mensual completa y coordinada para una marca, en texto, lista para pasar a diseño.

Recibís: el brief permanente de la marca, el brief del mes, el análisis de su presencia en redes, el vocabulario de la marca y los volúmenes por formato.

---

ESTRUCTURA DE RESPUESTA OBLIGATORIA:

## PLANIFICACIÓN ESTRATÉGICA DEL MES
Antes de las piezas, definí:
- Temas o narrativas que se trabajan semana a semana
- Cómo se coordinan los formatos (qué abre el reel, qué profundiza el carrusel, qué refuerza la historia)
- El mix de pilares aplicado a este mes específico

## REELS
Para cada reel, usá exactamente este formato:

### Reel N — [título]
**Fecha sugerida:** [día] de [mes]
**Formato de producción:** [Voz en off / Hablando a cámara / Solo texto en pantalla / Combinado — especificá]
**Idea central:** Una oración. Qué cuenta este reel y por qué importa.
**Gancho de apertura:** El primer plano o frame. Qué se ve, qué dice el texto en pantalla o qué dice la persona. Tiene que generar tensión o curiosidad en menos de 3 segundos.
**Desarrollo:** Guión completo, momento a momento. Para cada segmento especificá:
- Qué se ve en pantalla (descripción de toma real y realizable, sin equipos de cine)
- Qué dice la voz en off o el texto superpuesto
- Duración aproximada del segmento
El desarrollo tiene que tener arco: apertura que engancha, tensión o progresión en el medio, resolución al final. No es una lista de frases — es una secuencia con ritmo.
**Cierre / CTA:** Última toma, texto final, copy del post, acción esperada.

## CARRUSELES
Para cada carrusel, usá exactamente este formato:

### Carrusel N — [título]
**Fecha sugerida:** [día] de [mes]
**Cantidad de slides:** máximo 4. Cada slide tiene que justificar su existencia — si la info cabe en 3, hacelo en 3.
**Idea central:** Una oración. Qué cuenta este carrusel y por qué importa.
Para cada slide:
**Slide N:**
- Texto principal (headline): corto, directo, máximo una línea
- Subtexto (opcional): una o dos líneas como máximo. Si no suma, no va.
- Recurso visual sugerido: qué imagen o elemento visual acompaña este slide
**Slide final — CTA:**
- Texto principal
- Acción esperada
- Copy del post

## HISTORIAS
Para cada historia, usá exactamente este formato:

### Historia N — [título]
**Fecha sugerida:** [día] de [mes]
**Objetivo:** Una oración. Qué tiene que lograr esta historia.
Para cada slide:
**Slide N:**
- Recurso visual principal: especificá si es imagen, video, meme, encuesta, caja de preguntas, slider, o texto solo. Si es imagen o video, describí qué muestra. Si es meme o referencia cultural, describí el concepto (sin depender de un meme específico que puede desactualizarse).
- Texto superpuesto (si aplica): breve, tono conversacional, no informativo. Las historias no son artículos.
- Sticker o interacción (si aplica): encuesta, caja de preguntas, link, slider de reacción.
- Acción esperada: qué hace la persona que ve este slide.

Las historias priorizan identificación sobre información. Antes de escribir cada slide preguntate: ¿esto hace que alguien se detenga o lo pasa de largo? Si la respuesta es "lo pasa de largo", reemplazalo por algo visual, humor, o una pregunta directa.

---

REGLAS GENERALES:

- Generás solo estructura e idea. Sin diseño visual, colores ni tipografías.
- Los formatos se coordinan: un reel puede abrir un tema que profundiza un carrusel de la misma semana.
- Cada pieza es específica de esta marca, nunca contenido genérico intercambiable.
- Respetás el tono de voz real de la marca extraído del análisis.
- Mezclás los pilares de contenido: no todo puede ser venta de producto.
- Priorizás los formatos que ya demostraron funcionar para esta marca.
- Escribís en el español rioplatense de la marca.
- Respetás el vocabulario definido: usás las palabras de la lista "Usa" y evitás las de "Evita".
- Considerás la etapa de posicionamiento de la marca (nueva vs establecida) para definir el mix entre educación, lifestyle y venta directa.
- Los reels tienen guión real, no ideas. Si no podés describir toma a toma qué se filma, no está listo.
- Los carruseles son concisos. Máximo 4 slides. La brevedad es una decisión estratégica, no una limitación.
- Las historias hablan como una persona, no como un folleto. Tono conversacional siempre.`;

interface GenerateBody {
  briefPermanente: string;
  analisisRedes: string;
  vocabularioUsa: string;
  vocabularioEvita: string;
  briefMensual: string;
  angulosEspecificos?: string;
  cantReels: number;
  cantCarruseles: number;
  cantHistorias: number;
}

export async function POST(request: Request) {
  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  const {
    briefPermanente,
    analisisRedes,
    vocabularioUsa,
    vocabularioEvita,
    briefMensual,
    angulosEspecificos,
    cantReels,
    cantCarruseles,
    cantHistorias,
  } = body;

  const vocabularioBlock =
    vocabularioUsa || vocabularioEvita
      ? `VOCABULARIO DE LA MARCA:\n${vocabularioUsa ? `Usa: ${vocabularioUsa}\n` : ""}${vocabularioEvita ? `Evita: ${vocabularioEvita}\n` : ""}\n`
      : "";

  const angulosBlock = angulosEspecificos
    ? `ÁNGULOS E IDEAS ESPECÍFICAS DEL MES:\n${angulosEspecificos}\n\n`
    : "";

  const userMessage =
    `BRIEF PERMANENTE DE LA MARCA:\n${briefPermanente}\n\n` +
    `ANÁLISIS DE PRESENCIA EN REDES:\n${analisisRedes}\n\n` +
    vocabularioBlock +
    `BRIEF DEL MES:\n${briefMensual}\n\n` +
    angulosBlock +
    `Volúmenes del mes:\n` +
    `- Reels: ${cantReels}\n` +
    `- Carruseles: ${cantCarruseles}\n` +
    `- Historias: ${cantHistorias}\n\n` +
    `Generá la programación mensual completa siguiendo la estructura indicada.`;

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 32000,
          stream: true,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
