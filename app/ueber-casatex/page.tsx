import type { Metadata } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { Aufruf } from "@/components/Aufruf";
import { Aussagen } from "@/components/Aussagen";
import { Seitenkopf } from "@/components/Seitenkopf";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getUeberSeite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.ueber, bild: s.bild, einstellungen: e, texte: t });
}

export default async function UeberSeite() {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getUeberSeite()]);
  return (
    <>
      <Seitenkopf titel={s.titel} text={s.einleitung} bild={s.bild} symbolText={t.ui.symbolbild} />

      <section className="behaelter abschnitt" aria-labelledby="aussagen-titel">
        <h2 id="aussagen-titel" className="titel-2 auftauchen">{s.aussagenTitel}</h2>
        <div className="mt-10">
          <Aussagen aussagen={s.aussagen} quellenTitel={t.ui.quellen} />
        </div>
      </section>

      <section className="behaelter pb-4" aria-labelledby="zweck-titel">
        <figure className="auftauchen border-l-[3px] border-blau py-2 pl-6 lg:pl-10">
          <figcaption>
            <h2 id="zweck-titel" className="etikett">{s.zweck.titel}</h2>
          </figcaption>
          <blockquote className="titel-2 mt-4 max-w-[26ch] font-medium" cite={s.zweck.herkunft[0].url}>
            <p>«{s.zweck.zitat}»</p>
          </blockquote>
          <p className="klein mt-5 text-grau">{s.zweck.text}</p>
        </figure>
      </section>

      <Aufruf titel={s.aufruf.titel} text={s.aufruf.text} knopf={s.aufruf.knopf} einstellungen={e} />
    </>
  );
}
