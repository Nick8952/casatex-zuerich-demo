import type { Metadata } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { RichText } from "@/components/RichText";
import { Seitenkopf } from "@/components/Seitenkopf";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getRechtSeite("datenschutz")]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.datenschutz, einstellungen: e, texte: t });
}

export default async function DatenschutzSeite() {
  const q = await inhaltsquelle();
  const s = await q.getRechtSeite("datenschutz");
  return (
    <>
      <Seitenkopf titel={s.titel} text={s.einleitung} />
      <div className="behaelter abschnitt">
        <RichText bloecke={s.bloecke} />
        <p className="klein mt-12 text-grau">Stand: {s.stand}</p>
      </div>
    </>
  );
}
