import { render, screen } from "@testing-library/react";

import { App } from "./App";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>().mockResolvedValue(new Response("[]", { status: 200 })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("näyttää otsikon, navigaation ja backlog-näkymän", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Backlog ja ADR" })).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Päänavigaatio" });
    expect(nav).toHaveTextContent("Backlog");
    expect(nav).toHaveTextContent("Arkkitehtuuripäätökset");
    expect(await screen.findByRole("heading", { name: "Backlog" })).toBeInTheDocument();
  });
});
