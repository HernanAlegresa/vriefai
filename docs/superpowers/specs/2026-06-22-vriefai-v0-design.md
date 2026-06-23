# VRIEFAI v0 — Diseño

**Fecha:** 2026-06-22  
**Estado:** Aprobado por Hernán Alegresa

---

## Qué construye

Una sola página funcional que demuestra el flujo de punta a punta: pegar briefs + análisis → clic en Generar → ver output de IA en streaming, editable antes de aprobar.

Sin auth, sin base de datos, sin multi-tenant. Solo el núcleo que valida la propuesta de valor.

---

## Arquitectura

```
src/app/page.tsx              ← Client Component ('use client')
src/app/api/generate/route.ts ← Route Handler (POST, server-side)
```

La separación es obligatoria: la API key de Anthropic nunca sale del servidor.

---

## API Route (`/api/generate`)

**Input (JSON POST):**
```json
{
  "briefPermanente": "...",
  "analisisRedes": "...",
  "briefMensual": "...",
  "formato": "reels | carruseles | historias"
}
```

**Proceso:**
1. Construye el mensaje de usuario concatenando los 3 briefs + formato
2. Llama a Anthropic con `client.messages.create({ stream: true })`
3. Itera el stream y encodea cada `text_delta` en un `ReadableStream`
4. Retorna `new Response(stream)` con `Content-Type: text/plain`

**Modelo:** `claude-sonnet-4-6` (especificado en AGENTS.md)  
**Max tokens:** 4096  
**System prompt:** el validado por Sofía en AGENTS.md, sin modificar

---

## Página (`/`)

**Estado local:**
- `briefPermanente`, `analisisRedes`, `briefMensual` — strings de los textareas
- `formato` — `'reels' | 'carruseles' | 'historias'`
- `output` — string que se acumula durante el streaming
- `isLoading` — boolean

**Flujo del usuario:**
1. Completa los 3 textareas
2. Elige formato (radio buttons)
3. Clic en "Generar"
4. El output aparece en un textarea editable que se actualiza en tiempo real
5. La agencia edita el texto si necesita antes de aprobarlo

**Criterio de habilitar botón:** los 3 campos tienen contenido y no está cargando.

---

## Decisiones técnicas

- **Streaming:** `ReadableStream` nativo + `response.body.getReader()` en el cliente. Sin dependencias extra.
- **Output editable:** `<textarea>` con `onChange`, no `<pre>`. La agencia necesita poder modificar el output antes de aprobarlo.
- **Sin validación de esquema:** v0, API interna, type assertion es suficiente.
- **Error handling:** errores antes de iniciar stream → 500. Errores mid-stream → conexión se cierra.

---

## Criterio de éxito

Hernán pega el brief de Valka + análisis de Instagram + brief mensual simulado, hace clic en Generar, y ve los reels aparecer en pantalla con calidad comparable a lo validado con Sofía.
