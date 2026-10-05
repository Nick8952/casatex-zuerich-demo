/**
 * Einziger Ort, an dem der GitHub-Pages-Unterpfad vor Datei-URLs gesetzt wird.
 * `next/link` erledigt das für Seitenlinks selbst; Bilder und CSS-Hintergründe brauchen diesen Helfer.
 * Als fremder Host ist nur das Sanity-CDN erlaubt (für den späteren Betrieb mit Sanity).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetUrl(pfad: string): string {
  if (/^https:\/\/cdn\.sanity\.io\//.test(pfad)) return pfad;
  if (/^([a-z]+:)?\/\//i.test(pfad) || /^[a-z]+:/i.test(pfad)) throw new Error(`assetUrl: nur lokale Pfade oder https://cdn.sanity.io/ sind erlaubt, nicht «${pfad.slice(0, 60)}».`);
  if (!pfad.startsWith("/")) return `${basePath}/${pfad}`;
  return `${basePath}${pfad}`;
}

/** Interne Links («/kontakt/») bleiben; externe/Sonder-Links werden erkannt. */
export function istExternerLink(ziel: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(ziel);
}

/**
 * Erlaubte Linkziele (auch aus dem CMS): interner Pfad («/kontakt/», nicht «//host»), Sprungziel («#anker»), https://, mailto:, tel:.
 * Alles andere (javascript:, data:, http://, protokollrelative URLs) wird abgewiesen; dieselbe Regel gilt im Sanity-Schema.
 */
export function istErlaubtesLinkziel(ziel: string): boolean {
  return /^\/(?!\/)/.test(ziel) || /^#[A-Za-z][\w-]*$/.test(ziel) || /^(https:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[\d\s()-]+)$/.test(ziel);
}

/** Liefert das Ziel unverändert oder «#», wenn es nicht erlaubt ist (Schutz vor javascript:-Links aus Inhalten). */
export function sichererLink(ziel: string): string {
  return istErlaubtesLinkziel(ziel) ? ziel : "#";
}

/** «044 432 61 61» oder «+41 44 432 61 61» → «tel:+41444326161» */
export function telLink(nummer: string): string {
  const ziffern = nummer.replace(/\D/g, "");
  if (ziffern.startsWith("00")) return `tel:+${ziffern.slice(2)}`;
  if (ziffern.startsWith("0")) return `tel:+41${ziffern.slice(1)}`;
  return `tel:+${ziffern}`;
}
