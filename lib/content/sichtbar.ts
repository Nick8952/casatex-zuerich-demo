import type { Einstellungen, Partner, Referenz } from "./modell";

/**
 * Die eine Regel dafür, welche optionalen Bereiche erscheinen. Seiten, Navigation, Fusszeile, Sitemap und strukturierte
 * Daten fragen alle hier nach, damit nie ein leerer Abschnitt oder ein Link ins Leere entsteht.
 *
 * Ein Bereich erscheint, sobald er mindestens einen Eintrag hat. Einträge ohne Quelle kann es nicht geben
 * (das Domainmodell verlangt `herkunft`).
 */
export function optionaleBereiche(daten: { einstellungen: Einstellungen; referenzen: Referenz[]; partner: Partner[] }) {
  return {
    oeffnungszeiten: daten.einstellungen.oeffnungszeiten.length > 0,
    referenzen: daten.referenzen.length > 0,
    partner: daten.partner.length > 0,
  };
}
