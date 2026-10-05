# Casatex Zürich AG: Website-Entwurf

Verkaufs-Demo einer Website für die Casatex Zürich AG (Parkett, Teppiche, Bodenbeläge, Zürich-Altstetten).
**Kein offizieller Auftritt des Unternehmens.** Betreiber der Demo: Nick Holzbecher.

- Live: <https://nick8952.github.io/casatex-zuerich-demo/> (noindex, als Entwurf gekennzeichnet)
- Technik: Next.js 16, TypeScript, Tailwind CSS 4, statischer Export. Keine Serverfunktionen, keine Dienste Dritter, keine Cookies.
- Inhalte: lokal in `data/`. Sanity (CMS) und Vercel (Hosting) sind vorbereitet, aber nicht eingerichtet.

## Schnellstart

```bash
npm install
npm run dev              # http://localhost:3000/casatex-zuerich-demo/
npm run pruefen          # Inhalte, Lint, Typen
npm run build            # statischer Export nach out/
npm run export:pruefen   # prüft den Export wie auf GitHub Pages
npm run vorschau:pages   # http://localhost:4321/casatex-zuerich-demo/
npm run qa               # Browser-Prüfungen (Vorschau-Server muss laufen)
```

Voraussetzung: Node.js 20.9 oder neuer. Für `npm run qa` ein installiertes Chrome.

## Dokumentation

| Datei | Inhalt |
| --- | --- |
| `CLAUDE.md` | Architektur, Befehle, verbindliche Regeln |
| `docs/INHALTSMATRIX.md` | Quellenprüfung: was belegt ist, was nicht, was wohin gehört |
| `docs/DESIGN.md` | Gestaltung «Raumkante»: Idee, Farben, Schrift, Bewegung |
| `docs/BILDER.md` | Bildquellen, Lizenzen, benötigte Aufnahmen |
| `docs/INHALTE-PFLEGEN.md` | Anleitung für die Redaktion |
| `docs/SANITY-VERCEL-EINRICHTUNG.md` | Sanity und Vercel einrichten, Veröffentlichungsablauf, Go-Live |
| `docs/UEBERGABE.md` | offene Fragen an das Unternehmen, Freigaben |
| `docs/PRUEFBERICHT.md` | Prüfungen und Messwerte, Codex-Reviews |
| `docs/ENTSCHEIDUNGEN.md` | Entscheidungen mit Begründung |
| `SKILL-ANWENDUNG.md` | welche Skills wie angewendet wurden |

## Rechte

Name und Logo «Casatex» gehören der Casatex Zürich AG. Fotos und Texturen sind Materialbeispiele unter CC0 1.0 (Poly Haven) und der
Unsplash License; Nachweise in `docs/BILDER.md` und im Impressum der Demo. Schriften: Familjen Grotesk und Literata (SIL Open Font License).
