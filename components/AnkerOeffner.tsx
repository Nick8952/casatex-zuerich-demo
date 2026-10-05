"use client";

import { useEffect } from "react";

/**
 * Klappt in der Materialkunde den Eintrag auf, auf den die Adresse zeigt («…/leistungen/#material-kork»),
 * beim Laden der Seite und bei jedem Wechsel der Sprungmarke. Ohne JavaScript bleibt der Eintrag zu und lässt sich von Hand öffnen.
 */
export function AnkerOeffner({ praefix }: { praefix: string }) {
  useEffect(() => {
    const oeffnen = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id.startsWith(praefix)) return;
      const ziel = document.getElementById(id);
      if (ziel instanceof HTMLDetailsElement) {
        ziel.open = true;
        ziel.scrollIntoView({ block: "start" });
      }
    };
    oeffnen();
    window.addEventListener("hashchange", oeffnen);
    return () => window.removeEventListener("hashchange", oeffnen);
  }, [praefix]);
  return null;
}
