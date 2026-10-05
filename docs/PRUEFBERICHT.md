# Prüfbericht

Stand: 5. Oktober 2026. Alle Werte sind gemessen, nicht geschätzt. Wo etwas nicht geprüft werden konnte, steht es ausdrücklich da.

## Übersicht

| Prüfung | Ergebnis |
| --- | --- |
| Inhalte (`npm run inhalt:pruefen`) | in Ordnung: 790 Texte, 32 Links, 14 Bilder, 11 Unternehmensaussagen und Seitenbelege mit Quelle |
| Lint, Typen | ohne Fehler und Warnungen |
| Build und Export-Prüfung | 12 HTML-Dateien, 1114 interne Verweise unter dem Unterpfad, noindex überall, keine Sitemap, kein JSON-LD |
| DOM-Audit, lokal | 40 von 40 ohne Befund (10 Seiten × 360, 390, 768, 1440 px); zusätzlich 60 von 60 auf 320, 640, 720, 1024, 1280, 1920 px |
| Funktionsprüfungen, lokal | 77 von 77 bestanden |
| CI (GitHub Actions, Linux) | DOM-Audit 40 von 40, Funktionsprüfungen 77 von 77, Build und Veröffentlichung grün |
| DOM-Audit, live | 40 von 40 ohne Befund |
| Funktionsprüfungen, live | 77 von 77 (nach Korrektur einer Testannahme, siehe unten) |
| Lighthouse, live | Desktop 100 / 100 / 100, Mobil 96 bis 99 / 100 / 100 (Leistung / Barrierefreiheit / Best Practices) |
| Sanity-Vorbereitung | Studio-Typprüfung und Schema-Validierung ohne Fehler; Import-Trockenlauf mit Parität; Bild-Spiegel im Selbsttest |
| Go-Live-Probe | Build und Export-Prüfung für eine Testdomain grün; vier unzulässige Konfigurationen brechen wie vorgesehen ab |
| Codex | Architekturprüfung: 14 Befunde, alle übernommen. Abschlussprüfung: 12 Befunde, 10 behoben, 1 offen (braucht Nick), 1 begründet abgelehnt |

## Mobile Prüfungen

Geprüft im echten Browser (Chrome, über puppeteer-core) auf **360, 390, 768 und 1440 px**, jede der zehn Seiten (neun Inhaltsseiten
und die Fehlerseite), lokal, in der CI und gegen die Live-Adresse. Zusätzlich 320, 640, 720, 1024, 1280 und 1920 px; 640 und 720 px
entsprechen 1280 und 1440 px bei 200 % Zoom.

| Anforderung aus dem Auftrag | Wie geprüft | Ergebnis |
| --- | --- | --- |
| Kein horizontales Scrollen | `scrollWidth` gegen `clientWidth`, dazu jedes Element gegen den Rand | keine Überschreitung. Gefunden und behoben: «Datenschutzerklärung» lief als Titel auf 360 und 390 px über (jetzt Silbentrennung) |
| Touch-Ziele mindestens 44 × 44 px | alle Links, Knöpfe, Felder, Akkordeon-Zeilen, Beschriftungen der Materialwahl gemessen | keine zu kleinen Ziele. Links im Fliesstext sind nach WCAG 2.5.8 ausgenommen |
| Lesbare Schrift und Zeilenlängen | kein Text unter 13 px; Lauftext 17 px, Zeilenhöhe 1.62, höchstens 62 Zeichen | erfüllt |
| Mobile Navigation | Menüknopf 101 × 44 px, Dialog füllt den Bildschirm, alle Ziele ≥ 44 px, aktuelle Seite hervorgehoben, Link schliesst das Menü | erfüllt. Gefunden und behoben: Der Aufruf-Knopf wurde auf dem Handy nicht ausgeblendet und drängte die Kopfzeile |
| Formulare und Fehlermeldungen | leer, ungültige E-Mail, gültig, sehr lange Nachricht, ohne JavaScript, gesperrte Zwischenablage | erfüllt, Einzelheiten unten |
| Bilder und Galerien | jedes Bild mit `alt`, `width` und `height`; keine fehlgeschlagene Anfrage; kein Layoutsprung (CLS 0) | erfüllt. Eine Galerie gibt es nicht |
| Akkordeons | Öffnen und Schliessen per Tastatur, Sprungmarke klappt auf, Direktaufruf mit Sprungmarke | erfüllt |
| Telefon- und E-Mail-Links | `tel:+41444326161` und `mailto:info@casatexag.ch` an allen Stellen | erfüllt |
| Sichtbarer Tastaturfokus | Fokusring 3 px, Kontrast 6.5 : 1 | erfüllt |
| Sinnvolle Fokusreihenfolge | Sprunglink, Logo, Navigation, Telefon, Register, Aufruf, Inhalt | erfüllt |
| Ausreichende Kontraste | alle Farbpaare gerechnet (Tabelle unten) | erfüllt |
| Semantische Überschriften | genau eine h1 je Seite, keine übersprungene Stufe | erfüllt. Gefunden und behoben: Überschriften standen in `<dt>` (in HTML nicht erlaubt) |
| Alternativtexte | kein Bild ohne `alt`; Zeichnungen mit `role="img"` und Beschreibung | erfüllt |
| Dialogbedienung per Tastatur | Enter öffnet, Fokus bleibt bei 40-mal Tab im Dialog, Escape schliesst, Fokus kehrt zum Knopf zurück | erfüllt |
| Nichts von fixierten Elementen verdeckt | Sprungziele liegen unter der Kopfzeile (`scroll-padding-top`), geprüft am Material «Kork» | erfüllt. Es gibt nur die fixierte Kopfzeile, keine Leiste am unteren Rand |
| Reduzierte Bewegung | mit `prefers-reduced-motion`: keine Animation, kein Übergang, Inhalt sofort sichtbar | erfüllt |
| Keine erzwungene Scrollführung | kein Scroll-Snap, kein fixiertes Scrollen | erfüllt |

Einstieg auf dem Handy (360 × 740): Titel zweizeilig, beide Knöpfe ohne Scrollen sichtbar, die Bodenfläche liegt direkt unter dem Text
im ersten Bildschirm, die Materialwahl darunter. Am Bildschirm (1440 × 900) ist die Bodenfläche mindestens 200 px hoch sichtbar.

**Nicht geprüft:** echte Geräte (iPhone, Android), Safari und Firefox, echte Screenreader (VoiceOver, NVDA). Diese Tests stehen in
`docs/UEBERGABE.md` unter «Vor dem Go-Live».

## Kontaktformular

| Fall | Ergebnis |
| --- | --- |
| Felder | Name, E-Mail, Telefon (optional), Anliegen, Nachricht; sichtbare Beschriftungen; kein Upload |
| Leer absenden | drei Fehlermeldungen am Feld (`role="alert"`), Fokus im ersten fehlerhaften Feld, kein E-Mail-Link |
| Ungültige E-Mail | genau eine Fehlermeldung, kein E-Mail-Link |
| Gültig | `mailto:info@casatexag.ch` mit Betreff und allen Angaben; Umlaute, «&», «#», «?» und Zeilenumbrüche kodiert |
| Rückmeldung | Hinweis, dass sich das E-Mail-Programm öffnet; keine Versandbestätigung |
| Kein E-Mail-Programm | «Nachricht kopieren» legt Empfänger, Betreff und Text in die Zwischenablage |
| Sehr lange Nachricht (1200 Zeichen) | Link bleibt bei 282 Zeichen, der ganze Text liegt in der Zwischenablage |
| Lange Nachricht, Zwischenablage gesperrt | kein gekürzter Entwurf; die ganze Nachricht steht zum Kopieren von Hand da |
| Ohne JavaScript | Knopf gesperrt, Eingabetaste sendet nichts, die Adresse bleibt ohne Parameter; die E-Mail-Adresse steht da |
| Speicherung und Versand | nichts in `localStorage`, `sessionStorage` oder Cookies; keine schreibende Anfrage an einen Server |

Alle Tests liefen mit fiktiven Daten («Testperson Fiktiv», `test@example.invalid`). Es wurde **keine** Nachricht an das Unternehmen gesendet:
Der Test fängt den erzeugten Link ab, statt ihn zu öffnen.

## Einwilligung

Audit des ersten Besuchs: keine Anfrage an einen fremden Host, kein Cookie, kein Eintrag im Browserspeicher. Deshalb kein Banner.
Der Link «Datenschutz-Einstellungen» in der Fusszeile öffnet einen Hinweis ohne Schalter. Die Komponente für spätere optionale Dienste
ist vorhanden (Banner mit «Alle akzeptieren», «Nur notwendige», «Einstellungen»; Kategorien standardmässig aus; Widerruf über die
Fusszeile) und wird durch einen Eintrag in `texte.einwilligung.kategorien` aktiv. Im aktiven Zustand wurde sie in dieser Demo nicht
im Browser geprüft, weil kein optionaler Dienst existiert.

## Kontraste (WCAG 2.1)

| Paar | Verhältnis | verlangt |
| --- | --- | --- |
| Text (`tinte` auf `wand` / `papier`) | 15.75 / 17.22 : 1 | 4.5 |
| Nebentext (`tinte-2` auf `wand` / `papier`) | 8.06 / 8.81 : 1 | 4.5 |
| Etiketten und Legenden (`grau` auf `wand` / `papier` / Weiss) | 5.29 / 5.79 / 6.04 : 1 | 4.5 |
| Links (`blau-tief` auf `wand` / `papier`) | 6.48 / 7.09 : 1 | 4.5 |
| Knopftext (Weiss auf `blau-tief` / `blau-dunkel`) | 7.39 / 10.49 : 1 | 4.5 |
| Knopf sekundär im Hover (`papier` auf `tinte`) | 17.22 : 1 | 4.5 |
| Fehlermeldung (`fehler` auf Weiss / `papier`) | 7.37 / 7.06 : 1 | 4.5 |
| Fläche ohne Bild (`blau-dunkel` auf `blau-hell`) | 8.85 : 1 | 4.5 |
| Rand der Eingabefelder (`grau` auf Weiss) | 6.04 : 1 | 3 |
| Fokusring (`blau-tief` auf `wand`) | 6.48 : 1 | 3 |

Trennlinien (1.88 : 1) sind Dekoration und tragen keine Information.

## Lighthouse

Gemessen mit Lighthouse (aktuelle Version über `npx`), Chrome kopflos, `node werkzeuge/qa/lighthouse.mjs`.

**Live** (<https://nick8952.github.io/casatex-zuerich-demo/>):

| Seite | Modus | Leistung | Barrierefreiheit | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Start | Desktop | 100 | 100 | 100 | 66 | 0.6 s | 0 | 0 ms |
| Start | Mobil | 96 | 100 | 100 | 66 | 2.8 s | 0 | 30 ms |
| Leistungen | Desktop | 100 | 100 | 100 | 66 | 0.6 s | 0 | 0 ms |
| Leistungen | Mobil | 98 | 100 | 100 | 66 | 2.5 s | 0 | 10 ms |
| Parkett | Desktop | 100 | 100 | 100 | 66 | 0.6 s | 0 | 0 ms |
| Parkett | Mobil | 96 | 100 | 100 | 66 | 2.7 s | 0 | 30 ms |
| Kontakt | Desktop | 100 | 100 | 100 | 66 | 0.5 s | 0 | 0 ms |
| Kontakt | Mobil | 99 | 100 | 100 | 66 | 2.0 s | 0 | 0 ms |

**Lokal** (Vorschau-Server ohne Komprimierung): Desktop 97 bis 99, Mobil 76 bis 82 (LCP 5.0 bis 6.8 s). Die lokalen Mobilwerte sind
wegen der fehlenden Komprimierung nicht aussagekräftig; massgebend ist die Live-Messung.

**SEO 66 ist gewollt:** Die einzige nicht bestandene Prüfung ist `is-crawlable`, weil die Demo `noindex` trägt. Mit der Freigabe zur
Indexierung entfällt sie. Das mobile LCP liegt auf zwei Seiten leicht über dem Zielwert von 2.5 s (simulierte langsame Verbindung);
grösster Posten ist das JavaScript des Frameworks (590 KB unkomprimiert), nicht das Bild.

## Budgets (Export-Prüfung)

| Budget | Ist | Grenze |
| --- | --- | --- |
| Vorgeladenes Bild (Bodentextur) | 126 KB | 146 KB |
| JavaScript je Seite, unkomprimiert | 590 KB | 703 KB |
| Alle Bildvarianten zusammen | 3433 KB | – |

Gefunden über das Budget: zod war im Browser-Bundle gelandet (974 KB), weil eine Client-Komponente einen Wert aus der Modelldatei
einband. Behoben durch eine eigene Datei für Pfade.

## Adressen und GitHub Pages

- Alle neun Seiten: Direktaufruf 200, Neuladen 200 (live 304, also unverändert aus dem Zwischenspeicher bestätigt), Canonical zeigt auf die Demo.
- `/kontakt` ohne Schrägstrich am Ende funktioniert.
- Unbekannte Adresse: Status 404 mit gestalteter Seite, Kopfzeile, `noindex`; der Link zur Startseite führt unter den Unterpfad. `404.html` direkt aufrufbar.
- Keine fehlgeschlagene Anfrage (Bilder, Schriften, Skripte liegen unter dem Unterpfad).
- `robots.txt` erlaubt das Lesen (damit `noindex` gelesen wird) und nennt keine Sitemap; `sitemap.xml` existiert nicht (404).
- Live geprüft am 5. Oktober 2026: alle Seiten 200, `<meta name="robots" content="noindex, nofollow">` vorhanden.

Die Funktionsprüfung «Adressen» schlug gegen die Live-Adresse zuerst fehl, weil der Test nach dem Neuladen genau 200 erwartete und
GitHub Pages 304 lieferte. Das ist ein Erfolg; der Test akzeptiert jetzt beide.

## Sanity und Vercel (ohne Projekt geprüft)

| Prüfung | Ergebnis |
| --- | --- |
| Studio: `tsc --noEmit` | ohne Fehler |
| Studio: `sanity schema validate` (Platzhalter-ID) | 0 Fehler, 0 Warnungen |
| Import-Trockenlauf `npm run seed -- --probe` | 20 Dokumente gebaut, jedes besteht das Domainmodell und entspricht nach dem Zurücklesen den lokalen Inhalten |
| Bild-Spiegel, Selbsttest | Foto: 3 WebP und 3 AVIF; Logo mit Transparenz: 2 verlustfreie WebP |
| Go-Live-Probe (`DEPLOY_TARGET=vercel`, `INDEXIERUNG=1`, `SITE_URL=https://www.example.com`) | Build grün; kein noindex, Sitemap und JSON-LD vorhanden, Canonical auf der Testdomain |
| `INDEXIERUNG=1` ohne `SITE_URL` | Build bricht ab |
| `SITE_URL` zusammen mit dem Unterpfad der Demo | Build bricht ab |
| `INDEXIERUNG=1` für `…vercel.app` | Build bricht ab |
| `INDEXIERUNG=1` für eine echte Domain mit den Demo-Inhalten | Build bricht ab und nennt 13 nicht freigegebene Punkte |

Der Trockenlauf fand einen echten Fehler (Rechtstexte kamen beim Zurücklesen leer an) und die CI einen zweiten (dem Studio fehlten
eigene Node-Typen; lokal verdeckten ihn die Typen des übergeordneten Projekts). Beide sind behoben.

**Nicht geprüft**, weil kein Sanity- und kein Vercel-Projekt existiert: der echte Import, das Herunterladen der Bilder, ein Build mit
`CONTENT_SOURCE=sanity`, das Hosting auf Vercel, der Webhook.

## Codex: Architekturprüfung (vor der Umsetzung)

Aufruf lesend (`codex exec --sandbox read-only`), ohne Rückdelegation. 14 Befunde, alle übernommen:

| Nr. | Befund | Umsetzung |
| --- | --- | --- |
| 1 | Vier Leistungsseiten behaupten mehr als belegt | drei Bereiche, Materialkunde getrennt und so bezeichnet, Verzeichnisliste nur intern (Entscheid von Nick) |
| 2, 3 | Infrastruktur der Vorgänger-Demo zu umfassend; Umschreiben von Quellcode beim Build fragil | immer statisch, kein Kopiermuster, feste Routen (Entscheid von Nick) |
| 4 | robots-Sperre widerspricht noindex | nur Meta-noindex, keine Sitemap, JSON-LD erst beim Go-Live |
| 5 | Datenschutz darf Verarbeitung nicht verneinen | Hosting, E-Mail-Weg und externe Links sachlich beschrieben; Betreiber der Demo als Verantwortlicher |
| 6 | Herkunft nur je Leistung ist zu grob | Herkunft und Freigabe je Aussage |
| 7 | Optionale Bereiche brauchen eine gemeinsame Regel | `lib/content/sichtbar.ts`; Öffnungszeiten als Abschnitt |
| 8 | Gleiches Modell heisst gleiche Ausgabe | ein Domainmodell, zwei Adapter, Prüfung beim Build |
| 9 | Sanity reicht in die gemeinsame Schicht | Sanity nur im Adapter, dynamisch geladen |
| 10, 11 | Bodenfläche abstufen; Materialwahl als echte Bediengruppe | reines CSS, schmal flacher, nur eine Textur vorgeladen, native Radios, für Screenreader verborgen |
| 12 | Adress-Matrix für die Abnahme | Direktaufruf, Neuladen, 404, Canonical in den Funktionsprüfungen |
| 13 | Grenzfälle des mailto-Formulars | Kodierung, Längengrenzen, Kopierweg, lange Nachrichten |
| 14 | Feste Budgets statt Vercel-Probe in der CI | Budgets in der Export-Prüfung |

## Codex: Abschlussprüfung (Code, Funktion, Qualität)

Aufruf lesend, ohne Rückdelegation, 47 Dateien. Der erste Lauf wurde durch eine Sitzungsunterbrechung abgebrochen und danach
vollständig wiederholt. 12 Befunde:

| Nr. | Schwere | Befund | Entscheid |
| --- | --- | --- | --- |
| 1 | hoch | Ohne JavaScript schickt das Formular die Eingaben per GET an die Adresse | **behoben:** Knopf bis zur Bereitschaft gesperrt; Test ohne JavaScript ergänzt |
| 2 | hoch | Eine Variable macht die Demo indexierbar; Kundendomain könnte im Canonical der Demo landen | **behoben:** Leitplanken in `lib/deploy-ziel.ts`, vier Abbruchfälle geprüft |
| 3 | hoch | Nicht freigegebene Aussagen werden beim Go-Live nicht technisch gesperrt; die Live-Prüfung las nur lokale Inhalte | **behoben:** `lib/content/freigabe.ts` prüft die verwendete Quelle und bricht den Build ab |
| 4 | hoch | Der erste Sanity-Build scheitert an Bildern vom fremden CDN | **behoben:** Bilder werden vor dem Build gespiegelt |
| 5 | mittel | Freie Texte über das Unternehmen umgehen das Herkunftsmodell | **behoben:** `belege` je Seite (Startseite, Leistungsübersicht, Über Casatex) |
| 6 | mittel | Quellen ohne Adresse möglich | **behoben:** Adresse Pflicht, ausser bei eigenen Angaben des Unternehmens (Modell und Studio) |
| 7 | mittel | Bildnachweis mit Sanity unvollständig | **behoben:** Nachweise werden aus allen Inhalten gesammelt |
| 8 | mittel | Bei gesperrter Zwischenablage öffnet sich ein gekürzter Entwurf | **behoben:** kein Entwurf, ganze Nachricht zum Kopieren; Test ergänzt |
| 9 | mittel | Schnelle Materialwechsel können Auswahl und Boden entkoppeln | **behoben:** nur die zuletzt gewählte Textur wird aktiv |
| 10 | mittel | Impressum nennt keine Postanschrift des Betreibers | **offen:** Die Anschrift kann nur Nick liefern (`docs/UEBERGABE.md`) |
| 11 | niedrig | Import lädt Bilder bei jedem Lauf neu hoch | **abgelehnt:** Sanity vergibt Asset-Kennungen aus dem Dateiinhalt, derselbe Upload erzeugt kein Duplikat. Kommentar im Skript ergänzt |
| 12 | niedrig | Fehlerhaft kodierte Sprungmarke wirft im Browser | **behoben:** abgefangen |

Von Codex als in Ordnung bestätigt: native Dialoge (Fokus, Escape), sichtbare Fokusmarkierung, reduzierte Bewegung, Maskierung des
JSON-LD, Pfadbegrenzung des Vorschau-Servers, minimale Rechte der CI.

## Eigene Funde während der Arbeit

| Fund | Behebung |
| --- | --- |
| Eigene CSS-Klassen schlugen Tailwind-Utilities (Knopf auf dem Handy nicht ausgeblendet) | Klassen in `@layer components` |
| Weisser Kasten um das Logo auf dem hellen Grund | weisser Grund transparent gerechnet, Form und Farbe unverändert |
| Gespiegelte Teppich-Kachel zeigte ein Kaleidoskop-Muster | Ränder überblenden statt spiegeln |
| Drei erzeugte Bilder wurden nirgends gezeigt, standen aber im Bildnachweis | entfernt; Prüfung gegen unbenutzte Bilder ergänzt |
| Sperrliste meldete «Teppichfliesen» als Preis («chf») und «am besten» als Superlativ | Muster präzisiert |
| Zwei Fotos zeigten nicht, was ihr Titel vermuten liess (Schuppentür statt Boden, Raureif statt Teppich) | nicht verwendet; Schlagworte jedes Fotos geprüft |

## Abgleich mit dem Auftrag

| Punkt | Stand |
| --- | --- |
| Quellenprüfung, Abgrenzung zur Casatex GmbH | erledigt (`docs/INHALTSMATRIX.md`) |
| `CLAUDE.md`, `AGENTS.md`, Codex | erledigt; zwei Codex-Prüfungen |
| Skills inventarisiert und angewendet | erledigt (`SKILL-ANWENDUNG.md`) |
| Inhalte vollständig übernommen, nichts erfunden | Es gab keine erreichbare Website mit Inhalten. Übernommen ist alles Belegte; der Rest steht als Frage in `docs/UEBERGABE.md` |
| Bilder: Rückfrage, Rechte, Dokumentation | erledigt (`docs/BILDER.md`, `assets/originale/HERKUNFT.md`); Freigabe des Logos durch das Unternehmen offen |
| Eigenständige Gestaltung | erledigt (`docs/DESIGN.md`) |
| Seitenstruktur | Start, Leistungen und Materialien, drei Leistungsseiten, Über Casatex, Kontakt, Impressum, Datenschutz, 404. Keine Seiten für Referenzen, Ausstellung, Partner (keine Belege) |
| Next.js, TypeScript, statischer Export, gemeinsame Inhaltsschicht | erledigt |
| Sanity vorbereitet, Anleitungen | erledigt, ohne Projekt geprüft |
| Kontaktformular ohne Backend | erledigt |
| Impressum, Datenschutz, Cookie-Banner | erledigt; kein Banner, weil nichts Einwilligungspflichtiges läuft. **Offen: Postanschrift von Nick** |
| Mobile Ansicht und Barrierefreiheit | erledigt im automatisierten Rahmen; echte Geräte und Screenreader offen |
| SEO und Performance | erledigt; Demo ist noindex und als Entwurf gekennzeichnet |
| Repository und öffentliche Demo | erledigt: <https://github.com/Nick8952/casatex-zuerich-demo>, <https://nick8952.github.io/casatex-zuerich-demo/> |
