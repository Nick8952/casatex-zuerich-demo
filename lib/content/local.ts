import "server-only";
import einstellungenRoh from "@/data/einstellungen.json";
import texteRoh from "@/data/texte.json";
import startseiteRoh from "@/data/startseite.json";
import leistungenRoh from "@/data/leistungen.json";
import materialienRoh from "@/data/materialien.json";
import referenzenRoh from "@/data/referenzen.json";
import partnerRoh from "@/data/partner.json";
import bilderRoh from "@/data/bilder.json";
import leistungenSeiteRoh from "@/data/seiten/leistungen.json";
import ueberSeiteRoh from "@/data/seiten/ueber-casatex.json";
import kontaktSeiteRoh from "@/data/seiten/kontakt.json";
import impressumRoh from "@/data/seiten/impressum.json";
import datenschutzRoh from "@/data/seiten/datenschutz.json";
import {
  einstellungenSchema, kontaktSeiteSchema, leistungSchema, leistungenSeiteSchema, materialSchema, partnerSchema, pruefen, rechtSeiteSchema,
  referenzSchema, startseiteSchema, texteSchema, ueberSeiteSchema,
  type Bild, type Inhaltsquelle, type Leistung, type Material,
} from "./modell";
import { bloecke, type RohBlock } from "./text";
import { z } from "zod";

/**
 * Lokale Inhaltsquelle: liest data/*.json, löst Bildkennungen und Materialverweise auf und prüft alles gegen das Domainmodell.
 * Das ist der Inhaltsbestand der GitHub-Pages-Demo. Dieselben Dateien sind die Vorlage für den Import nach Sanity (scripts/seed.mts).
 */
type BildEintrag = { id: string; breite: number; hoehe: number; alt: string; legende: string | null; symbolbild: boolean; nachweis: { urheber: string; titel: string; quelle: string; lizenz: string }; quellen: Bild["quellen"] };
const bilder = bilderRoh as unknown as Record<string, BildEintrag>;

export function bild(id: string): Bild {
  const b = bilder[id];
  if (!b) throw new Error(`Bild «${id}» fehlt in data/bilder.json (npm run bilder ausführen oder Kennung korrigieren).`);
  return { alt: b.alt, breite: b.breite, hoehe: b.hoehe, quellen: b.quellen, symbolbild: b.symbolbild, legende: b.legende ?? undefined, nachweis: { urheber: b.nachweis.urheber, quelle: b.nachweis.quelle, lizenz: b.nachweis.lizenz } };
}

const materialien: Material[] = pruefen(
  z.array(materialSchema),
  materialienRoh.map((m) => ({ ...m, bild: "bild" in m && m.bild ? bild(m.bild) : undefined })),
  "data/materialien.json",
).sort((a, b) => a.reihenfolge - b.reihenfolge);

function material(slug: string, wo: string): Material {
  const m = materialien.find((x) => x.slug === slug);
  if (!m) throw new Error(`${wo}: Material «${slug}» gibt es in data/materialien.json nicht.`);
  return m;
}

const leistungen: Leistung[] = pruefen(
  z.array(leistungSchema),
  leistungenRoh.map((l) => ({ ...l, bild: bild(l.bild), boden: bild(l.boden), materialien: l.materialien.map((s) => material(s, `Leistung «${l.slug}»`)) })),
  "data/leistungen.json",
).sort((a, b) => a.reihenfolge - b.reihenfolge);

const einstellungen = pruefen(einstellungenSchema, { ...einstellungenRoh, logo: bild(einstellungenRoh.logo), seoBild: bild(einstellungenRoh.seoBild) }, "data/einstellungen.json");
const texte = pruefen(texteSchema, texteRoh, "data/texte.json");
const startseite = pruefen(
  startseiteSchema,
  { ...startseiteRoh, hero: { ...startseiteRoh.hero, boeden: startseiteRoh.hero.boeden.map((b) => ({ ...b, bild: bild(b.bild) })) }, materialien: { ...startseiteRoh.materialien, bild: bild(startseiteRoh.materialien.bild) } },
  "data/startseite.json",
);
const leistungenSeite = pruefen(leistungenSeiteSchema, { ...leistungenSeiteRoh, bild: bild(leistungenSeiteRoh.bild) }, "data/seiten/leistungen.json");
const ueberSeite = pruefen(ueberSeiteSchema, { ...ueberSeiteRoh, bild: bild(ueberSeiteRoh.bild) }, "data/seiten/ueber-casatex.json");
const kontaktSeite = pruefen(kontaktSeiteSchema, kontaktSeiteRoh, "data/seiten/kontakt.json");
const impressum = pruefen(rechtSeiteSchema, { ...impressumRoh, bloecke: bloecke(impressumRoh.bloecke as RohBlock[]) }, "data/seiten/impressum.json");
const datenschutz = pruefen(rechtSeiteSchema, { ...datenschutzRoh, bloecke: bloecke(datenschutzRoh.bloecke as RohBlock[]) }, "data/seiten/datenschutz.json");
const referenzen = pruefen(z.array(referenzSchema), referenzenRoh, "data/referenzen.json");
const partner = pruefen(z.array(partnerSchema), partnerRoh, "data/partner.json");

export const lokaleQuelle: Inhaltsquelle = {
  getEinstellungen: async () => einstellungen,
  getTexte: async () => texte,
  getStartseite: async () => startseite,
  getLeistungen: async () => leistungen,
  getLeistung: async (slug) => leistungen.find((l) => l.slug === slug) ?? null,
  getMaterialien: async () => materialien,
  getLeistungenSeite: async () => leistungenSeite,
  getUeberSeite: async () => ueberSeite,
  getKontaktSeite: async () => kontaktSeite,
  getRechtSeite: async (slug) => (slug === "impressum" ? impressum : datenschutz),
  getReferenzen: async () => referenzen,
  getPartner: async () => partner,
  getBildnachweise: async () => {
    const gesehen = new Set<string>();
    return Object.values(bilder)
      .filter((b) => b.id !== "og-casatex")
      .filter((b) => (gesehen.has(b.nachweis.quelle) ? false : (gesehen.add(b.nachweis.quelle), true)))
      .map((b) => ({ titel: b.legende ?? b.alt, urheber: b.nachweis.urheber, quelle: b.nachweis.quelle, lizenz: b.nachweis.lizenz }));
  },
};
