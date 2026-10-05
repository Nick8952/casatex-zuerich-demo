import "server-only";
import type { Inhaltsquelle } from "./modell";
import { indexierungErlaubt, indexierungProbe } from "../deploy-ziel";
import { offeneFreigaben } from "./freigabe";

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

async function laden(): Promise<Inhaltsquelle> {
  if (quelleRoh === "sanity") {
    const { sanityQuelle } = await import("./sanity");
    return sanityQuelle;
  }
  const { lokaleQuelle } = await import("./local");
  return lokaleQuelle;
}

let freigabeGeprueft: Promise<void> | null = null;
/**
 * Die Inhaltsquelle des Builds. Ist die Indexierung für eine echte Domain eingeschaltet (INDEXIERUNG=1), bricht der erste
 * Zugriff ab, solange Unternehmensaussagen nicht freigegeben sind oder die Rechtstexte noch die Demo beschreiben.
 * Ausgenommen ist nur der Probe-Build für eine reservierte Testdomain (siehe lib/deploy-ziel.ts).
 */
export async function inhaltsquelle(): Promise<Inhaltsquelle> {
  const q = await laden();
  if (indexierungErlaubt && !indexierungProbe) {
    freigabeGeprueft ??= offeneFreigaben(q).then((offen) => {
      if (offen.length) throw new Error(`INDEXIERUNG=1 ist gesetzt, aber ${offen.length} Punkt(e) sind nicht freigegeben:\n${offen.map((o) => `  - ${o}`).join("\n")}\nErst klären (docs/UEBERGABE.md), dann indexieren.`);
    });
    await freigabeGeprueft;
  }
  return q;
}

export const inhaltsquelleName = quelleRoh === "sanity" ? "sanity" : "lokal";
