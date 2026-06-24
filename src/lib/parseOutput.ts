export type SectionType =
  | "strategy"
  | "reels"
  | "carousels"
  | "stories"
  | "generic";

export interface ContentItem {
  id: string;
  rawTitle: string;
  title: string;
  content: string;
  index: number;
  suggestedDate: string | null;
}

export interface OutputSection {
  id: string;
  rawTitle: string;
  label: string;
  type: SectionType;
  content: string;
  items: ContentItem[];
}

export function parseGenerationOutput(output: string): OutputSection[] {
  if (!output.trim()) return [];

  const rawSections = output.split(/^(?=## )/m).filter((s) => s.trim());
  const sections: OutputSection[] = [];

  for (const raw of rawSections) {
    const lines = raw.split("\n");
    const headingMatch = lines[0].match(/^## (.+)/);
    if (!headingMatch) continue;

    const rawTitle = headingMatch[1].trim();
    const body = lines.slice(1).join("\n").trim();
    const meta = getSectionMeta(rawTitle);
    if (!meta) continue; // Skip unrecognized headings (month names, dates, etc.)
    const { label, type } = meta;

    sections.push({
      id: `section-${sections.length}`,
      rawTitle,
      label,
      type,
      content: body,
      items: type !== "strategy" ? parseItems(body, type) : [],
    });
  }

  return sections;
}

function getSectionMeta(
  title: string
): Pick<OutputSection, "label" | "type"> | null {
  const t = title.toUpperCase();
  if (t.includes("PLANIF") || t.includes("ESTRATEG"))
    return { label: "Estrategia", type: "strategy" };
  if (t.includes("REEL")) return { label: "Reels", type: "reels" };
  if (t.includes("CARRUSEL")) return { label: "Carruseles", type: "carousels" };
  if (t.includes("HISTORI")) return { label: "Historias", type: "stories" };
  return null; // Unrecognized heading (month names, dates, etc.) — skip it
}

function extractSuggestedDate(content: string): string | null {
  const m = content.match(
    /\*\*Fecha sugerida:\*\*\s*(\d{1,2}\s+de\s+[a-záéíóúü]+)/i,
  );
  return m ? m[1].trim() : null;
}

function parseItems(content: string, type: SectionType): ContentItem[] {
  if (!content.includes("### ")) return [];

  return content
    .split(/^(?=### )/m)
    .filter((part) => /^### /.test(part)) // Skip any preamble before the first item
    .map((part, index) => {
      const lines = part.split("\n");
      const headingMatch = lines[0].match(/^### (.+)/);
      const rawTitle = headingMatch
        ? headingMatch[1].trim()
        : `Ítem ${index + 1}`;
      const itemContent = headingMatch
        ? lines.slice(1).join("\n").trim()
        : part.trim();

      return {
        id: `item-${index}`,
        rawTitle,
        title: cleanItemTitle(rawTitle, type),
        content: itemContent,
        index,
        suggestedDate: extractSuggestedDate(itemContent),
      };
    });
}

function cleanItemTitle(title: string, type: SectionType): string {
  const patterns: Partial<Record<SectionType, RegExp>> = {
    reels: /^reels?\s*\d+\s*[:\-–—·\.]*\s*/i,
    carousels: /^carruseles?\s*\d+\s*[:\-–—·\.]*\s*/i,
    stories: /^historias?\s*\d+\s*[:\-–—·\.]*\s*/i,
  };

  const pattern = patterns[type];
  if (pattern) {
    // Always return the stripped string — empty string means bare "Type N" heading (no subtitle)
    return title.replace(pattern, "").trim();
  }

  return title.replace(/^\d+[\.\s\-–—]+\s*/, "").trim();
}
