# Entscheidungen (kompakte ADRs)

## 1. Immer statisch; Sanity löst einen Build aus (05.10.2026)

Vorgabe: GitHub Pages jetzt, Sanity und Vercel später. Entscheid von Nick nach der Codex-Architekturprüfung: Die Website bleibt in jeder
Betriebsart ein statischer Export. Das Studio läuft getrennt (`studio/`, gehostet bei Sanity), Veröffentlichen ruft per Webhook einen
Vercel-Deploy-Hook auf. Verworfen wurde das Muster der früheren Demos (eingebettetes Studio, `/api/revalidate`, Server-Routen, die vor
dem Build kopiert werden, Skript, das `dynamicParams` im Quelltext umschreibt): zu viele bewegliche Teile für eine Broschürenseite.
Preis: Änderungen sind erst nach dem Build sichtbar (ein bis drei Minuten), keine Vorschau von Entwürfen auf der Website.

## 2. Ein Domainmodell, zwei Adapter

`lib/content/modell.ts` beschreibt die Inhalte als zod-Schemas. `local.ts` und `sanity.ts` normalisieren ihre Quelle in dieses Modell und
prüfen sie beim Build. «Identische Datenmodelle» heisst: gleiche Ausgabe, nicht gleiche Speicherform. `scripts/seed.mts --probe` prüft die
Parität, ohne dass ein Sanity-Projekt existiert.

## 3. Unternehmensaussagen tragen ihre Herkunft

Jede Aussage über den Betrieb hat `herkunft` und `freigabe`. Verzeichnisse sind als Quelle nicht zugelassen. Grund: Die Firmenwebsite
zeigt nur eine Wartungsseite, frühere Websites sind offline; ohne diese Regel wäre die Versuchung gross, Verzeichnistexte zu übernehmen.
`inhalt:pruefen -- --live` listet vor dem Go-Live alles, was das Unternehmen noch bestätigen muss.

## 4. Streng bei den Leistungen: drei Bereiche plus Materialkunde

Entscheid von Nick. Belegt sind die Bereiche (Bodenbeläge amtlich, Parkett über Verband und Lehrbetrieb, Teppiche als textile
Bodenbeläge). Einzelne Leistungen wie Renovation, Sisal oder Terrassendielen stehen nur in einem Verzeichnis und bleiben intern.
Die Materialkunde ist allgemein und so bezeichnet. Vorhänge erscheinen nur im wörtlichen Zitat des Handelsregisterzwecks.

## 5. Kein Cookie-Banner, Einwilligung vorbereitet

Audit: keine Cookies, kein Speicherzugriff, keine Anfragen an Dritte. Ein Banner wäre irreführend. Die Komponente ist vorhanden und wird
durch einen Eintrag in `texte.einwilligung.kategorien` aktiv. Der Footer-Link «Datenschutz-Einstellungen» zeigt bis dahin einen Hinweis
ohne Schalter.

## 6. noindex ohne robots-Sperre, JSON-LD erst beim Go-Live

Eine Sperre in robots.txt würde verhindern, dass Suchmaschinen das `noindex` lesen (und wäre unter einem Unterpfad ohnehin wirkungslos).
Die Demo trägt deshalb auf jeder Seite `noindex, nofollow`, hat keine Sitemap und kein JSON-LD. Strukturierte Daten in der Demo würden
das Unternehmen maschinenlesbar als Betreiberin einer inoffiziellen Seite ausweisen. Mit `INDEXIERUNG=1` entsteht beides.

## 7. Kontakt per mailto, mit Ausweg

Statisch heisst: kein Versand. Das Formular baut eine kodierte E-Mail, der Knopf heisst «E-Mail vorbereiten», danach steht ein Hinweis
statt einer Bestätigung. Ausweg ohne E-Mail-Programm: «Nachricht kopieren». Sehr lange Nachrichten kommen als Kurzfassung in den Link,
der ganze Text in die Zwischenablage (mailto-Links über etwa 1800 Zeichen sind unzuverlässig).

## 8. Karte als externer Link

Eine eingebettete Karte überträgt Daten an Google. Es gibt nur den Routenlink, der sich in einem neuen Fenster öffnet.

## 9. Materialbeispiele statt Projektbilder; keine KI-Bilder

Entscheid von Nick: lizenzfreie Materialfotos und gezeichnete Muster. Vom Betrieb gibt es kein eigenes Bildmaterial. Jedes Bild ist als
Materialbeispiel gekennzeichnet. Für die Bodenfläche kamen CC0-Texturen von Poly Haven dazu, weil sie sich nahtlos wiederholen.

## 10. Logo unverändert, Hintergrund transparent

Das Logo liegt nur als JPEG auf weissem Grund vor (569 × 188 px). Form und Farben bleiben, der weisse Grund wird rechnerisch
transparent gesetzt. Kein Nachbau als Vektor: Die Wortmarke lässt sich ohne die Originalschrift nicht treu nachzeichnen.

## 11. Zwei Schriften mit festen Rollen

Grotesk für Titel und Bedienelemente, Leseschrift mit Serifen für den Lauftext. Begründung und verworfene Varianten: `docs/DESIGN.md`.

## 12. Eigene CSS-Klassen in `@layer components`

Ohne Ebene schlagen eigene Klassen jede Tailwind-Utility (`.knopf` setzte `display` und machte `hidden sm:inline-flex` wirkungslos).
In der Ebene `components` können Utilities sie übersteuern.

## 13. Pfade ohne zod

Client-Komponenten brauchen Seitenadressen. Lägen sie in `modell.ts`, käme zod ins Browser-Bundle (gemessen: 974 statt 590 KB JavaScript
je Seite). Deshalb `lib/content/pfade.ts`; `export:pruefen` hat ein Budget, das den Rückfall meldet.

## 14. Budgets in der Export-Prüfung

Vorgeladenes Bild höchstens 146 KB, JavaScript je Seite höchstens 703 KB unkomprimiert, AVIF-Varianten höchstens 254 KB. Knapp über
dem Ist-Stand, damit eine Verschlechterung auffällt.

## 15. Indexierung braucht mehr als eine Variable (Codex-Abschlussprüfung)

`INDEXIERUNG=1` allein hätte auch die GitHub-Pages-Demo indexierbar gemacht. Jetzt verlangt die Indexierung eine ausdrückliche
`SITE_URL`, schliesst Vorschau-Adressen aus und prüft für jede echte Domain die Freigaben aus der tatsächlich verwendeten Inhaltsquelle.
`SITE_URL` lässt sich nicht mit dem Unterpfad der Demo kombinieren, damit dort nie eine Kundendomain im Canonical steht.
Für Probe-Builds gibt es reservierte Testdomains (`example.com`, `*.test`).

## 16. Bilder aus Sanity werden gespiegelt

Der Sanity-Adapter hätte Bildadressen von `cdn.sanity.io` ausgegeben: Anfragen an einen Dritten und ein sicherer Fehlschlag der
Export-Prüfung beim ersten echten Build. Ein Skript lädt die Bilder vor dem Build und erzeugt lokale Varianten.
Preis: Der Build dauert etwas länger; ein neues Bild ist wie jeder Inhalt erst nach dem Build sichtbar.

## 17. Formular ohne JavaScript gesperrt

Ohne JavaScript hätte der Knopf das Formular per GET abgeschickt und Name, E-Mail und Nachricht an die Adresse gehängt (und damit an
den Server von GitHub übertragen). Der Knopf ist deshalb gesperrt, bis die Seite bereit ist; ohne JavaScript nennt das Formular die E-Mail-Adresse.

## 18. Freie Texte mit Belegen je Seite

Einstieg und Einleitungen sagen etwas über den Betrieb, lagen aber ausserhalb des Herkunftsmodells. Startseite, Leistungsübersicht und
Über Casatex tragen jetzt `belege` (Quellen und Freigabe für die Seite als Ganzes). Eine Quelle ohne Adresse ist nur bei eigenen
Angaben des Unternehmens zulässig.
