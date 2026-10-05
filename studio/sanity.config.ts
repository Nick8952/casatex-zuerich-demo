import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { deDELocale } from "@sanity/locale-de-de";
import { schemaTypes, EINZELDOKUMENTE } from "./schemas";
import { dataset, projectId } from "./env";

/**
 * Studio der Casatex-Website. Die Seitenleiste ist nach dem geordnet, was Redaktorinnen und Redaktoren suchen:
 * zuerst die Seiten, dann Leistungen und Materialien, dann Referenzen und Partner, zuletzt Einstellungen und Texte.
 * Seiten, Einstellungen und Texte gibt es je genau einmal; sie lassen sich weder doppelt anlegen noch löschen.
 */
const einzel = (S: StructureBuilder, typ: string, titel: string, id = typ) => S.listItem().title(titel).id(id).child(S.document().schemaType(typ).documentId(id).title(titel));

export default defineConfig({
  name: "casatex",
  title: "Casatex Zürich AG",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Inhalte")
          .items([
            S.listItem().title("Seiten").child(
              S.list().title("Seiten").items([
                einzel(S, "startseite", "Startseite"),
                einzel(S, "leistungenSeite", "Leistungen und Materialien"),
                einzel(S, "ueberSeite", "Über Casatex"),
                einzel(S, "kontaktSeite", "Kontakt und Anfahrt"),
                einzel(S, "rechtSeite", "Impressum", "rechtSeite-impressum"),
                einzel(S, "rechtSeite", "Datenschutzerklärung", "rechtSeite-datenschutz"),
              ]),
            ),
            S.divider(),
            S.documentTypeListItem("leistung").title("Leistungen"),
            S.documentTypeListItem("material").title("Materialien"),
            S.divider(),
            S.documentTypeListItem("referenz").title("Referenzen"),
            S.documentTypeListItem("partner").title("Partner und Marken"),
            S.divider(),
            einzel(S, "einstellungen", "Unternehmen und Kontakt"),
            einzel(S, "texte", "Navigation, Fusszeile und Formulartexte"),
          ]),
    }),
    visionTool({ defaultApiVersion: "2025-02-19" }),
    deDELocale(),
  ],
  schema: {
    types: schemaTypes,
    // Einzeldokumente nicht über «Neu anlegen» anbieten
    templates: (vorlagen) => vorlagen.filter((v) => !EINZELDOKUMENTE.includes(v.schemaType)),
  },
  document: {
    // Einzeldokumente: nur bearbeiten und veröffentlichen, nicht duplizieren oder löschen
    actions: (aktionen, kontext) => (EINZELDOKUMENTE.includes(kontext.schemaType) ? aktionen.filter((a) => a.action && ["publish", "discardChanges", "restore"].includes(a.action)) : aktionen),
  },
});
