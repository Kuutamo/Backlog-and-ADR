// Backlogin rajapinta-asiakas. Tyypit on kirjoitettu käsin; T-02 korvaa ne
// backendin OpenAPI-kuvauksesta generoiduilla.

export interface Story {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface NewStory {
  title: string;
  description?: string;
}

const BASE_URL = "/api/stories";

export async function fetchStories(): Promise<Story[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error(`Tarinoiden haku epäonnistui (${response.status})`);
  }
  return (await response.json()) as Story[];
}

export async function createStory(story: NewStory): Promise<Story> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(story),
  });
  if (!response.ok) {
    throw new Error(`Tarinan tallennus epäonnistui (${response.status})`);
  }
  return (await response.json()) as Story;
}
