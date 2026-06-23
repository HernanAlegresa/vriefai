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
  createdAt: string;
}
