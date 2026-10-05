import { preload } from "react-dom";
import type { ReactNode } from "react";
import type { Bild as BildTyp } from "@/lib/content/modell";
import { bodenStil, bodenUrls } from "@/lib/boden";
import { Bild } from "./Bild";

/**
 * Kopf einer Unterseite: Wandfläche mit Titel, Sockelleiste und darunter wahlweise eine Bodenfläche (Leistungsseiten),
 * ein Bildband (Übersichten) oder nichts (Kontakt, Rechtsseiten).
 */
export function Seitenkopf({ titel, text, boden, kachelbreite = 480, bild, symbolText, children }: { titel: string; text?: string; boden?: BildTyp; kachelbreite?: number; bild?: BildTyp; symbolText?: string; children?: ReactNode }) {
  if (boden) {
    const { avif, webp } = bodenUrls(boden);
    preload(avif ?? webp, { as: "image", fetchPriority: "high", ...(avif ? { type: "image/avif" } : {}) });
  }
  const gezeigt = boden ?? bild;
  return (
    <div>
      <div className="behaelter einstieg pb-9 pt-10 sm:pt-14 lg:pb-12 lg:pt-20">
        <h1 className="titel-1">{titel}</h1>
        {text ? <p className="vorspann mt-5 lg:mt-7">{text}</p> : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </div>
      <div className="sockelleiste" />
      {boden ? (
        <div className="raum h-40 sm:h-52 lg:h-64" aria-hidden="true">
          <div className="boden" data-aktiv="true" style={bodenStil(boden, kachelbreite)} />
        </div>
      ) : bild ? (
        <Bild bild={bild} sizes="100vw" prio className="block h-44 w-full object-cover sm:h-64 lg:h-[22rem]" />
      ) : null}
      {gezeigt?.symbolbild && symbolText ? (
        <p className="behaelter klein pt-2.5 text-grau">
          {gezeigt.legende ? `${gezeigt.legende}. ` : ""}
          {symbolText}.
        </p>
      ) : null}
    </div>
  );
}
