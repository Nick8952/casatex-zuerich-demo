import { ArrowRightIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import type { Einstellungen, Link as LinkTyp } from "@/lib/content/modell";
import { telLink } from "@/lib/assets";
import { telefonAnzeige } from "./Kopfzeile";
import { SmartLink } from "./SmartLink";

/** Abschluss einer Seite: eine Frage, ein Knopf, daneben die Telefonnummer als zweiter Weg. */
export function Aufruf({ titel, text, knopf, einstellungen: e }: { titel: string; text: string; knopf: LinkTyp; einstellungen: Einstellungen }) {
  return (
    <section className="behaelter abschnitt">
      <div className="auftauchen border-y border-linie-stark py-12 lg:py-16">
        <h2 className="titel-2 max-w-[20ch]">{titel}</h2>
        <p className="vorspann mt-4">{text}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <SmartLink ziel={knopf.ziel} className="knopf knopf-primaer">
            {knopf.text}
            <ArrowRightIcon size={18} weight="bold" aria-hidden="true" className="pfeil" />
          </SmartLink>
          <a href={telLink(e.telefon)} className="klein inline-flex min-h-11 items-center gap-2 text-base font-semibold hover:text-blau-tief">
            <PhoneIcon size={20} aria-hidden="true" />
            {telefonAnzeige(e.telefon)}
          </a>
        </div>
      </div>
    </section>
  );
}
