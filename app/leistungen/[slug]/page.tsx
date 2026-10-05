import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";
import { Aufruf } from "@/components/Aufruf";
import { Aussagen } from "@/components/Aussagen";
import { Bild } from "@/components/Bild";
import { MaterialInhalt } from "@/components/Materialkunde";
import { Seitenkopf } from "@/components/Seitenkopf";

// Statischer Export: Es gibt genau die Leistungsseiten, die beim Build in den Inhalten stehen.
// Eine neue Leistung im CMS erscheint mit dem nächsten Build (den das Veröffentlichen auslöst).
export const dynamicParams = false;

export async function generateStaticParams() {
  const q = await inhaltsquelle();
  return (await q.getLeistungen()).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const q = await inhaltsquelle();
  const [e, t, l] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getLeistung(slug)]);
  if (!l) return {};
  return seitenMetadaten({ titel: l.seoTitel ?? l.titel, beschreibung: l.seoBeschreibung ?? l.kurz, pfad: pfade.leistung(l.slug), bild: l.bild, einstellungen: e, texte: t });
}

export default async function LeistungSeite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const q = await inhaltsquelle();
  const [e, t, l, alle, uebersicht] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getLeistung(slug), q.getLeistungen(), q.getLeistungenSeite()]);
  if (!l) notFound();
  const andere = alle.filter((x) => x.slug !== l.slug);

  return (
    <>
      <Seitenkopf titel={l.titel} text={l.kurz} boden={l.boden} symbolText={t.ui.symbolbild} />

      <section className="behaelter abschnitt" aria-labelledby="bereich-titel">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="auftauchen">
            <p className="vorspann max-w-[40ch] text-tinte">{l.einleitung}</p>
          </div>
          <figure className="auftauchen">
            <Bild bild={l.bild} sizes="(min-width: 64rem) 45vw, 100vw" className="block aspect-[3/2] h-auto w-full object-cover" />
            {l.bild.symbolbild ? <figcaption className="klein mt-2.5 text-grau">{l.bild.legende ? `${l.bild.legende}. ` : ""}{t.ui.symbolbild}.</figcaption> : null}
          </figure>
        </div>
        <div className="mt-14 lg:mt-20">
          <h2 id="bereich-titel" className="titel-2 auftauchen">{t.ui.aussagenTitel}</h2>
          <div className="mt-8">
            <Aussagen aussagen={l.aussagen} quellenTitel={t.ui.quellen} />
          </div>
        </div>
      </section>

      <section className="behaelter abschnitt" aria-labelledby="materialkunde-titel">
        <h2 id="materialkunde-titel" className="titel-2 auftauchen">{t.ui.materialkundeTitel}</h2>
        <div className="mt-10 grid gap-14 lg:gap-20">
          {l.materialien.map((m) => (
            <article key={m.slug} className="grid gap-x-12 gap-y-6 border-t border-linie-stark pt-8 lg:grid-cols-[15rem_minmax(0,1fr)]" aria-labelledby={`m-${m.slug}`}>
              <div>
                <h3 id={`m-${m.slug}`} className="titel-3">{m.titel}</h3>
                <p className="klein mt-1.5 text-grau">{m.kurz}</p>
                {m.bild ? <Bild bild={m.bild} alt="" sizes="(min-width: 64rem) 15rem, 60vw" className="mt-5 block aspect-square h-auto w-40 object-cover lg:w-full" /> : null}
              </div>
              <MaterialInhalt material={m} hinweis={t.ui.materialinfo} stufe={4} />
            </article>
          ))}
        </div>
      </section>

      {l.fragen.length ? (
        <section className="behaelter abschnitt" aria-labelledby="fragen-titel">
          <div className="auftauchen">
            <h2 id="fragen-titel" className="titel-2">{t.ui.fragenTitel}</h2>
            <p className="vorspann mt-4">{t.ui.fragenText}</p>
          </div>
          <ul className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2">
            {l.fragen.map((f) => (
              <li key={f._key} className="auftauchen border-t border-linie-stark pt-5">
                <h3 className="titel-3">{f.titel}</h3>
                <p className="lauftext mt-2 text-tinte-2">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Aufruf titel={uebersicht.aufruf.titel} text={uebersicht.aufruf.text} knopf={uebersicht.aufruf.knopf} einstellungen={e} />

      <nav className="behaelter pb-4" aria-label={t.ui.weitereBereiche}>
        <h2 className="etikett">{t.ui.weitereBereiche}</h2>
        <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-1">
          {andere.map((x) => (
            <li key={x.slug}>
              <Link href={pfade.leistung(x.slug)} className="titel-3 inline-flex min-h-12 items-center gap-2.5 hover:text-blau-tief">
                {x.titel}
                <ArrowRightIcon size={20} aria-hidden="true" />
              </Link>
            </li>
          ))}
          <li>
            <Link href={pfade.leistungen} className="klein inline-flex min-h-12 items-center gap-2 font-semibold text-tinte-2 hover:text-blau-tief">
              <ArrowLeftIcon size={18} aria-hidden="true" />
              {t.ui.zurUebersicht}
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
