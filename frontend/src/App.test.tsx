import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { App } from "./App";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>().mockImplementation(() =>
      Promise.resolve(new Response("[]", { status: 200 })),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("näyttää oletuksena backlog-näkymän", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Backlog ja ADR" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Backlog" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Backlog" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("vaihtaa navigaatiosta arkkitehtuuripäätöksiin ja takaisin", async () => {
    const user = userEvent.setup();
    render(<App />);
    const nav = screen.getByRole("navigation", { name: "Päänavigaatio" });
    expect(nav).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Arkkitehtuuripäätökset" }));
    expect(
      await screen.findByRole("heading", { name: "Arkkitehtuuripäätökset", level: 2 }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Backlog" }));
    expect(await screen.findByRole("heading", { name: "Backlog", level: 2 })).toBeInTheDocument();
  });
});
