import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Adr } from "../api/adrs";
import { AdrView } from "./AdrView";

function adr(overrides: Partial<Adr>): Adr {
  return {
    id: "1",
    number: 1,
    identifier: "ADR-001",
    title: "Päätös",
    context: "Konteksti",
    decision: "Päätös",
    alternatives: null,
    consequences: null,
    created_at: "2026-11-22T10:00:00Z",
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AdrView", () => {
  it("näyttää ADR:t tunnisteineen numerojärjestyksessä", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        adr({ id: "1", number: 1, identifier: "ADR-001", title: "Teknologiapino" }),
        adr({ id: "2", number: 2, identifier: "ADR-002", title: "Repon rakenne" }),
      ]),
    );

    render(<AdrView />);

    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("ADR-001");
    expect(items[0]).toHaveTextContent("Teknologiapino");
    expect(items[1]).toHaveTextContent("ADR-002");
  });

  it("kertoo, kun päätöksiä ei vielä ole", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    render(<AdrView />);

    expect(await screen.findByText("Päätöksiä ei ole vielä kirjattu.")).toBeInTheDocument();
  });

  it("vaatii otsikon, kontekstin ja päätöksen", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));
    const user = userEvent.setup();
    render(<AdrView />);
    await screen.findByText("Päätöksiä ei ole vielä kirjattu.");

    await user.type(screen.getByLabelText("Otsikko"), "Vain otsikko");
    await user.click(screen.getByRole("button", { name: "Lisää päätös" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Täytä pakolliset kentät: Konteksti, Päätös.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("tallentaa uuden ADR:n ja lisää sen listan loppuun", async () => {
    const created = adr({ id: "2", number: 2, identifier: "ADR-002", title: "Lisenssi" });
    fetchMock
      .mockResolvedValueOnce(jsonResponse([adr({ title: "Teknologiapino" })]))
      .mockResolvedValueOnce(jsonResponse(created, 201));
    const user = userEvent.setup();
    render(<AdrView />);
    await screen.findByText("Teknologiapino");

    await user.type(screen.getByLabelText("Otsikko"), "Lisenssi");
    await user.type(screen.getByLabelText("Konteksti"), "GPLv3 rajoittaa");
    await user.type(screen.getByLabelText("Päätös"), "MIT");
    await user.type(screen.getByLabelText("Vaihtoehdot"), "Apache 2.0");
    await user.click(screen.getByRole("button", { name: "Lisää päätös" }));

    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent("ADR-002");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/adrs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: "Lisenssi",
          context: "GPLv3 rajoittaa",
          decision: "MIT",
          alternatives: "Apache 2.0",
        }),
      }),
    );
    expect(screen.getByLabelText("Otsikko")).toHaveValue("");
  });
});
