// ADR-rekisterin rajapinta-asiakas. Tyypit on kirjoitettu käsin; T-02 korvaa ne
// backendin OpenAPI-kuvauksesta generoiduilla.

export interface Adr {
  id: string;
  number: number;
  identifier: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string | null;
  consequences: string | null;
  created_at: string;
}

export interface NewAdr {
  title: string;
  context: string;
  decision: string;
  alternatives?: string;
  consequences?: string;
}

const BASE_URL = "/api/adrs";

export async function fetchAdrs(): Promise<Adr[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error(`Päätösten haku epäonnistui (${response.status})`);
  }
  return (await response.json()) as Adr[];
}

export async function createAdr(adr: NewAdr): Promise<Adr> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adr),
  });
  if (!response.ok) {
    throw new Error(`Päätöksen tallennus epäonnistui (${response.status})`);
  }
  return (await response.json()) as Adr;
}
