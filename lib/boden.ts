import type { CSSProperties } from "react";
import type { Bild } from "./content/modell";
import { assetUrl } from "./assets";

const groesste = (v: { breite: number; url: string }[]) => v[v.length - 1];

/** Adressen der grössten Varianten einer Bodentextur (AVIF bevorzugt, WebP als Rückfall). */
export function bodenUrls(bild: Bild): { avif: string | null; webp: string } {
  return { avif: bild.quellen.avif.length ? assetUrl(groesste(bild.quellen.avif).url) : null, webp: assetUrl(groesste(bild.quellen.webp).url) };
}

/**
 * CSS-Variablen für eine Bodenebene (.boden in app/globals.css): Die Textur wird als Kachel wiederholt.
 * `kachelbreite` ist die Breite einer Kachel an der Wandkante; zum Betrachter hin wird sie durch die Perspektive grösser.
 */
export function bodenStil(bild: Bild, kachelbreite: number): CSSProperties {
  const { avif, webp } = bodenUrls(bild);
  return { "--boden-webp": `url("${webp}")`, "--boden-avif": `url("${avif ?? webp}")`, "--kachel": `${kachelbreite}px` } as CSSProperties;
}
