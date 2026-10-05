import type { Metadata } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { AnkerOeffner } from "@/components/AnkerOeffner";
import { Aufruf } from "@/components/Aufruf";
import { Dielen } from "@/components/Dielen";
import { Materialkunde } from "@/components/Materialkunde";
import { Seitenkopf } from "@/components/Seitenkopf";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getLeistungenSeite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.leistungen, bild: s.bild, einstellungen: e, texte: t });
}

export default async function LeistungenSeite() {
  const q = await inhaltsquelle();
  const [e, t, s, leistungen, materialien] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getLeistungenSeite(), q.getLeistungen(), q.getMaterialien()]);
  return (
    <>
      <Seitenkopf titel={s.titel} text={s.einleitung} bild={s.bild} symbolText={t.ui.symbolbild} />

      <section className="behaelter abschnitt" aria-labelledby="bereiche-titel">
        <h2 id="bereiche-titel" className="titel-2 auftauchen">{s.bereicheTitel}</h2>
        <div className="mt-10">
          <Dielen leistungen={leistungen} />
        </div>
      </section>

      <section id="materialkunde" className="behaelter abschnitt scroll-mt-20" aria-labelledby="materialkunde-titel">
        <div className="auftauchen">
          <h2 id="materialkunde-titel" className="titel-2">{s.materialkundeTitel}</h2>
          <p className="vorspann mt-4">{s.materialkundeText}</p>
        </div>
        <div className="mt-12">
          <Materialkunde materialien={materialien} gruppen={s.gruppen} hinweis={t.ui.materialinfo} />
        </div>
        <AnkerOeffner praefix="material-" />
      </section>

      <Aufruf titel={s.aufruf.titel} text={s.aufruf.text} knopf={s.aufruf.knopf} einstellungen={e} />
    </>
  );
}
