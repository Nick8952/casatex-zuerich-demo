import { abschnitt, aufruf, aussage, bildMitText, bodenwahl, herkunft, verlegemuster, verweis } from "./objekte";
import { einstellungen, kontaktSeite, leistung, leistungenSeite, material, partner, rechtSeite, referenz, startseite, texte, ueberSeite } from "./dokumente";

/** Dokumente, die es genau einmal gibt (feste Kennung, kein «Neu anlegen», kein Löschen). */
export const EINZELDOKUMENTE = ["einstellungen", "texte", "startseite", "leistungenSeite", "ueberSeite", "kontaktSeite", "rechtSeite"];

export const schemaTypes = [
  // Objekte
  verweis, bildMitText, herkunft, aussage, abschnitt, verlegemuster, bodenwahl, aufruf,
  // Dokumente
  einstellungen, texte, startseite, leistungenSeite, ueberSeite, kontaktSeite, rechtSeite, leistung, material, referenz, partner,
];
