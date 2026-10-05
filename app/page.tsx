import type { Metadata } from "next";
import { preload } from "react-dom";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { inhaltsquelle, pfade } from "@/lib/content";
import { optionaleBereiche } from "@/lib/content/sichtbar";
import { bodenUrls } from "@/lib/boden";
import { seitenMetadaten } from "@/lib/seo";
import { Aussagen } from "@/components/Aussagen";
import { Bild } from "@/components/Bild";
import { Bodenwechsel } from "@/components/Bodenwechsel";
import { Dielen } from "@/components/Dielen";
import { Handmuster } from "@/components/Handmuster";
import { Kontaktblock } from "@/components/Kontaktblock";
import { SmartLink } from "@/components/SmartLink";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t, s] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getStartseite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? e.claim, beschreibung: s.seoBeschreibung, pfad: pfade.start, einstellungen: e, texte: t, istStart: true });
}

export default async function Startseite() {
  const q = await inhaltsquelle();
  const [e, t, s, leistungen, materialien, ueber, kontakt, referenzen, partner] = await Promise.all([
    q.getEinstellungen(), q.getTexte(), q.getStartseite(), q.getLeistungen(), q.getMaterialien(), q.getUeberSeite(), q.getKontaktSeite(), q.getReferenzen(), q.getPartner(),
  ]);
  const bereiche = optionaleBereiche({ einstellungen: e, referenzen, partner });
  const muster = materialien.filter((m) => m.bild).slice(0, 6);

  // Die erste Bodentextur ist das grösste Element im Einstieg: früh laden (AVIF, sonst WebP).
  const erste = bodenUrls(s.hero.boeden[0].bild);
  preload(erste.avif ?? erste.webp, { as: "image", fetchPriority: "high", ...(erste.avif ? { type: "image/avif" } : {}) });

  return (
    <>
      <section className="held" aria-labelledby="einstieg-titel">
        <Bodenwechsel boeden={s.hero.boeden} wechselTitel={s.hero.wechselTitel} imBild={s.hero.imBild} symbolText={t.ui.symbolbild}>
          <h1 id="einstieg-titel" className="titel-1 max-w-[13ch]">{s.hero.titel}</h1>
          <p className="vorspann mt-5 lg:mt-7">{s.hero.text}</p>
          <div className="mt-7 flex flex-wrap gap-3 lg:mt-9">
            <SmartLink ziel={s.hero.knopf.ziel} className="knopf knopf-primaer">
              {s.hero.knopf.text}
              <ArrowRightIcon size={18} weight="bold" aria-hidden="true" className="pfeil" />
            </SmartLink>
            <SmartLink ziel={s.hero.zweiterKnopf.ziel} className="knopf knopf-sekundaer">{s.hero.zweiterKnopf.text}</SmartLink>
          </div>
        </Bodenwechsel>
      </section>

      <section className="behaelter abschnitt" aria-labelledby="bereiche-titel">
        <div className="auftauchen">
          <h2 id="bereiche-titel" className="titel-2">{s.leistungen.titel}</h2>
          <p className="vorspann mt-4">{s.leistungen.text}</p>
        </div>
        <div className="mt-10 lg:mt-14">
          <Dielen leistungen={leistungen} />
        </div>
      </section>

      <section className="behaelter abschnitt" aria-labelledby="materialien-titel">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16">
          <figure className="auftauchen">
            <Bild bild={s.materialien.bild} sizes="(min-width: 64rem) 52vw, 100vw" className="block h-auto w-full" />
            <figcaption className="klein mt-2.5 text-grau">{s.materialien.bild.legende ? `${s.materialien.bild.legende}. ` : ""}{t.ui.symbolbild}.</figcaption>
          </figure>
          <div className="auftauchen">
            <h2 id="materialien-titel" className="titel-2">{s.materialien.titel}</h2>
            <p className="vorspann mt-4">{s.materialien.text}</p>
            <SmartLink ziel={s.materialien.link.ziel} className="knopf knopf-sekundaer mt-8">
              {s.materialien.link.text}
              <ArrowRightIcon size={18} weight="bold" aria-hidden="true" className="pfeil" />
            </SmartLink>
          </div>
        </div>
        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:mt-20 lg:grid-cols-6 lg:gap-x-5">
          {muster.map((m) => (
            <li key={m.slug} className="auftauchen"><Handmuster material={m} /></li>
          ))}
        </ul>
      </section>

      <section className="behaelter abschnitt" aria-labelledby="ueber-titel">
        <div className="auftauchen">
          <h2 id="ueber-titel" className="titel-2">{s.ueber.titel}</h2>
          <p className="vorspann mt-4">{s.ueber.text}</p>
        </div>
        <div className="mt-10">
          <Aussagen aussagen={ueber.aussagen} mitQuellen={false} />
        </div>
        <SmartLink ziel={s.ueber.link.ziel} className="knopf knopf-sekundaer mt-8">
          {s.ueber.link.text}
          <ArrowRightIcon size={18} weight="bold" aria-hidden="true" className="pfeil" />
        </SmartLink>
      </section>

      {bereiche.referenzen ? (
        <section className="behaelter abschnitt" aria-labelledby="referenzen-titel">
          <h2 id="referenzen-titel" className="titel-2">{s.referenzen.titel}</h2>
          <p className="vorspann mt-4">{s.referenzen.text}</p>
          <ul className="mt-10 grid gap-10 md:grid-cols-2">
            {referenzen.map((r) => (
              <li key={r._key}>
                {r.bild ? <Bild bild={r.bild} sizes="(min-width: 48rem) 45vw, 100vw" className="block h-auto w-full" /> : null}
                <h3 className="titel-3 mt-4">{r.titel}</h3>
                {r.ort || r.jahr ? <p className="etikett mt-1">{[r.ort, r.jahr].filter(Boolean).join(", ")}</p> : null}
                <p className="lauftext mt-2">{r.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {bereiche.partner ? (
        <section className="behaelter abschnitt" aria-labelledby="partner-titel">
          <h2 id="partner-titel" className="titel-2">{s.partner.titel}</h2>
          <p className="vorspann mt-4">{s.partner.text}</p>
          <ul className="klein mt-8 flex flex-wrap gap-2">
            {partner.map((p) => (
              <li key={p._key} className="border border-linie-stark bg-papier">
                {p.url ? <SmartLink ziel={p.url} className="inline-flex min-h-11 items-center px-4 font-semibold hover:text-blau-tief">{p.name}</SmartLink> : <span className="inline-flex min-h-11 items-center px-4 font-semibold">{p.name}</span>}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="behaelter abschnitt" aria-labelledby="kontakt-titel">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="auftauchen">
            <h2 id="kontakt-titel" className="titel-2 max-w-[14ch]">{s.kontakt.titel}</h2>
            <p className="vorspann mt-4">{s.kontakt.text}</p>
            <SmartLink ziel={t.kopf.aufruf.ziel} className="knopf knopf-primaer mt-8">
              {t.kopf.aufruf.text}
              <ArrowRightIcon size={18} weight="bold" aria-hidden="true" className="pfeil" />
            </SmartLink>
          </div>
          <div className="auftauchen">
            <Kontaktblock einstellungen={e} texte={t} oeffnungszeitenTitel={bereiche.oeffnungszeiten ? kontakt.oeffnungszeitenTitel : undefined} />
          </div>
        </div>
      </section>
    </>
  );
}
