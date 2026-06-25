export interface Brand {
  id: string;
  name: string;
  briefPermanente: string;
  analisisRedes: string;
  vocabulario: {
    usa: string;
    evita: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Generation {
  id: string;
  brandId: string;
  briefMensual: string;
  cantReels: number;
  cantCarruseles: number;
  cantHistorias: number;
  output: string;
  month: number | null;
  year: number | null;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  generationId: string;
  type: "reel" | "carousel" | "story";
  number: number;
  sortOrder: number;
  title: string;
  suggestedDate: string | null;
  body: string;
  edited: boolean;
  createdAt: string;
}
