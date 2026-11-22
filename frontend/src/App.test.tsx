import { render, screen } from "@testing-library/react";

import { App } from "./App";

describe("App", () => {
  it("näyttää otsikon ja molemmat näkymät navigaatiossa", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Backlog ja ADR" })).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Päänavigaatio" });
    expect(nav).toHaveTextContent("Backlog");
    expect(nav).toHaveTextContent("Arkkitehtuuripäätökset");
  });
});
