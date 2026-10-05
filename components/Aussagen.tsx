import type { Aussage } from "@/lib/content/modell";
import { SmartLink } from "./SmartLink";

const datum = (iso: string) => iso.split("-").reverse().join(".");

/**
 * Was über das Unternehmen belegt ist. Jede Aussage zeigt auf Wunsch ihre Quelle mit Abrufdatum:
 * So bleibt nachvollziehbar, woher eine Angabe stammt, solange das Unternehmen sie nicht selbst bestätigt hat.
 */
export function Aussagen({ aussagen, mitQuellen = true, quellenTitel = "Quelle", stufe = 3 }: { aussagen: Aussage[]; mitQuellen?: boolean; quellenTitel?: string; stufe?: 2 | 3 }) {
  const Titel = stufe === 2 ? "h2" : "h3";
  return (
    <ul className="aussagen border-t border-linie-stark">
      {aussagen.map((a) => (
        <li key={a._key} className="grid gap-x-10 gap-y-2 border-b border-linie-stark py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:py-8">
          <Titel className="titel-3">{a.titel}</Titel>
          <div>
            <p className="lauftext">{a.text}</p>
            {a.link ? <p className="klein mt-2"><SmartLink ziel={a.link.ziel} className="textlink inline-flex min-h-11 items-center font-semibold">{a.link.text}</SmartLink></p> : null}
            {mitQuellen ? (
              <p className="klein mt-1 text-grau">
                {quellenTitel}: {a.herkunft.map((h) => `${h.quelle} (abgerufen am ${datum(h.abgerufen)})`).join("; ")}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
