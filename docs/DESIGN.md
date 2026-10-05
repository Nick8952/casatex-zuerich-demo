# Gestaltung «Raumkante»

## Lesart des Auftrags

Reading this as: Website eines Zürcher Fachbetriebs für Bodenbeläge, für Privatleute, Verwaltungen und Architekturbüros, die einen
Boden wählen müssen; ruhig, materialorientiert, vertrauensbildend; eigene Bausteine mit Tailwind 4, zwei lokale Schriften, zurückhaltende Bewegung.

Stellwerte (aus `design-taste-frontend`): Varianz 6 · Bewegung 3 · Dichte 3. Begründung: Der Auftrag verlangt Ruhe, Präzision und
Verständlichkeit, dazu Barrierefreiheit und Performance vor Effekten. Das ist näher an «calm / editorial» als am Standard für Landingpages.

## Die eine Idee

**Wand trifft Boden.** Ein Bodenleger arbeitet an der Kante, an der die Wand aufhört. Die Website ist deshalb wie ein Raum gebaut:
oben eine helle, ruhige Wandfläche für die Schrift, darunter Material. Dazwischen liegt eine feine Sockelleiste.

- **Einstieg:** Wand mit Titel, Sockelleiste, darunter eine perspektivische Bodenfläche. Über beschriftete Handmuster wechselt man den
  Boden (Parkett, Dielen, Teppich, Linoleum, Kork). Das ist die Erfahrung, die der Betrieb verkauft: Derselbe Raum wirkt mit jedem Boden anders.
- **Sockelleiste:** die Linie zwischen Wand und Boden kehrt unter jedem Seitenkopf und über der Fusszeile wieder. Sie ordnet die Seite,
  sie ist kein Schmuck.
- **Die Bildmarke von Casatex zeigt selbst Bodenflächen in Perspektive.** Die Bodenfläche der Website nimmt das auf, ohne die Marke nachzubauen.

Alles andere bleibt still: keine Verläufe, keine Schatten, keine Kacheln, keine Zähler, keine Icons als Schmuck.

## Abgrenzung zu den bisherigen Demos

| | Bisher | Hier |
| --- | --- | --- |
| Navigation | Menüleiste mit Untermenü, mobile Kontaktleiste (Altec) | Zwei Seitenlinks, ein Aufruf, dazu das **Materialregister**: ein Dialog mit allen Materialien als Handmuster, auf dem Handy zugleich das Menü |
| Einstieg | Verteiler-Panel, Bildband, Tafel neben Typografie | Wand und perspektivischer Boden mit Materialwahl |
| Leistungen | Sammelschiene, Auftragsblatt, Farbchips | **Dielen**: lange Bretter im Schiffsboden-Versatz, jedes ein Link |
| Materialien | – | **Handmuster** mit Etikett, Materialkunde als Akkordeon, gezeichnete Verlegemuster |
| Schrift | Archivo, Inter, Big Shoulders, Source Sans 3, Gabarito, Figtree, Schibsted Grotesk, Bricolage, Instrument Sans | Familjen Grotesk und Literata (beide neu) |
| Fusszeile | Spaltenraster mit Logo | Beginnt mit der Sockelleiste, gross der Leitsatz und die Adresse als Schriftbild |
| Farbe | Rot, Bordeaux, Gelb/Schwarz, Aubergine/Lime, Orange/Lime | Helle Neutrale, kühles Schwarz, Blau der Bildmarke |

## Farben

Aus dem Logo gemessen: Schwarz der Wortmarke und ein klares Blau der Bildmarke (häufigster Wert `#1888e0`).

| Token | Wert | Verwendung |
| --- | --- | --- |
| `--color-wand` | `#f1f0ec` | Seitenhintergrund |
| `--color-papier` | `#fbfaf8` | Sockelleiste, Dielen, Formularfläche, Fusszeile |
| `--color-tinte` | `#15171a` | Text, Titel (kühles Schwarz wie die Wortmarke) |
| `--color-tinte-2` | `#44484f` | Vorspann, Nebentext |
| `--color-grau` | `#5f636a` | Etiketten, Bildlegenden |
| `--color-linie`, `--color-linie-stark` | `#d8d5ce`, `#b5b1a8` | Trennlinien |
| `--color-blau` | `#1b89e0` | das Blau der Bildmarke, **nur für Grafik** (Zitatlinie, Favicon) |
| `--color-blau-tief` | `#0a55a3` | Links, Hauptknopf, Fokusring (derselbe Farbton, dunkler, damit Text lesbar ist) |
| `--color-blau-dunkel`, `--color-blau-hell` | `#083f7a`, `#e2edf9` | Hover, Fläche ohne Bild |
| `--color-fehler` | `#a3261b` | Fehlermeldungen |

Der Auftrag wünscht warme, natürliche Töne. Die Wärme kommt hier aus dem **Material** (Holz, Kork, Faser), nicht aus einem
beigen Hintergrund mit Terrakotta-Akzent: Das wäre der Standardlook für «Handwerk» und passte nicht zum blau-schwarzen Logo.
Ein Akzent, überall derselbe. Helles Theme ist fix (das Logo existiert nur für hellen Grund).

Gemessene Kontraste: Text 15.8 : 1, Nebentext 8.1 : 1, Etiketten 5.3 : 1, Links 6.5 : 1, Knopftext 7.4 : 1, Fehler 7.4 : 1
(alle Paare in `docs/PRUEFBERICHT.md`).

## Schrift

| Rolle | Schrift | Einsatz |
| --- | --- | --- |
| Titel und Bedienelemente | **Familjen Grotesk** (variabel 400 bis 700) | Titel, Navigation, Knöpfe, Etiketten, Formulare |
| Lauftext | **Literata** (variabel) | Vorspann, Absätze, Materialkunde, Rechtstexte |

Das Logo ist eine breite, technische Grotesk. Die Titel antworten darauf mit einer Grotesk, die eigene Formen hat, aber nicht mit der
Wortmarke konkurriert. Der Lauftext steht in einer Leseschrift mit Serifen: Die Materialkunde ist zum Lesen da und soll wie ein gut
gemachter Fachkatalog wirken. Das ist die bewusste Abweichung vom Reflex «Serifen-Titel auf Creme»: Die Serifen stehen im Text, nicht im Titel.
Beide Schriften sind unter der SIL Open Font License frei, werden lokal ausgeliefert (zusammen 71 KB) und über `next/font/local` vorgeladen.

Grössen: `.titel-1` 40 bis 80 px, `.titel-2` 30 bis 48 px, `.titel-3` 21 bis 26 px, `.titel-4` 17 px, Lauftext 17 px mit Zeilenhöhe 1.62,
Zeilenlänge höchstens 62 Zeichen. Lange zusammengesetzte Wörter dürfen in Titeln getrennt werden.

## Form und Raster

- Kanten: Flächen, Bilder und Handmuster 0 px (ein Muster ist geschnitten, nicht gerundet); Knöpfe und Eingabefelder 2 px.
- Raster: höchstens 82 rem breit, Seitenrand 20 bis 56 px. Abschnitte 52 bis 96 px Abstand.
- Trennung durch Linien und Abstand, keine Karten mit Schatten.
- Jede Seite benutzt andere Aufbauten: Einstieg (Wand/Boden), Dielen, Bild neben Text, Musterreihe, Zeilen mit Aussagen, Kontakt zweispaltig.

## Zustände und Breakpoints (Übergabe an die Entwicklung)

Breakpoints: 40 rem (640 px), 48 rem (768 px), 64 rem (1024 px), 80 rem (1280 px). Geprüft auf 320, 360, 390, 640, 720, 768, 1024, 1280,
1440 und 1920 px.

| Baustein | Zustände | Verhalten |
| --- | --- | --- |
| Knopf (`.knopf-primaer`, `.knopf-sekundaer`) | Ruhe, Hover, gedrückt, Fokus | Hover: dunkleres Blau bzw. gefüllt; gedrückt: 1 px nach unten; Fokus: 3 px Ring in `blau-tief` mit 3 px Abstand. Mindesthöhe 48 px (klein 44 px), Text einzeilig. |
| Eingabefeld (`.feld`) | Ruhe, Fokus, Fehler | Beschriftung über dem Feld, Hilfetext darunter. Fehler: roter Rand 2 px, Meldung unter dem Feld (`role="alert"`), Fokus springt ins erste fehlerhafte Feld. |
| Materialwahl (`.bodenwahl`) | gewählt, Hover, Fokus | Native Radios, Pfeiltasten wechseln. Gewählt: blauer Rand. Nicht gewählte Texturen laden erst bei der Wahl. |
| Diele (`.diele`) | Ruhe, Hover, Fokus | Ganze Fläche ist ein Link. Ab 768 px zweispaltig mit Versatz, darunter Bild über Text. |
| Materialkunde (`details`) | zu, offen | Plus dreht sich zum Kreuz. Sprungmarke `#material-…` klappt den Eintrag auf. Ohne JavaScript von Hand zu öffnen. |
| Materialregister (`dialog.register`) | zu, offen | Unter 1024 px ganzflächig (zugleich Menü), darüber ein Blatt von oben. Escape und Klick auf den Hintergrund schliessen, der Fokus kehrt zum Knopf zurück. |
| Kopfzeile | – | Fixiert, 64 px (ab 1024 px 72 px). Unter 640 px ohne Aufruf-Knopf, unter 1024 px ohne Seitenlinks, unter 1280 px Telefon nur als Symbol. |
| Einstieg (`.held`) | – | Unter 1024 px: Text, Boden, Materialwahl untereinander. Darüber: Text links, Materialwahl rechts, Boden füllt den Rest des Bildschirms. |

Randfälle: lange Wörter in Titeln werden getrennt; ein Material ohne Bild zeigt eine Fläche mit dem Namen; leere Listen (Referenzen,
Partner, Öffnungszeiten) erzeugen keinen Abschnitt; ohne JavaScript bleiben alle Inhalte lesbar, das Formular nennt die E-Mail-Adresse.
Ladezustände gibt es nicht (statische Seiten); einzig der Bodenwechsel wartet auf das Bild und blendet dann ein.

## Bewegung

Jede Bewegung hat einen Grund:

| Bewegung | Wozu | Technik |
| --- | --- | --- |
| Einstieg: Titel, Text, Knöpfe, Materialwahl erscheinen nacheinander | Lesereihenfolge | CSS-Animation, 760 ms |
| Materialwechsel: neue Bodenfläche blendet ein | Rückmeldung auf die Wahl | Deckkraft, 520 ms |
| Abschnitte tauchen beim Scrollen auf | Ruhe im Seitenaufbau | `animation-timeline: view()`, nur wo der Browser es kann |
| Diele: Bild und Pfeil reagieren auf den Zeiger | zeigt, dass die ganze Fläche ein Link ist | `transform` |
| Dialog öffnet von oben | Herkunft des Dialogs | 360 ms |

Mit `prefers-reduced-motion: reduce` gibt es keine Animation und keinen Übergang; der Inhalt ist sofort da. Kein GSAP, keine
Scrollführung, kein Scroll-Listener. Animiert werden nur `transform` und `opacity`.

## Die Bodenfläche technisch

Eine einzige Ebene je Material (`.boden`), per CSS um ihre Oberkante gekippt (`rotateX(74deg)`, `perspective: 560px`), mit einer
nahtlos wiederholten Textur als Hintergrund. Kein Canvas, kein WebGL, kein JavaScript für die Darstellung. Schmal (unter 768 px) ist
die Fläche flacher. Nur die erste Textur wird vorgeladen (AVIF, 109 KB); die anderen laden erst, wenn sie gewählt werden. Browser
ohne AVIF bekommen WebP. Die Fläche ist für Screenreader verborgen; was zu sehen ist, steht als Text bei der Materialwahl.

## Selbstkritik (nach `frontend-design` und `design-critique`)

- **Erster Blick:** Titel, dann der Boden. Das ist richtig: Aussage zuerst, Material als Beleg.
- **Was trägt:** die Bodenfläche mit Dielen und Fischgrat; die Dielen-Liste; die gezeichneten Verlegemuster.
- **Schwächer:** Linoleum, Kork und Teppich sind als Fläche naturgemäss ruhig; die Diele «Bodenbeläge» zeigt deshalb nur eine
  einfarbige Probe. Mit eigenen Fotos des Betriebs gewinnt genau diese Stelle am meisten.
- **Bewusst weggelassen:** Kennzahlen, Kundenstimmen, Logoleiste, Ablauf in Schritten. Dafür gibt es keine belegten Inhalte.
- **Geprüft und verworfen:** Serifen-Titel (zu nah am Standardlook, fremd zum Logo), cremefarbener Grund mit Holzakzent (ebenso),
  gespiegelte Kacheln für Teppich (sichtbare Symmetrie; ersetzt durch überblendete Ränder), Fotos statt Kacheln für die Bodenfläche (unscharf).
