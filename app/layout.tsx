import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { inhaltsquelle, pfade } from "@/lib/content";
import { indexierungErlaubt, siteUrl } from "@/lib/deploy-ziel";
import { betriebJsonLd, jsonLdSicher } from "@/lib/seo";
import { Kopfzeile } from "@/components/Kopfzeile";
import { Fusszeile } from "@/components/Fusszeile";
import { Einwilligung } from "@/components/Einwilligung";

// Beide Schriften (SIL OFL) stammen aus den fontsource-Paketen und werden über next/font/local ausgeliefert:
// Preload, font-display swap, angepasste Fallback-Metriken, keine Anfrage an Dritte. Nur der Latin-Schnitt (deckt Deutsch ab).
const schriftTitel = localFont({
  src: "../node_modules/@fontsource-variable/familjen-grotesk/files/familjen-grotesk-latin-wght-normal.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--schrift-titel",
  display: "swap",
  adjustFontFallback: "Arial",
});
const schriftText = localFont({
  src: "../node_modules/@fontsource-variable/literata/files/literata-latin-wght-normal.woff2",
  weight: "200 900",
  style: "normal",
  variable: "--schrift-text",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [e, t] = await Promise.all([q.getEinstellungen(), q.getTexte()]);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${e.firma}: ${e.claim}`, template: `%s | ${t.seo.titelZusatz}` },
    description: t.seo.beschreibung,
    robots: indexierungErlaubt ? { index: true, follow: true } : { index: false, follow: false },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f1f0ec" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const q = await inhaltsquelle();
  const [e, t, materialien] = await Promise.all([q.getEinstellungen(), q.getTexte(), q.getMaterialien()]);
  return (
    <html lang="de-CH" className={`${schriftTitel.variable} ${schriftText.variable}`}>
      <body>
        <a href="#inhalt" className="nur-sr klein focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-tinte focus:px-4 focus:py-3 focus:font-semibold focus:text-papier">
          {t.ui.zumInhalt}
        </a>
        {!indexierungErlaubt && t.demoHinweis ? <p className="klein border-b border-linie-stark bg-papier px-4 py-1.5 text-center text-[0.8125rem] text-tinte-2">{t.demoHinweis}</p> : null}
        <Kopfzeile einstellungen={e} texte={t} materialien={materialien} />
        <main id="inhalt" tabIndex={-1} className="outline-none">{children}</main>
        <Fusszeile einstellungen={e} texte={t} zeigeDemoHinweis={!indexierungErlaubt} />
        <Einwilligung texte={t.einwilligung} datenschutzPfad={pfade.datenschutz} schliessen={t.kopf.schliessen} />
        {indexierungErlaubt ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSicher(betriebJsonLd(e)) }} /> : null}
      </body>
    </html>
  );
}
