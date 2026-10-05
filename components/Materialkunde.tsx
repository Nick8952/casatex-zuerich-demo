/* eslint-disable @next/next/no-img-element -- kleine, vorgerenderte Proben */
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import type { LeistungenSeite, Material } from "@/lib/content/modell";
import { kleinsteUrl } from "./Bild";
import { Verlegemuster } from "./Verlegemuster";

/**
 * Inhalt eines Materials: Abschnitte, Eigenschaften und (bei Parkett) gezeichnete Verlegemuster.
 * Das ist allgemeine Materialkunde und wird als solche bezeichnet; über das Angebot des Betriebs sagt sie nichts aus.
 */
export function MaterialInhalt({ material: m, hinweis, stufe }: { material: Material; hinweis: string; stufe: 3 | 4 | 5 }) {
  const Titel = `h${stufe}` as "h3" | "h4" | "h5";
  return (
    <div>
      <p className="etikett">{hinweis}</p>
      <div className="mt-4 grid gap-x-12 gap-y-6 md:grid-cols-2">
        {m.abschnitte.map((a) => (
          <div key={a._key}>
            <Titel className="titel-4">{a.titel}</Titel>
            <p className="lauftext mt-1.5">{a.text}</p>
          </div>
        ))}
      </div>
      {m.eigenschaften.length ? (
        <ul className="klein mt-7 flex flex-wrap gap-2">
          {m.eigenschaften.map((e) => (
            <li key={e} className="border border-linie-stark bg-papier px-3 py-1.5">{e}</li>
          ))}
        </ul>
      ) : null}
      {m.muster?.length ? (
        <ul className="mt-9 grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
          {m.muster.map((v) => (
            <li key={v._key}>
              <figure>
                <Verlegemuster art={v.art} titel={v.titel} />
                <figcaption className="mt-3">
                  <span className="titel-4 block">{v.titel}</span>
                  <span className="klein mt-1 block text-tinte-2">{v.text}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Materialkunde als Akkordeon, nach Materialgruppen geordnet. Jeder Eintrag ist ein natives <details> mit eigener Sprungmarke
 * («#material-kork»), damit Handmuster und Register direkt darauf verlinken können.
 */
export function Materialkunde({ materialien, gruppen, hinweis }: { materialien: Material[]; gruppen: LeistungenSeite["gruppen"]; hinweis: string }) {
  return (
    <div className="grid gap-14">
      {gruppen.map((g) => {
        const liste = materialien.filter((m) => m.gruppe === g.kennung);
        if (!liste.length) return null;
        return (
          <section key={g.kennung} className="grid gap-x-12 gap-y-5 lg:grid-cols-[13rem_minmax(0,1fr)]" aria-labelledby={`gruppe-${g.kennung}`}>
            <div className="lg:pt-5">
              <h3 id={`gruppe-${g.kennung}`} className="titel-3">{g.titel}</h3>
              <p className="klein mt-1 text-grau">{g.text}</p>
            </div>
            <div className="kunde">
              {liste.map((m) => (
                <details key={m.slug} id={`material-${m.slug}`}>
                  <summary>
                    {m.bild ? <img className="probe" src={kleinsteUrl(m.bild)} alt="" width={112} height={112} loading="lazy" decoding="async" /> : <span className="probe block" aria-hidden="true" />}
                    <span className="min-w-0">
                      <h4 className="titel-3">{m.titel}</h4>
                      <span className="klein mt-0.5 block text-grau">{m.kurz}</span>
                    </span>
                    <PlusIcon className="zeichen text-blau-tief" aria-hidden="true" />
                  </summary>
                  <div className="inhalt">
                    <MaterialInhalt material={m} hinweis={hinweis} stufe={5} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
