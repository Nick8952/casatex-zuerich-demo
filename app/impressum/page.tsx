import type { Metadata } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { RichText } from "@/components/RichText";
import { Seitenkopf } from "@/components/Seitenkopf";
import { SmartLink } from "@/components/SmartLink";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getRechtSeite("impressum")]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.impressum, einstellungen: e, texte: t });
}

export default async function ImpressumSeite() {
  const q = await inhaltsquelle();
  const [s, nachweise] = await Promise.all([q.getRechtSeite("impressum"), q.getBildnachweise()]);
  // Die Liste der Bildnachweise wird aus dem Bildverzeichnis erzeugt und im Abschnitt «Bildnachweis» eingefügt.
  const start = s.bloecke.findIndex((b) => b.art === "titel" && b.anker === "bildnachweis");
  const naechster = start < 0 ? -1 : s.bloecke.findIndex((b, i) => i > start && b.art === "titel");
  const schnitt = start < 0 ? s.bloecke.length : naechster < 0 ? s.bloecke.length : naechster;
  return (
    <>
      <Seitenkopf titel={s.titel} text={s.einleitung} />
      <div className="behaelter abschnitt">
        <RichText bloecke={s.bloecke.slice(0, schnitt)} />
        {start >= 0 ? (
          <ul className="klein mt-6 grid max-w-[66ch] gap-3">
            {nachweise.map((n) => (
              <li key={n.quelle} className="border-t border-linie pt-3">
                <span className="font-semibold">{n.titel}</span>: {n.urheber}, {n.lizenz}.{" "}
                {n.quelle.startsWith("https://") ? <SmartLink ziel={n.quelle} className="textlink break-all">{n.quelle.replace(/^https:\/\//, "")}</SmartLink> : n.quelle}
              </li>
            ))}
          </ul>
        ) : null}
        <RichText bloecke={s.bloecke.slice(schnitt)} />
        <p className="klein mt-12 text-grau">Stand: {s.stand}</p>
      </div>
    </>
  );
}
