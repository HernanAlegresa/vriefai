type GenerateDraft = {
  briefMensual: string;
  cantReels: number;
  cantCarruseles: number;
  cantHistorias: number;
};

function draftKey(brandId: string) {
  return `vriefai:generate-draft:${brandId}`;
}

export function loadGenerateDraft(brandId: string): GenerateDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(draftKey(brandId));
    if (!raw) return null;
    return JSON.parse(raw) as GenerateDraft;
  } catch {
    return null;
  }
}

export function saveGenerateDraft(brandId: string, draft: GenerateDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(draftKey(brandId), JSON.stringify(draft));
}

export function clearGenerateDraft(brandId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(draftKey(brandId));
}
