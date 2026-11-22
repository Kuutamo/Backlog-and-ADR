import { useState } from "react";

import { AdrView } from "./adr/AdrView";
import { BacklogView } from "./backlog/BacklogView";

type View = "backlog" | "adr";

const VIEWS: { id: View; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "adr", label: "Arkkitehtuuripäätökset" },
];

export function App() {
  const [view, setView] = useState<View>("backlog");

  return (
    <main>
      <h1>Backlog ja ADR</h1>
      <nav aria-label="Päänavigaatio">
        <ul>
          {VIEWS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={view === item.id ? "page" : undefined}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {view === "backlog" ? <BacklogView /> : <AdrView />}
    </main>
  );
}
