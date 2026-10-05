import type { Block, Inline } from "@/lib/content/modell";
import { SmartLink } from "./SmartLink";

function Zeile({ teile }: { teile: Inline[] }) {
  return (
    <>
      {teile.map((t, i) => {
        if (typeof t === "string") return <span key={i}>{t}</span>;
        if (t.link) return <SmartLink key={i} ziel={t.link} className="textlink">{t.text}</SmartLink>;
        if (t.fett) return <strong key={i} className="font-semibold">{t.text}</strong>;
        return <span key={i}>{t.text}</span>;
      })}
    </>
  );
}

/** Fliesstext aus dem Domainmodell (Absätze, Zwischentitel, Aufzählungen). Zwischentitel der Stufe 2 können Sprungziele sein. */
export function RichText({ bloecke }: { bloecke: Block[] }) {
  return (
    <div className="fliesstext">
      {bloecke.map((b, i) => {
        if (b.art === "titel") return b.stufe === 2 ? <h2 key={i} id={b.anker} className="titel-3">{b.text}</h2> : <h3 key={i} id={b.anker} className="titel-4">{b.text}</h3>;
        if (b.art === "liste") return <ul key={i}>{b.punkte.map((p, j) => <li key={j}><Zeile teile={p} /></li>)}</ul>;
        return <p key={i}><Zeile teile={b.inhalt} /></p>;
      })}
    </div>
  );
}
