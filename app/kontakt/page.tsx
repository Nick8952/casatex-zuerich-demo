import type { Metadata } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { optionaleBereiche } from "@/lib/content/sichtbar";
import { seitenMetadaten } from "@/lib/seo";
import { Anfrageformular } from "@/components/Anfrageformular";
import { Kontaktblock } from "@/components/Kontaktblock";
import { Seitenkopf } from "@/components/Seitenkopf";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getKontaktSeite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.kontakt, einstellungen: e, texte: t });
}

export default async function KontaktSeite() {
  const q = await inhaltsquelle();
  const [e, t, s, referenzen, partner] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getKontaktSeite(), q.getReferenzen(), q.getPartner()]);
  const bereiche = optionaleBereiche({ einstellungen: e, referenzen, partner });
  return (
    <>
      <Seitenkopf titel={s.titel} text={s.einleitung} />
      <div className="behaelter abschnitt grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
        <section aria-labelledby="direkt-titel">
          <h2 id="direkt-titel" className="titel-2">{s.direktTitel}</h2>
          <div className="mt-8">
            <Kontaktblock einstellungen={e} texte={t} oeffnungszeitenTitel={bereiche.oeffnungszeiten ? s.oeffnungszeitenTitel : undefined} />
          </div>
          <h3 className="titel-3 mt-10">{s.anfahrtTitel}</h3>
          <p className="lauftext mt-2 text-tinte-2">{s.anfahrtText}</p>
        </section>
        <section aria-label={t.formular.titel} className="border border-linie-stark bg-papier p-6 sm:p-9">
          <Anfrageformular texte={t.formular} empfaenger={e.email} />
        </section>
      </div>
    </>
  );
}
