import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { App } from "./App";

function emptyListResponse(): Promise<Response> {
  return Promise.resolve(new Response("[]", { status: 200 }));
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockImplementation(emptyListResponse));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("näyttää oletuksena backlog-näkymän", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Backlog ja ADR" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Backlog" })).toBeInTheDocument();
    const backlogButton = screen.getByRole("button", { name: "Backlog" });
    expect(backlogButton).toHaveAttribute("aria-current", "page");
  });

  it("vaihtaa navigaatiosta arkkitehtuuripäätöksiin ja takaisin", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Arkkitehtuuripäätökset" }));
    const adrHeading = await screen.findByRole("heading", { name: "Arkkitehtuuripäätökset" });
    expect(adrHeading).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Backlog" }));
    expect(await screen.findByRole("heading", { name: "Backlog" })).toBeInTheDocument();
  });
});
