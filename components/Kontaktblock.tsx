import { ArrowUpRightIcon, EnvelopeSimpleIcon, MapPinIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import type { Einstellungen, Texte } from "@/lib/content/modell";
import { telLink } from "@/lib/assets";
import { telefonAnzeige } from "./Kopfzeile";
import { SmartLink } from "./SmartLink";

const weg = "group flex min-h-14 items-center gap-4 border-b border-linie-stark py-3";

/**
 * Direkte Kontaktwege: Telefon, E-Mail, Adresse mit externem Routenlink. Öffnungszeiten erscheinen nur, wenn welche erfasst sind.
 * Es wird keine Karte eingebettet; der Routenlink öffnet Google Maps erst nach dem Klick.
 */
export function Kontaktblock({ einstellungen: e, texte: t, oeffnungszeitenTitel }: { einstellungen: Einstellungen; texte: Texte; oeffnungszeitenTitel?: string }) {
  return (
    <div>
      <ul className="border-t border-linie-stark">
        <li>
          <a href={telLink(e.telefon)} className={weg}>
            <PhoneIcon size={26} aria-hidden="true" className="shrink-0 text-blau-tief" />
            <span>
              <span className="etikett block">{t.ui.telefon}</span>
              <span className="titel-3 block group-hover:text-blau-tief">{telefonAnzeige(e.telefon)}</span>
            </span>
          </a>
        </li>
        <li>
          <a href={`mailto:${e.email}`} className={weg}>
            <EnvelopeSimpleIcon size={26} aria-hidden="true" className="shrink-0 text-blau-tief" />
            <span className="min-w-0">
              <span className="etikett block">{t.ui.email}</span>
              <span className="titel-3 block break-words group-hover:text-blau-tief">{e.email}</span>
            </span>
          </a>
        </li>
        <li className="flex items-start gap-4 border-b border-linie-stark py-4">
          <MapPinIcon size={26} aria-hidden="true" className="mt-1 shrink-0 text-blau-tief" />
          <div>
            <span className="etikett block">{t.ui.adresse}</span>
            <address className="titel-3 not-italic">
              {e.firma}<br />{e.adresse.strasse}<br />{e.adresse.plz} {e.adresse.ort}
            </address>
            <SmartLink ziel={e.routenlink} className="textlink klein mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold">
              {t.footer.route}
              <ArrowUpRightIcon size={16} aria-hidden="true" />
            </SmartLink>
          </div>
        </li>
      </ul>
      {e.oeffnungszeiten.length && oeffnungszeitenTitel ? (
        <div className="mt-8">
          <h3 className="titel-4">{oeffnungszeitenTitel}</h3>
          <dl className="klein mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
            {e.oeffnungszeiten.map((o) => (
              <div key={o._key} className="contents">
                <dt className="font-semibold">{o.tage}</dt>
                <dd>{o.zeiten}</dd>
              </div>
            ))}
          </dl>
          {e.oeffnungszeitenHinweis ? <p className="klein mt-3 text-grau">{e.oeffnungszeitenHinweis}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
