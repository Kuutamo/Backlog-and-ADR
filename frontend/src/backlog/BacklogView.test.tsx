import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Story } from "../api/stories";
import { BacklogView } from "./BacklogView";

function story(overrides: Partial<Story>): Story {
  return {
    id: "1",
    title: "Tarina",
    description: null,
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

describe("BacklogView", () => {
  it("näyttää rajapinnasta ladatut tarinat", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        story({ id: "2", title: "Toinen", description: "Kuvaus" }),
        story({ id: "1", title: "Ensimmäinen" }),
      ]),
    );

    render(<BacklogView />);

    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Toinen");
    expect(items[0]).toHaveTextContent("Kuvaus");
    expect(items[1]).toHaveTextContent("Ensimmäinen");
  });

  it("kertoo, kun backlog on tyhjä", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    render(<BacklogView />);

    expect(await screen.findByText("Backlogissa ei ole vielä tarinoita.")).toBeInTheDocument();
  });

  it("vaatii otsikon eikä lähetä tyhjää tarinaa", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));
    const user = userEvent.setup();
    render(<BacklogView />);
    await screen.findByText("Backlogissa ei ole vielä tarinoita.");

    await user.type(screen.getByLabelText("Otsikko"), "   ");
    await user.click(screen.getByRole("button", { name: "Lisää tarina" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Otsikko on pakollinen.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("tallentaa uuden tarinan ja näyttää sen listan ensimmäisenä", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse([story({ id: "1", title: "Vanha" })]))
      .mockResolvedValueOnce(
        jsonResponse(story({ id: "2", title: "Uusi", description: "Kuvaus" }), 201),
      );
    const user = userEvent.setup();
    render(<BacklogView />);
    await screen.findByText("Vanha");

    await user.type(screen.getByLabelText("Otsikko"), "Uusi");
    await user.type(screen.getByLabelText("Kuvaus"), "Kuvaus");
    await user.click(screen.getByRole("button", { name: "Lisää tarina" }));

    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Uusi");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/stories",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Uusi", description: "Kuvaus" }),
      }),
    );
    expect(screen.getByLabelText("Otsikko")).toHaveValue("");
  });

  it("näyttää virheen, jos tarinoiden haku epäonnistuu", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    render(<BacklogView />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Tarinoiden haku epäonnistui");
  });
});
