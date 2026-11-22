import { type FormEvent, useEffect, useState } from "react";

import { type Adr, createAdr, fetchAdrs, type NewAdr } from "../api/adrs";

interface Field {
  name: keyof NewAdr;
  label: string;
  required: boolean;
}

const FIELDS: Field[] = [
  { name: "title", label: "Otsikko", required: true },
  { name: "context", label: "Konteksti", required: true },
  { name: "decision", label: "Päätös", required: true },
  { name: "alternatives", label: "Vaihtoehdot", required: false },
  { name: "consequences", label: "Seuraukset", required: false },
];

type FormValues = Record<keyof NewAdr, string>;

const EMPTY_FORM: FormValues = {
  title: "",
  context: "",
  decision: "",
  alternatives: "",
  consequences: "",
};

export function AdrView() {
  const [adrs, setAdrs] = useState<Adr[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAdrs()
      .then((loaded) => {
        if (!cancelled) setAdrs(loaded);
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
    const missing = FIELDS.filter((field) => field.required && !values[field.name].trim());
    if (missing.length > 0) {
      setError(`Täytä pakolliset kentät: ${missing.map((field) => field.label).join(", ")}.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createAdr(toNewAdr(values));
      setAdrs((current) => [...current, created]);
      setValues(EMPTY_FORM);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="adr-heading">
      <h2 id="adr-heading">Arkkitehtuuripäätökset</h2>

      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={`adr-${field.name}`}>{field.label}</label>
            {field.name === "title" ? (
              <input
                id={`adr-${field.name}`}
                value={values[field.name]}
                maxLength={200}
                required
                onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
              />
            ) : (
              <textarea
                id={`adr-${field.name}`}
                value={values[field.name]}
                required={field.required}
                onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
              />
            )}
          </div>
        ))}
        <button type="submit" disabled={saving}>
          Lisää päätös
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Ladataan päätöksiä…</p>
      ) : adrs.length === 0 ? (
        <p>Päätöksiä ei ole vielä kirjattu.</p>
      ) : (
        <ul aria-label="Päätökset">
          {adrs.map((adr) => (
            <li key={adr.id}>
              <strong>{adr.identifier}</strong> {adr.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function toNewAdr(values: FormValues): NewAdr {
  const adr: NewAdr = {
    title: values.title.trim(),
    context: values.context.trim(),
    decision: values.decision.trim(),
  };
  const alternatives = values.alternatives.trim();
  const consequences = values.consequences.trim();
  if (alternatives) adr.alternatives = alternatives;
  if (consequences) adr.consequences = consequences;
  return adr;
}

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : "Tuntematon virhe";
}
