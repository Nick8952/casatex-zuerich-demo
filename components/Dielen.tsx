import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { pfade, type Leistung } from "@/lib/content/modell";
import { Bild } from "./Bild";

/**
 * Leistungsbereiche als «Dielen»: lange Bretter, die wie in einem Schiffsboden versetzt liegen.
 * Jede Diele ist ein einziger Link zur Seite des Bereichs.
 */
export function Dielen({ leistungen, stufe = 3 }: { leistungen: Leistung[]; stufe?: 2 | 3 }) {
  const Titel = stufe === 2 ? "h2" : "h3";
  return (
    <ul className="dielen">
      {leistungen.map((l) => (
        <li key={l.slug} className="diele-platz">
          <Link href={pfade.leistung(l.slug)} className="diele">
            <div className="diele-bild">
              <Bild bild={l.bild} alt="" sizes="(min-width: 48rem) 28vw, 100vw" />
            </div>
            <div className="diele-text">
              <Titel className="titel-2">{l.titel}</Titel>
              <p className="lauftext text-tinte-2">{l.kurz}</p>
            </div>
            <div className="diele-ende" aria-hidden="true">
              <ArrowRightIcon size={30} weight="regular" className="diele-pfeil text-blau-tief" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
