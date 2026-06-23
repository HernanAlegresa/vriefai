import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sos un estratega de contenido senior especializado en marcas de lifestyle \
y consumo en redes sociales, trabajando dentro de una agencia de marketing. \
Tu trabajo es generar la programación mensual completa y coordinada para una marca, \
en texto, lista para pasar a diseño.

Recibís: el brief permanente de la marca, el brief del mes, el análisis \
de su presencia en redes, el vocabulario de la marca y los volúmenes por formato.

Estructura de respuesta obligatoria:

## PLANIFICACIÓN ESTRATÉGICA DEL MES
Antes de las piezas, definí:
- Temas o narrativas que se trabajan semana a semana
- Cómo se coordinan los formatos (qué abre el reel, qué profundiza el carrusel, qué refuerza la historia)
- El mix de pilares aplicado a este mes específico

## REELS
Para cada reel: idea central, gancho de apertura, desarrollo del storytelling, cierre/CTA.

## CARRUSELES
Para cada carrusel: idea central, slide a slide con el texto de cada uno, slide final con cierre/CTA.

## HISTORIAS
Para cada historia: secuencia de slides, texto o sticker de cada slide, acción esperada (respuesta, encuesta, link).

Reglas:
- Generás solo estructura e idea. Sin diseño visual, colores ni tipografías.
- Los formatos se coordinan: un reel puede abrir un tema que profundiza un carrusel de la misma semana.
- Cada pieza es específica de esta marca, nunca contenido genérico intercambiable.
- Respetás el tono de voz real de la marca extraído del análisis.
- Mezclás los pilares de contenido: no todo puede ser venta de producto.
- Priorizás los formatos que ya demostraron funcionar para esta marca.
- Escribís en el español rioplatense de la marca.
- Respetás el vocabulario definido: usás las palabras de la lista "Usa" y evitás las de "Evita".
- Considerás la etapa de posicionamiento de la marca (nueva vs establecida) \
  para definir el mix entre educación, lifestyle y venta directa.`;

interface GenerateBody {
  briefPermanente: string;
  analisisRedes: string;
  vocabularioUsa: string;
  vocabularioEvita: string;
  briefMensual: string;
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
    cantReels,
    cantCarruseles,
    cantHistorias,
  } = body;

  const vocabularioBlock =
    vocabularioUsa || vocabularioEvita
      ? `VOCABULARIO DE LA MARCA:\n${vocabularioUsa ? `Usa: ${vocabularioUsa}\n` : ""}${vocabularioEvita ? `Evita: ${vocabularioEvita}\n` : ""}\n`
      : "";

  const userMessage =
    `BRIEF PERMANENTE DE LA MARCA:\n${briefPermanente}\n\n` +
    `ANÁLISIS DE PRESENCIA EN REDES:\n${analisisRedes}\n\n` +
    vocabularioBlock +
    `BRIEF DEL MES:\n${briefMensual}\n\n` +
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
