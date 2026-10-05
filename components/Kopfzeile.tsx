import Link from "next/link";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import type { Einstellungen, Material, Texte } from "@/lib/content/modell";
import { telLink } from "@/lib/assets";
import { Bild } from "./Bild";
import { NavLink } from "./NavLink";
import { Register } from "./Register";
import { SmartLink } from "./SmartLink";

/** «+41 44 432 61 61» → «044 432 61 61» (Anzeige für Besucher in der Schweiz) */
export function telefonAnzeige(telefon: string): string {
  return telefon.replace(/^\+41\s?/, "0");
}

/**
 * Kopfzeile: Logo, zwei Seitenlinks, Materialregister, Telefon und der eine Aufruf «Projekt besprechen».
 * Die Kontaktseite steht nicht zusätzlich als Link daneben: ein Ziel, eine Beschriftung.
 */
export function Kopfzeile({ einstellungen: e, texte: t, materialien }: { einstellungen: Einstellungen; texte: Texte; materialien: Material[] }) {
  const anzeige = telefonAnzeige(e.telefon);
  const seitenlinks = t.navigation.filter((n) => n.ziel !== t.kopf.aufruf.ziel);
  return (
    <header className="sticky top-0 z-30 border-b border-linie-stark bg-wand/92 backdrop-blur-md">
      <div className="behaelter flex h-16 items-center gap-2 sm:gap-3 lg:h-[4.5rem]">
        <Link href="/" className="mr-auto flex min-h-11 shrink-0 items-center" aria-label={`${e.firma}, zur Startseite`}>
          <Bild bild={e.logo} alt="" sizes="150px" prio className="h-9 w-auto sm:h-10 lg:h-11" />
        </Link>
        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="klein flex items-center">
            {seitenlinks.map((n) => (
              <li key={n.ziel}>
                <NavLink ziel={n.ziel} className="inline-flex min-h-11 items-center px-3.5 text-[0.9375rem] font-semibold underline-offset-8 hover:text-blau-tief hover:underline" aktivKlasse="text-blau-tief underline">
                  {n.text}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <a href={telLink(e.telefon)} className="klein inline-flex min-h-11 min-w-11 items-center justify-center gap-2 px-1 font-semibold hover:text-blau-tief xl:px-3" aria-label={`${t.kopf.telefonLabel}: ${anzeige}`}>
          <PhoneIcon size={22} aria-hidden="true" />
          <span className="hidden xl:inline">{anzeige}</span>
        </a>
        <Register texte={t.kopf} navigation={t.navigation} materialien={materialien} telefon={e.telefon} telefonAnzeige={anzeige} email={e.email} />
        <SmartLink ziel={t.kopf.aufruf.ziel} className="knopf knopf-primaer knopf-klein hidden sm:inline-flex">{t.kopf.aufruf.text}</SmartLink>
      </div>
    </header>
  );
}
