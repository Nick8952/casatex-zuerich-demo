import type { Material } from "@/lib/content/modell";
import { pfade } from "@/lib/content/pfade";
import { Bild } from "./Bild";
import { SmartLink } from "./SmartLink";

/** Materialprobe mit Etikett. Als Link führt sie zum Eintrag in der Materialkunde. */
export function Handmuster({ material, verlinkt = true, sizes = "(min-width: 64rem) 16vw, (min-width: 40rem) 30vw, 45vw", onClick }: { material: Material; verlinkt?: boolean; sizes?: string; onClick?: () => void }) {
  const inhalt = (
    <>
      <span className="flaeche block">
        {material.bild ? <Bild bild={material.bild} alt="" sizes={sizes} /> : <span className="ohne-bild">{material.titel}</span>}
      </span>
      <span className="block">
        <span className="titel-4 block">{material.titel}</span>
        <span className="klein mt-0.5 block text-grau">{material.kurz}</span>
      </span>
    </>
  );
  if (!verlinkt) return <div className="handmuster">{inhalt}</div>;
  return <SmartLink ziel={pfade.material(material.slug)} className="handmuster" onClick={onClick}>{inhalt}</SmartLink>;
}
