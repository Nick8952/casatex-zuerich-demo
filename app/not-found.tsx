import type { Metadata } from "next";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { inhaltsquelle } from "@/lib/content";
import { SmartLink } from "@/components/SmartLink";

export const metadata: Metadata = { title: "Seite nicht gefunden", robots: { index: false, follow: false } };

/** Gestaltete Fehlerseite. GitHub Pages liefert sie bei unbekannten Adressen als 404.html aus (scripts/export-nachbereiten.mjs). */
export default async function NichtGefunden() {
  const q = await inhaltsquelle();
  const t = await q.getTexte();
  return (
    <div className="behaelter einstieg pb-10 pt-16 lg:pt-28">
      <p className="etikett">Fehler 404</p>
      <h1 className="titel-1 mt-3">{t.ui.nichtGefundenTitel}</h1>
      <p className="vorspann mt-6">{t.ui.nichtGefundenText}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <SmartLink ziel={t.ui.nichtGefundenLink.ziel} className="knopf knopf-primaer">
          {t.ui.nichtGefundenLink.text}
          <ArrowRightIcon size={18} weight="bold" aria-hidden="true" className="pfeil" />
        </SmartLink>
        {t.navigation.slice(0, 1).map((n) => (
          <SmartLink key={n.ziel} ziel={n.ziel} className="knopf knopf-sekundaer">{n.text}</SmartLink>
        ))}
      </div>
    </div>
  );
}
