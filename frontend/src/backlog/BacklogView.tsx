import { type FormEvent, useEffect, useState } from "react";

import { createStory, fetchStories, type Story } from "../api/stories";

export function BacklogView() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStories()
      .then((loaded) => {
        if (!cancelled) setStories(loaded);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(errorMessage(reason));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Otsikko on pakollinen.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const trimmedDescription = description.trim();
      const created = await createStory({
        title: trimmedTitle,
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
      });
      setStories((current) => [created, ...current]);
      setTitle("");
      setDescription("");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="backlog-heading">
      <h2 id="backlog-heading">Backlog</h2>

      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        <label htmlFor="story-title">Otsikko</label>
        <input
          id="story-title"
          value={title}
          maxLength={200}
          required
          onChange={(event) => setTitle(event.target.value)}
        />
        <label htmlFor="story-description">Kuvaus</label>
        <textarea
          id="story-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button type="submit" disabled={saving}>
          Lisää tarina
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Ladataan tarinoita…</p>
      ) : stories.length === 0 ? (
        <p>Backlogissa ei ole vielä tarinoita.</p>
      ) : (
        <ul aria-label="Tarinat">
          {stories.map((story) => (
            <li key={story.id}>
              <strong>{story.title}</strong>
              {story.description && <p>{story.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : "Tuntematon virhe";
}
