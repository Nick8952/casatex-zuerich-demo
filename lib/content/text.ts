import type { Block, Inline } from "./modell";

/**
 * Kleine Auszeichnung für lokale Texte: **fett** und [Linktext](Ziel). Mehr braucht die Website nicht.
 * Die lokale Quelle wandelt damit Zeichenketten in das Fliesstext-Modell (`Block`) um; Sanity liefert Portable Text,
 * den lib/content/sanity.ts in dasselbe Modell überführt.
 */
export function inline(text: string): Inline[] {
  const teile: Inline[] = [];
  const muster = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let pos = 0;
  for (let m = muster.exec(text); m; m = muster.exec(text)) {
    if (m.index > pos) teile.push(text.slice(pos, m.index));
    if (m[1] !== undefined) teile.push({ text: m[1], fett: true });
    else teile.push({ text: m[2], link: m[3] });
    pos = m.index + m[0].length;
  }
  if (pos < text.length) teile.push(text.slice(pos));
  return teile;
}

/** Rohform in lokalen JSON-Dateien: Zeichenkette = Absatz, { titel } = Zwischentitel, { liste } = Aufzählung. */
export type RohBlock = string | { titel: string; stufe?: 2 | 3; anker?: string } | { liste: string[] };

export function bloecke(roh: RohBlock[]): Block[] {
  return roh.map((b) => {
    if (typeof b === "string") return { art: "absatz", inhalt: inline(b) };
    if ("liste" in b) return { art: "liste", punkte: b.liste.map(inline) };
    return { art: "titel", stufe: b.stufe ?? 2, text: b.titel, anker: b.anker };
  });
}

/** Reiner Text eines Inline-Abschnitts (für Prüfungen und Vorschauen). */
export function inlineText(teile: Inline[]): string {
  return teile.map((t) => (typeof t === "string" ? t : t.text)).join("");
}
