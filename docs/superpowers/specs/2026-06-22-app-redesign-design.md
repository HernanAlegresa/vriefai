# VRIEFAI App Redesign — Spec

**Fecha:** 2026-06-22
**Estado:** Aprobado, en implementación

---

## Objetivo

Rediseño completo: pasar de una sola página de generación a un sistema de gestión de marcas con historial. Datos en localStorage para la fase de testing.

---

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Redirect a `/brands` |
| `/brands` | Lista de marcas |
| `/brands/new` | Crear marca |
| `/brands/[brandId]` | Detalle de marca + historial |
| `/brands/[brandId]/edit` | Editar marca |
| `/brands/[brandId]/generate` | Nueva programación (formulario + output streaming) |

---

## Schema localStorage

```typescript
// Clave: "vriefai_brands"
interface Brand {
  id: string;           // nanoid
  name: string;
  briefPermanente: string;
  analisisRedes: string;
  vocabulario: {
    usa: string;        // texto libre
    evita: string;      // texto libre
  };
  createdAt: string;    // ISO 8601
  updatedAt: string;
}

// Clave: "vriefai_generations"
interface Generation {
  id: string;
  brandId: string;
  briefMensual: string;
  cantReels: number;
  cantCarruseles: number;
  cantHistorias: number;
  output: string;       // markdown completo
  createdAt: string;
}
```

---

## Arquitectura de componentes

```
src/
├── lib/
│   ├── types.ts              Brand, Generation
│   └── utils.ts              cn(), formatDate(), truncate()
├── hooks/
│   ├── useBrands.ts          CRUD sobre localStorage
│   └── useGenerations.ts     CRUD filtrado por brandId
├── components/
│   ├── ui/
│   │   ├── Button.tsx        Variants: primary, secondary, ghost, danger
│   │   ├── Textarea.tsx      Con label y description
│   │   └── Badge.tsx
│   ├── layout/
│   │   ├── AppShell.tsx      Sidebar + main wrapper
│   │   └── Sidebar.tsx       Navegación con lista de marcas (re-lee en cada ruta)
│   ├── brands/
│   │   ├── BrandCard.tsx     Tarjeta en lista
│   │   └── BrandForm.tsx     Form reutilizable crear/editar
│   └── generations/
│       ├── GenerationCard.tsx  Card expandible en historial
│       ├── GenerationForm.tsx  Brief mensual + volúmenes
│       └── GenerationOutput.tsx  Streaming (pre) → markdown (ReactMarkdown)
└── app/
    ├── globals.css            Dark theme, typography plugin
    ├── layout.tsx             AppShell
    ├── page.tsx               Redirect
    ├── brands/...
    └── api/generate/route.ts  + vocabulario en prompt
```

---

## Decisiones clave

- **Next.js 16 / React 19:** params es `Promise<{...}>`, se desempaqueta con `use()` en client components.
- **Tailwind v4:** `@import "tailwindcss"` + `@plugin "@tailwindcss/typography"` en globals.css.
- **Sidebar reactivity:** re-lee localStorage en cada cambio de pathname para reflejar marcas nuevas.
- **Streaming output:** durante el stream muestra `<pre>`, al terminar cambia a `<ReactMarkdown>`.
- **Vocabulario en prompt:** se inyecta entre `analisisRedes` y `briefMensual`. Solo se incluye el bloque si hay contenido.
- **Paleta:** zinc-950/900/800. Inspiración: Linear, Vercel, Raycast.
- **Framer Motion:** page entrance (opacity + y), sidebar hover items, accordion en GenerationCard.
