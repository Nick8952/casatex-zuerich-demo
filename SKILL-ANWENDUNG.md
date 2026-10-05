# Skill-Anwendung

Ehrliche Übersicht, welche installierten Skills für dieses Projekt geprüft und wie sie angewendet wurden.

- **gelesen** = die `SKILL.md` wurde in der Sitzung vollständig geladen
- **Kopf gelesen** = Beschreibung und Einstieg gelesen, um die Anwendbarkeit zu beurteilen
- **geladen** = Plugin-Skill über das Skill-Werkzeug geladen und als Prüfliste benutzt
- **nicht gelesen** = nur über Name und Kurzbeschreibung im Inventar beurteilt

Skills sind Anleitungen, keine Werkzeuge: Ihre Regeln wurden von Hand befolgt. Konfliktregel des Auftrags: `design-taste-frontend` (v2)
ist der Standard; die Gestaltung muss zum Unternehmen passen; widersprechende Stile werden nicht vermischt.

## Inventar

- Persönliche Skills (`~/.claude/skills`): 14, alle im Auftrag genannt
- Projekt-Skills (`.claude/skills`, gespiegelt in `.agents/skills`): 33, dazu `emil-design-eng` und `stop-slop` nur in `.agents/skills`
- Plugin-Skills: `design:*` (7), `vercel:*`, `anthropic-skills:*`, dazu eingebaute Skills

## Im Auftrag genannte Skills

| Skill | Geprüft | Anwendung | Nichtanwendung oder Konflikt | Abschlusskontrolle |
| --- | --- | --- | --- | --- |
| `design-taste-frontend` (v2) | gelesen | **angewendet.** Lesart und Stellwerte 6/3/3 in `docs/DESIGN.md`. Einstieg im ersten Bildschirm, Titel zwei Zeilen, Text 19 Wörter, zwei Knöpfe. Ein Akzent auf der ganzen Website, ein Kantensystem, helles Theme durchgehend. Keine Karten mit Schatten, keine drei gleichen Kacheln, keine Etiketten in Versalien über Abschnittstiteln, keine Abschnittsnummern, keine Scroll-Hinweise, keine Pillen auf Bildern. Jede Bewegung begründet, nur `transform`/`opacity`, `prefers-reduced-motion`, kein Scroll-Listener. Icons nur aus Phosphor. Null Gedankenstriche (maschinell geprüft). Ein Wortlaut je Absicht (maschinell geprüft). | Abweichungen mit Grund: **kein Dunkelmodus** (Auftrag verlangt helle Flächen; das Logo existiert nur für hellen Grund). **Keine Motion-Bibliothek** (Bewegung 3: CSS genügt, spart JavaScript). **Keine Bildgenerierung** (Entscheid des Auftraggebers), stattdessen echte Fotos und Texturen. **Gezeichnete Verlegemuster** trotz Zurückhaltung bei eigenen SVGs: Es sind Erklärzeichnungen mit Textalternative, vom Auftraggeber gewünscht. **Serifen** nur im Lauftext, nicht im Titel; Begründung in `docs/DESIGN.md`. Palette bewusst nicht Beige mit Messing oder Terrakotta, sondern «Kobalt und eine Neutrale» aus dem Logo. | Pre-Flight des Skills durchgegangen; maschinell belegt in `docs/PRUEFBERICHT.md` (Titelzeilen, Knöpfe im ersten Bildschirm, Kontraste, Wortlaut, Gedankenstriche). |
| `design-taste-frontend-v1` | Kopf gelesen | nicht angewendet | Kein Kompatibilitätsbedarf; v2 ist Standard. | – |
| `full-output-enforcement` | gelesen | **angewendet.** Alle Seiten, Bausteine, Schemas, Skripte und Dokumente sind vollständig ausgeschrieben. | – | Suche nach `TODO`, `FIXME`, «…» als Auslassung und Platzhaltertext im Quelltext: keine Treffer. |
| `high-end-visual-design` | gelesen | **teilweise.** Übernommen: eigene Easing-Kurve statt `linear`, keine harten Schatten, Weichzeichner nur auf der fixierten Kopfzeile, sparsame z-Ebenen, klare mobile Rückfälle, gedrückter Zustand der Knöpfe. | Verworfen: Doppelrand-Karten, Pillenknöpfe, schwebende Insel-Navigation, Etiketten-Pillen, Abstände ab `py-40`, Einblenden mit Unschärfe. Sie widersprechen der ruhigen, präzisen Richtung und dem Standard-Skill. | Kontrolle im CSS: keine `box-shadow` als Schlagschatten (nur ein innerer 1-px-Ring an der gewählten Materialprobe); `linear` nur bei der scrollgebundenen Einblendung, wo es den Scrollweg abbildet. |
| `minimalist-ui` | gelesen | **teilweise.** Übernommen: 1-px-Linien statt Kästen, Text nie reines Schwarz, Akkordeon ohne Rahmen mit Plus-Zeichen, keine Emojis, keine Werbefloskeln, ruhiges Einblenden. | Verworfen: Serifen-Titel, Pastell-Etiketten, Bento-Raster, Fenster-Attrappen. Der Lichtverlauf auf der Bodenfläche ist die einzige Ausnahme von «keine Verläufe» (er stellt Licht dar, er schmückt nicht). | Kontrolle im CSS: ein einziger `linear-gradient` (Boden). |
| `redesign-existing-projects` | gelesen | **teilweise, als Prüfliste.** «Was oft vergessen geht»: rechtliche Seiten, gestaltete 404, Sprunglink, Formularprüfung, Favicon, Metadaten, Kennzeichnung der aktuellen Seite, Fokusring, Hover- und Druckzustände, semantisches HTML. | Der eigentliche Zweck (bestehende Oberfläche auditieren und verbessern) entfällt: Die Firmenwebsite zeigt nur eine Wartungsseite, es gibt keine Gestaltung zu übernehmen. | Alle Punkte der Liste erfüllt; Nachweis im Prüfbericht. |
| `gpt-taste` | gelesen | nicht angewendet | GSAP-Pflicht, Pinning, Bento, Laufbänder und Zufallsauswahl widersprechen «dezent, keine Scrollführung, wenig JavaScript». Deckungsgleiche Regeln (Titel höchstens zwei Zeilen, lesbare Knöpfe, keine Meta-Etiketten) sind über den Standard-Skill erfüllt. | – |
| `industrial-brutalist-ui` | gelesen | nicht angewendet | Brutalismus passt nicht zu einem Betrieb für Wohnräume; der Auftrag verbietet, ihn nur wegen des Skills zu verwenden. | – |
| `stitch-design-taste` | Kopf gelesen | nicht angewendet | Setzt Google Stitch voraus. Die Aufgabe einer `DESIGN.md` erfüllt `docs/DESIGN.md`. | – |
| `brandkit` | Kopf gelesen | nicht angewendet | Bildgenerierung für Markenbretter. Das Unternehmen hat ein Logo; KI-Bilder sind ausgeschlossen. Die Markenanalyse (Farbe gemessen, Wortmarke beschrieben) steht in `docs/DESIGN.md`. | – |
| `image-to-code` | Kopf gelesen | nicht angewendet | Verlangt zuerst generierte Entwurfsbilder. Ersatz: Der Einstieg wurde als HTML-Prototyp gebaut, in fünf Materialien fotografiert und danach umgesetzt. | – |
| `imagegen-frontend-web` | Kopf gelesen | nicht angewendet | Bildgenerierung, vom Auftraggeber ausgeschlossen. | – |
| `imagegen-frontend-mobile` | Kopf gelesen | nicht relevant | App-Bildschirme im Gerätrahmen; der Auftrag will ausdrücklich keine künstliche App-Oberfläche. | – |
| `find-skills` | Kopf gelesen | nicht angewendet | Es fehlte kein Skill; nichts gesucht oder installiert, keine kostenpflichtigen Werkzeuge. | – |

## Zusätzlich genannte Skills

| Skill | Geprüft | Anwendung | Abschlusskontrolle |
| --- | --- | --- | --- |
| `frontend-design` | gelesen | **angewendet.** Idee aus der Welt des Betriebs (die Kante zwischen Wand und Boden), Plan vor Code (Farben, Schriften, Aufbau, Signatur), Abgleich mit den drei KI-Standardlooks und Kurswechsel (kein Creme mit Serifen-Titel), eine Signatur und sonst Ruhe, Texte als Gestaltungsmaterial («E-Mail vorbereiten»). | Selbstkritik in `docs/DESIGN.md`; Screenshots auf vier Breiten gesichtet. |
| `ui-ux-pro-max` | gelesen (`SKILL.md`) | **teilweise.** Rangfolge 1 bis 9 als Prüfliste: Kontrast, Touch-Ziele, AVIF/WebP mit reserviertem Platz, kein horizontales Scrollen, Schrift ab 16 px, Bewegung mit Bedeutung, Beschriftungen und Fehler am Feld, Kennzeichnung der aktuellen Seite. | Das Suchskript wurde nicht ausgeführt: Farbe und Richtung standen durch Logo und Auftrag fest. Ergebnisse im Prüfbericht. |
| `design:accessibility-review` | geladen | **angewendet** als Prüfliste nach WCAG 2.1 AA (wahrnehmbar, bedienbar, verständlich, robust; Kontrasttabelle; Tastaturtabelle; Zoom 200 %). Fund: Überschriften standen in `<dt>`, was HTML nicht erlaubt; die Aussagen sind jetzt eine Liste. | Tabellen im Prüfbericht. Nicht möglich war ein Test mit echtem Screenreader. |
| `design:ux-copy` | geladen | **angewendet.** Knöpfe sagen, was passiert. Fehlermeldungen nennen, was fehlt und wie es richtig ist. Kein «Senden», keine Erfolgsmeldung, weil die Website nichts sendet. Ein Wort für eine Sache. Fund: der Knopf «Schliessen» im Hinweisdialog war fest im Code und kommt jetzt aus den Texten. | Wortlaut-Prüfung in `npm run inhalt:pruefen`. |
| `design:design-critique` | geladen | **angewendet** als Selbstkritik (erster Blick, Bedienbarkeit, Hierarchie, Konsistenz). Fund: der Satz «was öffentlich belegt ist» auf der Startseite klang nach Aktennotiz und wurde ersetzt. | Abschnitt «Selbstkritik» in `docs/DESIGN.md`. |
| `design:design-handoff` | geladen | **angewendet.** Zustände, Breakpoints, Randfälle und Bewegung als Tabellen in `docs/DESIGN.md`. | – |
| `design:design-system` | geladen | **angewendet** als Audit der Tokens. Fund: sechs fest codierte Farbwerte im CSS; sie laufen jetzt über Tokens (`--color-weiss`, `color-mix` mit `--color-tinte`). In Komponenten gibt es keine Farbwerte. | Suche nach Hex-Werten ausserhalb von `@theme`: keine Treffer. |

## Weitere Projekt-Skills

| Skill | Geprüft | Anwendung |
| --- | --- | --- |
| `code-review-and-quality`, `doubt-driven-development` | nicht gelesen (Codex hat `code-review-and-quality` für seine Prüfung selbst geladen) | Zwei unabhängige Codex-Prüfungen (Architektur, Abschluss), Befunde in `docs/PRUEFBERICHT.md` |
| `frontend-ui-engineering` | Kopf gelesen | Semantik, natives `<dialog>` und `<details>`, `aria-expanded`, `aria-current`, `aria-live`, `role="alert"` |
| `security-and-hardening` | Kopf gelesen | Vertrauensgrenze «Inhalte aus dem CMS»: Zulassungsliste für Linkziele, maskiertes JSON-LD, kodierte mailto-Links, keine Geheimnisse im Repository, Vorschau-Server ohne Pfadausbruch, minimale CI-Rechte |
| `ci-cd-and-automation` | Kopf gelesen | Ablauf: Inhalte, Lint, Typen, Import-Trockenlauf, Build, Export-Prüfung, Browser-Prüfungen, erst dann Veröffentlichung; eigener Job für das Studio |
| `performance-optimization` | Kopf gelesen | Erst messen (Lighthouse, Bundle-Analyse), dann handeln: zod aus dem Browser-Bundle entfernt (974 → 590 KB), Bildbudgets |
| `api-and-interface-design` | Kopf gelesen | Eine Schnittstelle `Inhaltsquelle`, ein Domainmodell, zwei Adapter, Prüfung an der Grenze |
| `documentation-and-adrs` | Kopf gelesen | `docs/ENTSCHEIDUNGEN.md` hält das Warum fest |
| `shipping-and-launch` | Kopf gelesen | Go-Live-Liste in `docs/UEBERGABE.md` und `docs/SANITY-VERCEL-EINRICHTUNG.md` |
| `git-workflow-and-versioning` | Kopf gelesen | thematisch getrennte Commits, `main` bleibt veröffentlichbar |
| `source-driven-development` | Kopf gelesen | Rechtliches und Hosting an Primärquellen geprüft (Zefix, ISP, GitHub-Dokumentation); Next-Verhalten am Build geprüft statt aus dem Gedächtnis |
| `browser-testing-with-devtools` | Kopf gelesen | ersetzt durch puppeteer-core mit dem installierten Chrome (kein DevTools-MCP eingerichtet) |
| `emil-design-eng`, `stop-slop` | Kopf gelesen | nicht eigens angewendet; die Textregeln decken der Standard-Skill und die Inhaltsprüfung ab |
| `spec-driven-development`, `planning-and-task-breakdown`, `incremental-implementation`, `test-driven-development`, `debugging-and-error-recovery`, `context-engineering`, `constraint-driven-development`, `interview-me`, `idea-refine`, `code-simplification`, `using-agent-skills` | nicht gelesen | Der Auftrag war die Spezifikation; Rückfragen wurden gebündelt gestellt; der Plan wurde vor der Umsetzung freigegeben; Prüfungen wurden vor dem Beheben geschrieben |
| `observability-and-instrumentation`, `deprecation-and-migration` | nicht gelesen | bewusst nicht angewendet: keine Telemetrie, keine alten Adressen zu migrieren |
| `banner-design`, `brand`, `design`, `design-system` (Projekt), `slides`, `ui-styling`, `dataviz` | nicht gelesen | nicht relevant: keine Banner, Folien, Diagramme, kein shadcn |
| `vercel:*`, `anthropic-skills:*`, übrige eingebaute Skills | nicht gelesen | nicht relevant: Es darf kein Vercel-Projekt angelegt werden; keine Office-Dokumente |

## Ergebnis der Abschlusskontrolle

Die Messwerte und Prüfprotokolle stehen in `docs/PRUEFBERICHT.md`: DOM-Audit ohne Befund, alle Funktionsprüfungen bestanden,
Export-Prüfung grün, Kontraste gerechnet, Lighthouse gemessen, zwei Codex-Prüfungen mit umgesetzten Befunden.
