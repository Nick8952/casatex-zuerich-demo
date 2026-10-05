import "server-only";
import type { Inhaltsquelle } from "./modell";

export * from "./modell";

/**
 * Auswahl der Inhaltsquelle.
 *
 * - Standard (keine Env-Variablen): lokale JSON-Dateien → GitHub-Pages-Demo.
 * - CONTENT_SOURCE=sanity: Sanity. Fehlen Projekt-ID oder Dataset, bricht der Build mit einer klaren Meldung ab;
 *   bewusst kein stiller Rückfall auf Demo-Inhalte.
 *
 * Die Sanity-Quelle wird erst im gewählten Zweig geladen, damit die Demo ohne Sanity-Konfiguration baut
 * und im Pages-Build kein Sanity-Code ausgeführt wird.
 */
const quelleRoh = (process.env.CONTENT_SOURCE ?? "").trim();
if (quelleRoh && quelleRoh !== "sanity" && quelleRoh !== "lokal") {
  throw new Error(`CONTENT_SOURCE=«${quelleRoh}» ist unbekannt. Erlaubt: leer/«lokal» (data/*.json) oder «sanity».`);
}

export async function inhaltsquelle(): Promise<Inhaltsquelle> {
  if (quelleRoh === "sanity") {
    const { sanityQuelle } = await import("./sanity");
    return sanityQuelle;
  }
  const { lokaleQuelle } = await import("./local");
  return lokaleQuelle;
}

export const inhaltsquelleName = quelleRoh === "sanity" ? "sanity" : "lokal";
