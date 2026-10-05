# Inhalte pflegen

Für alle, die Texte, Bilder oder Kontaktdaten der Casatex-Website ändern. Programmierkenntnisse braucht es dafür nicht.

Es gibt zwei Wege, je nach Stand des Projekts:

- **Mit Sanity** (sobald eingerichtet): im Studio im Browser. Das ist der Weg für das Unternehmen. → Teil A
- **Ohne Sanity** (Stand der Demo): in den Dateien unter `data/`. Das ist der Weg für Nick. → Teil B

## Teil A: Im Studio (Sanity)

### Anmelden

Adresse des Studios öffnen (zum Beispiel `https://casatex.sanity.studio`) und mit der eingeladenen E-Mail-Adresse anmelden.

### Wo steht was?

| Im Studio | Das ändern Sie dort |
| --- | --- |
| **Seiten → Startseite** | Titel und Text im Einstieg, die Böden zur Auswahl, die Texte der Abschnitte |
| **Seiten → Leistungen und Materialien** | Einleitung, Titel und Reihenfolge der Materialgruppen |
| **Seiten → Über Casatex** | Aussagen über das Unternehmen (jede mit Quelle), das Zitat |
| **Seiten → Kontakt und Anfahrt** | Texte der Kontaktseite |
| **Seiten → Impressum / Datenschutzerklärung** | Rechtstexte (bitte nur nach Rücksprache) |
| **Leistungen** | je Bereich: Titel, Kurztext, Einleitung, Aussagen, Bilder, zugehörige Materialien |
| **Materialien** | Materialkunde: Abschnitte, Eigenschaften, Handmuster |
| **Referenzen** | ausgeführte Arbeiten (der Abschnitt erscheint ab dem ersten Eintrag) |
| **Partner und Marken** | Hersteller, Marken, Verbände (der Abschnitt erscheint ab dem ersten Eintrag) |
| **Unternehmen und Kontakt** | Adresse, Telefon, E-Mail, Öffnungszeiten, Logo |
| **Navigation, Fusszeile und Formulartexte** | Menüpunkte, Fusszeile, alle Texte des Anfrageformulars |

### Ändern und veröffentlichen

1. Eintrag öffnen, Feld ändern. Unter jedem Feld steht, wofür es da ist.
2. Unten rechts auf **Veröffentlichen** klicken. Vorher ist die Änderung nur ein Entwurf.
3. **Warten.** Die Website wird neu gebaut; nach ein bis drei Minuten ist die Änderung sichtbar. Dann die Seite neu laden.

Rot markierte Felder verhindern das Veröffentlichen. Der Hinweis am Feld sagt, was fehlt.

### Regeln, die das Studio durchsetzt

- **Aussagen über das Unternehmen brauchen eine Quelle.** Im Feld «Quellen» steht, woher die Angabe stammt, zum Beispiel
  «Eigene Angabe des Unternehmens, bestätigt am …». Ohne Quelle lässt sich die Aussage nicht veröffentlichen.
- **Seiten mit Texten über das Unternehmen haben «Belege».** Auf der Startseite, bei «Leistungen und Materialien» und bei
  «Über Casatex» steht unten, worauf sich Einstieg und Einleitung stützen. Wer dort etwas Neues über den Betrieb schreibt, trägt die
  Quelle nach.
- **Bilder brauchen eine Bildbeschreibung und einen Bildnachweis.** Die Beschreibung sagt in einem Satz, was zu sehen ist
  («Fischgratparkett in Eiche, geölt»). Der Nachweis erscheint im Impressum.
- **«Materialbeispiel» ein- oder ausschalten.** Eingeschaltet steht unter dem Bild «Materialbeispiel, kein Projekt von Casatex».
  Nur bei eigenen Fotos von eigenen Arbeiten ausschalten.
- **Schweizer Schreibweise:** «ss» statt «ß», keine Gedankenstriche.
- **Einstieg der Startseite:** Titel höchstens 34 Zeichen, Text höchstens 20 Wörter.

### Häufige Aufgaben

**Öffnungszeiten eintragen.** Unternehmen und Kontakt → Öffnungszeiten → «Eintrag hinzufügen», zum Beispiel Tage «Montag bis Freitag»,
Zeiten «08.00 bis 12.00 und 13.30 bis 17.00 Uhr». Solange die Liste leer ist, zeigt die Website keine Öffnungszeiten.

**Telefon oder E-Mail ändern.** Unternehmen und Kontakt. Telefon im Format `+41 44 432 61 61`. Die E-Mail-Adresse ist zugleich der
Empfänger des Anfrageformulars.

**Neue Referenz.** Referenzen → «Neu». Titel, Ort, Jahr, Text, eigenes Bild, bei «Quelle» die Freigabe der Bauherrschaft. Beim Bild
«Materialbeispiel» ausschalten.

**Neues Material.** Materialien → «Neu». Gruppe wählen, Kurztext, Abschnitte. Allgemein formulieren, ohne «wir». Danach bei der
passenden Leistung unter «Materialien dieses Bereichs» hinzufügen.

**Neue Leistung.** Leistungen → «Neu». Sie bekommt nach dem nächsten Build eine eigene Seite und erscheint in der Übersicht.

**Boden im Einstieg tauschen.** Startseite → Einstieg → Böden zur Auswahl. Die Textur muss quadratisch sein und sich nahtlos wiederholen
lassen (von oben fotografiert, gleichmässiges Licht). Der erste Boden der Liste wird beim Laden gezeigt.

### Was nicht geht (bewusst)

- Das Anfrageformular **versendet nichts**. Es öffnet das E-Mail-Programm der Besucherin oder des Besuchers. Die Texte dazu bitte
  nicht in «Senden» oder «Vielen Dank, wir haben Ihre Nachricht erhalten» ändern: Das wäre falsch.
- Unter «Datenschutz-Einstellungen» keine Kategorie eintragen, solange kein neuer Dienst eingebaut wurde. Sonst erscheint ein Banner,
  das nichts steuert.
- Im Impressum den Zwischentitel «Bildnachweis» nicht umbenennen: Darunter fügt die Website die Liste der Bildnachweise ein.
- Adressen bestehender Seiten (Feld «Adresse») nach der Veröffentlichung nicht mehr ändern.

## Teil B: In den Dateien (ohne Sanity)

| Datei | Inhalt |
| --- | --- |
| `data/einstellungen.json` | Firma, Adresse, Telefon, E-Mail, Routenlink, Öffnungszeiten, Logo |
| `data/texte.json` | Navigation, Kopfzeile, Fusszeile, kleine Texte, Formular, Datenschutz-Einstellungen |
| `data/startseite.json` | Einstieg, Böden zur Auswahl, Abschnitte der Startseite |
| `data/leistungen.json` | die drei Bereiche mit Aussagen (samt Quellen) und «Vor der Wahl klären» |
| `data/materialien.json` | Materialkunde |
| `data/seiten/*.json` | Leistungsübersicht, Über Casatex, Kontakt, Impressum, Datenschutz |
| `data/referenzen.json`, `data/partner.json` | leer; mit dem ersten Eintrag erscheint der Abschnitt auf der Startseite |
| `scripts/bilder-liste.json` | Bilder: Datei, Zuschnitt, Alternativtext, Bildnachweis |

Ablauf:

```bash
# Text ändern, dann
npm run pruefen               # Inhalte, Lint, Typen
npm run build && npm run export:pruefen
git add -A && git commit -m "Öffnungszeiten ergänzt" && git push
```

Der Push veröffentlicht die Demo über GitHub Actions (etwa drei Minuten).

In Rechtstexten gilt eine kleine Auszeichnung: `**fett**` und `[Linktext](Ziel)`. Ein Zwischentitel ist `{ "titel": "…", "anker": "…" }`,
eine Aufzählung `{ "liste": ["…", "…"] }`.

**Neues Bild:** Original nach `assets/originale/` legen, in `assets/originale/HERKUNFT.md` Quelle und Lizenz notieren, in
`scripts/bilder-liste.json` eintragen (mit `alt` und `nachweis`), `npm run bilder` ausführen, die Kennung im Inhalt verwenden.

**Neue Unternehmensaussage:** immer mit `herkunft` (Quelle, Adresse, Abrufdatum, Art) und `freigabe`. Verzeichniseinträge sind keine
Quelle. `npm run inhalt:pruefen` weist Texte mit Preisen, Garantien, Jahreszahlen, Zertifikaten, Ausstellung oder Fristen zurück.
Der Prüfer kennt keine Ausnahmen: Bestätigt das Unternehmen eine solche Angabe, wird die Sperrliste in `scripts/inhalt-pruefen.mts`
gezielt für diese eine Angabe angepasst, mit einem Kommentar, der auf die Bestätigung verweist.
