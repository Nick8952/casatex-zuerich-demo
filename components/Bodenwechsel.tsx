"use client";
/* eslint-disable @next/next/no-img-element -- kleine, vorgerenderte Proben */

import { Fragment, useCallback, useId, useState, type ReactNode } from "react";
import type { Bodenwahl } from "@/lib/content/modell";
import { bodenStil, bodenUrls } from "@/lib/boden";
import { kleinsteUrl } from "./Bild";

/**
 * Einstieg «Raumkante»: Wandfläche mit Text (children) und Materialwahl, darunter die perspektivische Bodenfläche.
 *
 * - Die Wahl ist eine echte Optionsgruppe (native Radios mit sichtbaren Beschriftungen, Pfeiltasten wechseln).
 * - Die Bodenfläche ist Dekoration und für Screenreader verborgen; was zu sehen ist, steht als Text daneben (aria-live).
 * - Nur die erste Textur wird sofort geladen. Jede weitere lädt erst, wenn sie gewählt wird, und blendet danach ein.
 *   Mit `prefers-reduced-motion` wechselt sie ohne Übergang (siehe .boden in app/globals.css).
 */
export function Bodenwechsel({ boeden, wechselTitel, imBild, symbolText, children }: { boeden: Bodenwahl[]; wechselTitel: string; imBild: string; symbolText: string; children: ReactNode }) {
  const [aktiv, setAktiv] = useState(boeden[0]._key);
  const [geladen, setGeladen] = useState<string[]>([boeden[0]._key]);
  const name = useId();

  const waehlen = useCallback(
    (key: string) => {
      const boden = boeden.find((b) => b._key === key);
      if (!boden) return;
      if (geladen.includes(key)) { setAktiv(key); return; }
      const { avif, webp } = bodenUrls(boden.bild);
      const zeigen = () => {
        setGeladen((g) => (g.includes(key) ? g : [...g, key]));
        // Erst unsichtbar einhängen, dann im übernächsten Bild einblenden, damit der Übergang greift
        requestAnimationFrame(() => requestAnimationFrame(() => setAktiv(key)));
      };
      const probe = new Image();
      probe.onload = zeigen;
      probe.onerror = () => {
        const rueckfall = new Image();
        rueckfall.onload = zeigen;
        rueckfall.onerror = zeigen;
        rueckfall.src = webp;
      };
      probe.src = avif ?? webp;
    },
    [boeden, geladen],
  );

  const gewaehlt = boeden.find((b) => b._key === aktiv) ?? boeden[0];

  return (
    <>
      <div className="wand">
        <div className="einstieg">{children}</div>
        <fieldset className="auftritt-spaet min-w-0">
          <legend className="etikett mb-2.5">{wechselTitel}</legend>
          <div className="bodenwahl relative">
            {boeden.map((b) => (
              <Fragment key={b._key}>
                <input type="radio" name={name} id={`${name}-${b._key}`} value={b._key} defaultChecked={b._key === boeden[0]._key} onChange={() => waehlen(b._key)} />
                <label htmlFor={`${name}-${b._key}`}>
                  <img className="probe" src={kleinsteUrl(b.bild)} alt="" width={64} height={64} loading="lazy" decoding="async" />
                  {b.titel}
                </label>
              </Fragment>
            ))}
          </div>
          <p className="klein mt-3 text-grau" aria-live="polite">
            {imBild}: {gewaehlt.bild.legende ?? gewaehlt.titel}. {symbolText}.
          </p>
        </fieldset>
      </div>
      <div className="sockelleiste" />
      <div className="raum min-h-52" aria-hidden="true">
        {boeden
          .filter((b) => geladen.includes(b._key))
          .map((b) => (
            <div key={b._key} className="boden" data-aktiv={b._key === aktiv} style={bodenStil(b.bild, b.kachelbreite)} />
          ))}
      </div>
    </>
  );
}
