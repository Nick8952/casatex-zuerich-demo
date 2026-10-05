import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Einstellungen, Texte } from "@/lib/content/modell";
import { telLink } from "@/lib/assets";
import { Bild } from "./Bild";
import { EinwilligungFussLink } from "./Einwilligung";
import { telefonAnzeige } from "./Kopfzeile";
import { SmartLink } from "./SmartLink";

const zeile = "inline-flex min-h-11 items-center underline-offset-4 hover:text-blau-tief hover:underline";

/**
 * Fusszeile «Sockel»: beginnt mit der Sockelleiste. Oben gross der Leitsatz und die Adresse als Schriftbild,
 * darunter drei ruhige Spalten. Der Demo-Hinweis steht am Schluss, solange die Seite nicht indexiert werden darf.
 */
export function Fusszeile({ einstellungen: e, texte: t, zeigeDemoHinweis }: { einstellungen: Einstellungen; texte: Texte; zeigeDemoHinweis: boolean }) {
  const f = t.footer;
  return (
    <footer className="mt-20 bg-papier lg:mt-28">
      <div className="sockelleiste" />
      <div className="behaelter pb-10 pt-14 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end">
          <p className="titel-2 max-w-[14ch]">{f.leitsatz}</p>
          <div className="lg:justify-self-end">
            <Bild bild={e.logo} sizes="(min-width: 64rem) 260px, 200px" className="h-auto w-[200px] lg:w-[260px]" />
          </div>
        </div>

        <div className="klein mt-12 grid gap-10 border-t border-linie-stark pt-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h2 className="etikett">{f.kontaktTitel}</h2>
            <address className="mt-3 not-italic">
              <p className="titel-3">{e.adresse.strasse}<br />{e.adresse.plz} {e.adresse.ort}</p>
              <ul className="mt-3 grid">
                <li><a href={telLink(e.telefon)} className={zeile}>{telefonAnzeige(e.telefon)}</a></li>
                <li><a href={`mailto:${e.email}`} className={zeile}>{e.email}</a></li>
                <li>
                  <SmartLink ziel={e.routenlink} className={`${zeile} gap-1.5`}>
                    {f.route}
                    <ArrowUpRightIcon size={16} aria-hidden="true" />
                  </SmartLink>
                </li>
              </ul>
            </address>
          </div>
          <nav aria-label={f.seitenTitel}>
            <h2 className="etikett">{f.seitenTitel}</h2>
            <ul className="mt-3 grid">
              {t.navigation.map((n) => (
                <li key={n.ziel}><SmartLink ziel={n.ziel} className={zeile}>{n.text}</SmartLink></li>
              ))}
            </ul>
          </nav>
          <nav aria-label={f.rechtlichesTitel}>
            <h2 className="etikett">{f.rechtlichesTitel}</h2>
            <ul className="mt-3 grid">
              {f.rechtliches.map((n) => (
                <li key={n.ziel}><SmartLink ziel={n.ziel} className={zeile}>{n.text}</SmartLink></li>
              ))}
              <li><SmartLink ziel={f.bildnachweis.ziel} className={zeile}>{f.bildnachweis.text}</SmartLink></li>
              <li><EinwilligungFussLink titel={t.einwilligung.fussLink} /></li>
            </ul>
          </nav>
        </div>

        <p className="klein mt-10 border-t border-linie-stark pt-6 text-grau">{zeigeDemoHinweis ? f.demoHinweis : `© ${new Date().getFullYear()} ${f.copyright}`}</p>
      </div>
    </footer>
  );
}
