// Funktionsprüfungen im echten Browser (puppeteer-core). Vorschau-Server nötig: npm run vorschau:pages
// Geprüft wird, was ein Mensch bedienen würde: Erstbesuch ohne Dienste Dritter, Tastatur, Materialregister (Dialog), mobiles Menü,
// Materialwahl im Einstieg, Akkordeon mit Sprungmarken, mailto-Formular (ohne je etwas zu versenden), Links, Fehlerseite,
// Adressen (Direktaufruf, Neuladen), reduzierte Bewegung.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { BASE, alleSeiten, browserStarten, externeAnfragen, warten } from "./chrome.mjs";
const ergebnisse = [];
const ok = (name, bedingung, detail = "") => { ergebnisse.push({ name, ok: !!bedingung, detail }); console.log(`${bedingung ? "✓" : "✗"} ${name}${detail ? " · " + detail : ""}`); };
const browser = await browserStarten();
const einstellungen = JSON.parse(readFileSync("data/einstellungen.json", "utf8"));
const materialien = JSON.parse(readFileSync("data/materialien.json", "utf8"));
const EMAIL = einstellungen.email;
async function frisch({ breite = 1440, hoehe = 900, reduziert = false } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: breite, height: hoehe });
  if (reduziert) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  return { ctx, page, extern: externeAnfragen(page) };
}

// 1) Erstbesuch: nichts von Dritten, kein Banner, kein Speicher, Demo-Kennzeichnung
{
  const { ctx, page, extern } = await frisch();
  await page.goto(BASE + "/", { waitUntil: "networkidle0" }); await warten(400);
  ok("Erstbesuch: keine Anfragen an fremde Hosts", extern.length === 0, extern.join(","));
  ok("Erstbesuch: kein Einwilligungsbanner (keine einwilligungspflichtigen Dienste)", (await page.$('[role="region"][aria-label="Datenschutz-Einstellungen"]')) === null);
  ok("Erstbesuch: kein Speicher, keine Cookies", (await page.evaluate(() => Object.keys(localStorage).length + Object.keys(sessionStorage).length)) === 0 && (await page.evaluate(() => document.cookie)) === "");
  ok("Demo: Entwurfshinweis sichtbar", await page.evaluate(() => document.body.textContent.includes("nicht die offizielle Website")));
  ok("Demo: noindex auf der Startseite", await page.evaluate(() => document.querySelector("meta[name=robots]")?.content.includes("noindex")));
  ok("Demo: kein JSON-LD (erst mit INDEXIERUNG=1 auf der Kundendomain)", (await page.$('script[type="application/ld+json"]')) === null);
  const robots = await (await page.goto(BASE + "/robots.txt")).text();
  ok("Demo: robots.txt sperrt nicht (noindex bleibt lesbar), nennt keine Sitemap", !/Disallow:\s*\/\s*$/m.test(robots) && !/Sitemap:/.test(robots), robots.replaceAll("\n", " "));
  ok("Demo: keine sitemap.xml", (await page.goto(BASE + "/sitemap.xml")).status() === 404);
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  // Footer-Link «Datenschutz-Einstellungen»: Hinweis ohne Schalter
  await page.evaluate(() => [...document.querySelectorAll("footer button")].find((b) => b.textContent.includes("Datenschutz-Einstellungen")).click()); await warten(250);
  ok("Footer: «Datenschutz-Einstellungen» öffnet einen Hinweis ohne Schalter (nichts einzustellen)", await page.evaluate(() => { const d = document.querySelector("dialog[open]"); return !!d && d.querySelectorAll('input[type="checkbox"]').length === 0 && d.textContent.includes("keine Cookies"); }));
  await page.keyboard.press("Escape"); await warten(200);
  ok("Footer: Escape schliesst den Hinweis", !(await page.$("dialog[open]")));
  await ctx.close();
}

// 2) Tastatur: Sprunglink, Fokusring, aktuelle Seite
{
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await page.keyboard.press("Tab");
  ok("Tastatur: erster Tab = «Zum Inhalt springen»", await page.evaluate(() => document.activeElement?.textContent?.trim() === "Zum Inhalt springen"));
  const sichtbarerSprunglink = await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return r.width > 40 && r.height > 20 && r.top >= 0; });
  ok("Tastatur: Sprunglink wird beim Fokus sichtbar", sichtbarerSprunglink);
  await page.keyboard.press("Enter"); await warten(150);
  ok("Tastatur: Sprunglink setzt den Fokus auf <main>", await page.evaluate(() => location.hash === "#inhalt" && document.activeElement?.id === "inhalt"));
  await page.keyboard.press("Tab");
  const fokus = await page.evaluate(() => { const st = getComputedStyle(document.activeElement); return { stil: st.outlineStyle, breite: parseFloat(st.outlineWidth), tag: document.activeElement.tagName }; });
  ok("Tastatur: Fokusring sichtbar (Outline ≥ 2px)", fokus.stil !== "none" && fokus.breite >= 2, JSON.stringify(fokus));
  const reihenfolge = [];
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); reihenfolge.push(await page.evaluate(() => (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().replace(/\s+/g, " ").slice(0, 28))); }
  ok("Tastatur: Fokusreihenfolge folgt dem Aufbau (Sprunglink, Logo, Navigation, Telefon, Register, Aufruf, Inhalt)", /^Zum Inhalt/.test(reihenfolge[0]) && /zur Start/.test(reihenfolge[1]) && reihenfolge[2].startsWith("Leistungen") && reihenfolge[3].startsWith("Über") && /Anrufen/.test(reihenfolge[4]) && /Materialregister|Menü/.test(reihenfolge[5]) && reihenfolge[6] === "Projekt besprechen", reihenfolge.join(" → "));
  await page.goto(BASE + "/ueber-casatex/", { waitUntil: "networkidle0" });
  ok("Navigation: aria-current auf «Über Casatex»", await page.evaluate(() => document.querySelector('header a[aria-current="page"]')?.textContent?.trim() === "Über Casatex"));
  await ctx.close();
}

// 3) Materialregister am Bildschirm: Dialog, Fokus, Escape, Sprung in die Materialkunde
{
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  const knopf = await page.$('header button[aria-haspopup="dialog"]');
  ok("Register: Knopf mit aria-expanded=false", (await page.evaluate((b) => b.getAttribute("aria-expanded"), knopf)) === "false");
  await knopf.focus(); await page.keyboard.press("Enter"); await warten(450);
  ok("Register: Enter öffnet den Dialog, Fokus liegt im Dialog, aria-expanded=true", await page.evaluate(() => { const d = document.querySelector("dialog.register[open]"); return !!d && d.contains(document.activeElement) && document.querySelector('header button[aria-haspopup="dialog"]').getAttribute("aria-expanded") === "true"; }));
  ok("Register: alle Materialien als Handmuster verlinkt", (await page.$$("dialog.register[open] a.handmuster")).length === materialien.length, `${(await page.$$("dialog.register[open] a.handmuster")).length}/${materialien.length}`);
  ok("Register: Dialog hat einen Namen (aria-labelledby)", await page.evaluate(() => { const d = document.querySelector("dialog.register"); return document.getElementById(d.getAttribute("aria-labelledby"))?.textContent.trim() === "Materialregister"; }));
  // Fokus bleibt im Dialog: 40-mal Tab, nie ausserhalb
  let draussen = 0;
  for (let i = 0; i < 40; i++) { await page.keyboard.press("Tab"); if (!(await page.evaluate(() => document.querySelector("dialog.register[open]").contains(document.activeElement) || document.activeElement === document.body))) draussen++; }
  ok("Register: Fokus bleibt im Dialog (40-mal Tab)", draussen === 0, `${draussen} ausserhalb`);
  await page.keyboard.press("Escape"); await warten(300);
  ok("Register: Escape schliesst, Fokus zurück auf dem Knopf", await page.evaluate(() => !document.querySelector("dialog[open]") && document.activeElement?.getAttribute("aria-haspopup") === "dialog" && document.activeElement.getAttribute("aria-expanded") === "false"));
  await knopf.click(); await warten(450);
  await page.evaluate(() => [...document.querySelectorAll("dialog.register[open] a.handmuster")].find((a) => a.getAttribute("href").endsWith("#material-kork")).click());
  await page.waitForFunction(() => location.pathname.endsWith("/leistungen/") && location.hash === "#material-kork", { timeout: 8000 }).catch(() => {}); await warten(600);
  ok("Register: Handmuster «Kork» führt zur Materialkunde und klappt den Eintrag auf", await page.evaluate(() => location.hash === "#material-kork" && document.getElementById("material-kork")?.open === true && !document.querySelector("dialog[open]")), page.url().replace(BASE, ""));
  ok("Sprungziel wird nicht von der fixierten Kopfzeile verdeckt", await page.evaluate(() => document.getElementById("material-kork").getBoundingClientRect().top >= document.querySelector("header").getBoundingClientRect().bottom - 1));
  await ctx.close();
}

// 4) Handy (360 px): Menü als ganzflächiger Dialog, Touch-Ziele, Telefon
{
  const { ctx, page } = await frisch({ breite: 360, hoehe: 740 });
  await page.goto(BASE + "/leistungen/parkett/", { waitUntil: "networkidle0" });
  const knopf = await page.$('header button[aria-haspopup="dialog"]');
  const box = await knopf.boundingBox();
  ok("Mobil: Menüknopf ≥ 44 × 44 px, beschriftet «Menü»", box.height >= 44 && box.width >= 44 && (await page.evaluate((b) => [...b.querySelectorAll("span")].find((s) => getComputedStyle(s).display !== "none")?.textContent, knopf)) === "Menü", `${Math.round(box.width)}×${Math.round(box.height)}`);
  ok("Mobil: Aufruf-Knopf in der Kopfzeile ausgeblendet (kein Gedränge), Telefon bleibt", await page.evaluate(() => { const a = [...document.querySelectorAll("header > div > a.knopf")]; return a.length === 1 && a.every((x) => getComputedStyle(x).display === "none") && !!document.querySelector('header a[href^="tel:"]'); }));
  await knopf.click(); await warten(450);
  ok("Mobil: Menü füllt den Bildschirm, Seitenlinks, Telefon und E-Mail vorhanden", await page.evaluate(() => { const d = document.querySelector("dialog.register[open]"); const r = d.getBoundingClientRect(); return r.width >= innerWidth - 1 && r.height >= innerHeight - 1 && d.querySelectorAll("nav a").length === 3 && !!d.querySelector('a[href^="tel:"]') && !!d.querySelector('a[href^="mailto:"]'); }));
  const kleine = await page.evaluate(() => [...document.querySelectorAll("dialog.register[open] nav a, dialog.register[open] button, dialog.register[open] a[href^='tel:'], dialog.register[open] a[href^='mailto:'], dialog.register[open] a.knopf")].filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 44).length);
  ok("Mobil: alle Menüziele ≥ 44 px hoch", kleine === 0, `${kleine} zu klein`);
  ok("Mobil: aktuelle Seite im Menü hervorgehoben (Unterseite von «Leistungen»)", await page.evaluate(() => /text-blau-tief/.test(document.querySelector('dialog.register[open] nav a[href$="/leistungen/"]').className)));
  await page.evaluate(() => document.querySelector('dialog.register[open] nav a[href$="/kontakt/"]').click()); await warten(900);
  ok("Mobil: Menülink navigiert und schliesst das Menü", page.url().endsWith("/kontakt/") && !(await page.$("dialog[open]")), page.url().replace(BASE, ""));
  ok("Mobil: kein horizontales Scrollen auf der Kontaktseite", await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  await ctx.close();
}

// 5) Materialwahl im Einstieg
{
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  ok("Einstieg: Optionsgruppe mit Legende und fünf Radios, eines gewählt", await page.evaluate(() => { const f = document.querySelector(".held fieldset"); return !!f.querySelector("legend") && f.querySelectorAll('input[type="radio"]').length === 5 && f.querySelectorAll('input[type="radio"]:checked').length === 1; }));
  ok("Einstieg: Bodenfläche ist für Screenreader verborgen, nur eine Textur geladen", await page.evaluate(() => document.querySelector(".held .raum").getAttribute("aria-hidden") === "true" && document.querySelectorAll(".held .boden").length === 1));
  ok("Einstieg: Titel höchstens zwei Zeilen, Knöpfe ohne Scrollen sichtbar (1440 × 900)", await page.evaluate(() => { const h = document.querySelector("h1"); const zeilen = Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)); return zeilen <= 2 && [...document.querySelectorAll(".held a.knopf")].every((a) => a.getBoundingClientRect().bottom < innerHeight); }));
  ok("Einstieg: Boden im ersten Bildschirm sichtbar (mindestens 200 px)", await page.evaluate(() => innerHeight - document.querySelector(".held .raum").getBoundingClientRect().top >= 200));
  await page.focus('.held input[type="radio"]:checked');
  await page.keyboard.press("ArrowRight"); await warten(900);
  const nach = await page.evaluate(() => ({ gewaehlt: document.querySelector('.held input[type="radio"]:checked').value, aktiv: getComputedStyle(document.querySelector('.held .boden[data-aktiv="true"]')).backgroundImage, text: document.querySelector(".held fieldset p").textContent, ebenen: document.querySelectorAll(".held .boden").length }));
  ok("Einstieg: Pfeiltaste wählt «Dielen», Textur und Beschreibung wechseln", nach.gewaehlt === "dielen" && /boden-dielen/.test(nach.aktiv) && nach.text.includes("Holzdielen") && nach.text.includes("kein Projekt von Casatex"), `${nach.gewaehlt} · ${nach.text.slice(0, 60)}`);
  await page.evaluate(() => document.querySelector('.held label[for$="-teppich"]').click()); await warten(900);
  ok("Einstieg: Klick auf «Teppich» lädt die Textur erst jetzt und zeigt sie", await page.evaluate(() => /boden-teppich/.test(getComputedStyle(document.querySelector('.held .boden[data-aktiv="true"]')).backgroundImage) && document.querySelectorAll('.held .boden[data-aktiv="true"]').length === 1));
  await ctx.close();
  const m = await frisch({ breite: 360, hoehe: 740 });
  await m.page.goto(BASE + "/", { waitUntil: "networkidle0" });
  ok("Einstieg mobil: Boden liegt direkt unter dem Text und ist im ersten Bildschirm sichtbar, Materialwahl darunter", await m.page.evaluate(() => { const r = document.querySelector(".held .raum").getBoundingClientRect(); const f = document.querySelector(".held fieldset").getBoundingClientRect(); return r.top < innerHeight - 80 && f.top >= r.bottom - 1; }));
  ok("Einstieg mobil: Beschriftungen der Materialwahl ≥ 44 px hoch", await m.page.evaluate(() => [...document.querySelectorAll(".held .bodenwahl label")].every((l) => l.getBoundingClientRect().height >= 44)));
  await m.ctx.close();
}

// 6) Materialkunde: Akkordeon per Tastatur, Sprungmarke beim Direktaufruf
{
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/leistungen/", { waitUntil: "networkidle0" });
  ok("Materialkunde: ein Eintrag je Material, alle zu", await page.evaluate((n) => document.querySelectorAll(".kunde details").length === n && document.querySelectorAll(".kunde details[open]").length === 0, materialien.length));
  await page.focus("#material-parkett summary"); await page.keyboard.press("Enter"); await warten(250);
  ok("Materialkunde: Enter klappt «Parkett» auf, Inhalt und vier Verlegemuster sichtbar", await page.evaluate(() => { const d = document.getElementById("material-parkett"); return d.open && d.querySelectorAll("svg.verlegemuster").length === 4 && d.querySelector(".inhalt").getBoundingClientRect().height > 200; }));
  ok("Materialkunde: Inhalte als allgemeine Materialinformation bezeichnet", await page.evaluate(() => document.getElementById("material-parkett").textContent.includes("Allgemeine Materialinformation")));
  ok("Materialkunde: Zeichnungen haben eine Textalternative", await page.evaluate(() => [...document.querySelectorAll("#material-parkett svg.verlegemuster")].every((s) => s.getAttribute("role") === "img" && s.getAttribute("aria-label")?.startsWith("Zeichnung des Verlegemusters"))));
  await page.keyboard.press("Enter"); await warten(200);
  ok("Materialkunde: Enter klappt wieder zu", await page.evaluate(() => !document.getElementById("material-parkett").open));
  await page.goto(BASE + "/leistungen/#material-linoleum", { waitUntil: "networkidle0" }); await warten(400);
  ok("Materialkunde: Direktaufruf mit Sprungmarke klappt «Linoleum» auf", await page.evaluate(() => document.getElementById("material-linoleum").open));
  await ctx.close();
}

// 7) Anfrageformular: baut einen mailto:-Link, versendet nichts
{
  const { ctx, page } = await frisch();
  await ctx.overridePermissions(new URL(BASE).origin, ["clipboard-read", "clipboard-write", "clipboard-sanitized-write"]);
  const cdp = await page.createCDPSession();
  await cdp.send("Page.enable");
  // Die Zwischenablage verlangt ein fokussiertes Dokument; im kopflosen Browser wird der Fokus emuliert.
  await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  const navigationen = [];
  cdp.on("Page.frameRequestedNavigation", (e) => navigationen.push(e.url));
  cdp.on("Page.frameScheduledNavigation", (e) => navigationen.push(e.url));
  const gesendet = [];
  // Nur schreibende Anfragen zählen: Der Router von Next fragt Seiten vorab mit GET/HEAD an, das ist kein Versand.
  page.on("request", (r) => { if (!["GET", "HEAD", "OPTIONS"].includes(r.method())) gesendet.push(`${r.method()} ${r.url()}`); });
  await page.goto(BASE + "/kontakt/", { waitUntil: "networkidle0" });
  const form = await page.$("main form");
  ok("Formular: ohne action (kein Versand durch die Website), noscript-Link vorhanden", !!form && (await page.evaluate((f) => !f.hasAttribute("action") && !!f.querySelector("noscript"), form)));
  const felder = await page.evaluate(() => [...document.querySelectorAll("main form input, main form select, main form textarea")].map((e) => `${e.tagName.toLowerCase()}:${e.name}:${e.type || ""}`));
  ok("Formular: Name, E-Mail, Telefon, Anliegen, Nachricht; kein Upload", felder.join(" ") === "input:Name:text input:E-Mail:email input:Telefon:tel select:Anliegen:select-one textarea:Nachricht:textarea", felder.join(" "));
  ok("Formular: sichtbare Beschriftung für jedes Feld", await page.evaluate(() => [...document.querySelectorAll("main form input, main form select, main form textarea")].every((e) => document.querySelector(`label[for="${e.id}"]`)?.offsetHeight > 0)));
  ok("Formular: Knopf heisst «E-Mail vorbereiten», Hinweis erklärt das E-Mail-Programm", await page.evaluate(() => document.querySelector('main form button[type="submit"]').textContent.trim() === "E-Mail vorbereiten" && document.querySelector("main form").textContent.includes("E-Mail-Programm")));
  const absenden = () => page.evaluate(() => document.querySelector('main form button[type="submit"]').click());
  await absenden(); await warten(300);
  ok("Formular: leer absenden → drei Fehlermeldungen am Feld, Fokus im ersten Fehlerfeld, kein mailto", (await page.$$('form [role="alert"]')).length === 3 && (await page.evaluate(() => document.activeElement?.name === "Name" && document.activeElement.getAttribute("aria-invalid") === "true" && !!document.getElementById(document.activeElement.getAttribute("aria-describedby")))) && !navigationen.some((u) => u.startsWith("mailto:")));
  await page.type('main form input[name="Name"]', "Testperson Fiktiv & Söhne");
  await page.type('main form input[name="E-Mail"]', "keine-adresse");
  await page.type("main form textarea", "Fiktive Testanfrage der QA: 20 m² Parkett?\nZweite Zeile mit #Raute & Kaufmanns-Und.");
  await absenden(); await warten(300);
  ok("Formular: ungültige E-Mail → genau eine Fehlermeldung, kein mailto", (await page.$$('form [role="alert"]')).length === 1 && !navigationen.some((u) => u.startsWith("mailto:")));
  await page.evaluate(() => { const i = document.querySelector('input[name="E-Mail"]'); const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setzer.call(i, ""); i.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.type('main form input[name="E-Mail"]', "test@example.invalid");
  await page.select('main form select[name="Anliegen"]', "teppiche");
  await absenden(); await warten(800);
  const mailto = navigationen.find((u) => u.startsWith("mailto:")) ?? "";
  const dekodiert = (() => { try { return decodeURIComponent(mailto); } catch { return ""; } })();
  ok(`Formular: gültig absenden erzeugt mailto an ${EMAIL} mit allen Angaben`, mailto.startsWith(`mailto:${EMAIL}?subject=`) && dekodiert.includes("Testperson Fiktiv & Söhne") && dekodiert.includes("Anliegen: Teppiche") && dekodiert.includes("20 m² Parkett?\nZweite Zeile mit #Raute & Kaufmanns-Und."), dekodiert.slice(0, 110).replaceAll("\n", " ⏎ "));
  ok("Formular: Sonderzeichen sind kodiert (kein rohes «&», «#», Leerzeichen oder Zeilenumbruch im Link)", !/[\s#]/.test(mailto) && (mailto.match(/&/g) ?? []).length === 1 && mailto.includes("%0A") && mailto.includes("%26") && mailto.includes("%23"));
  ok("Formular: Hinweis statt Versandbestätigung", await page.evaluate(() => { const s = document.querySelector('main form [role="status"]').textContent; return s.includes("E-Mail-Programm") && !/wurde gesendet|versandt|erhalten|Vielen Dank/i.test(s); }));
  // In manchen kopflosen Umgebungen (CI ohne Anzeige) gibt es keine Zwischenablage. Dann lassen sich die beiden Prüfungen dazu
  // nicht ausführen; das wird ausdrücklich als «nicht prüfbar» protokolliert statt als bestanden ausgegeben.
  const zwischenablage = await page.evaluate(async () => { try { await navigator.clipboard.writeText("probe"); return (await navigator.clipboard.readText()) === "probe"; } catch { return false; } });
  // Echter Klick (mit Nutzeraktivierung), wie ihn ein Mensch auslöst: Ohne sie verweigert der Browser die Zwischenablage.
  const kopierKnopf = await page.evaluateHandle(() => [...document.querySelectorAll("main form button")].find((x) => x.textContent.includes("Nachricht kopieren")) ?? null);
  if (kopierKnopf.asElement()) { await kopierKnopf.asElement().click(); await warten(350); }
  if (!zwischenablage) ok("Formular: Zwischenablage in dieser Umgebung NICHT PRÜFBAR (Knopf «Nachricht kopieren» ist vorhanden)", !!kopierKnopf.asElement(), "kein Zugriff auf die Zwischenablage");
  else ok("Formular: «Nachricht kopieren» erscheint und legt den Text in die Zwischenablage", !!kopierKnopf.asElement() && (await page.evaluate(async () => { const t = await navigator.clipboard.readText().catch(() => ""); return t.includes("Testperson Fiktiv") && t.includes("Betreff: Anfrage über die Website: Teppiche") && document.querySelector('main form [role="status"]').textContent.includes("Zwischenablage"); })));
  ok("Formular: nichts gespeichert, Adresse unverändert, keine Anfrage an einen Server", (await page.evaluate(() => Object.keys(localStorage).length + Object.keys(sessionStorage).length)) === 0 && page.url() === BASE + "/kontakt/" && gesendet.length === 0, gesendet.join(","));
  // Sehr lange Nachricht: Kurzfassung im Link, ganzer Text in der Zwischenablage
  navigationen.length = 0;
  await page.evaluate(() => { const t = document.querySelector("main form textarea"); const setzer = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set; setzer.call(t, "Überlange Äusserung öffnet Türen. ".repeat(36).slice(0, 1200)); t.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.click('main form button[type="submit"]'); await warten(900);
  const lang = navigationen.find((u) => u.startsWith("mailto:")) ?? "";
  if (!zwischenablage) ok("Formular: sehr lange Nachricht → Link bleibt kurz (< 1800 Zeichen); Zwischenablage NICHT PRÜFBAR", lang.length > 0 && lang.length < 1800, `${lang.length} Zeichen`);
  else ok("Formular: sehr lange Nachricht → Link bleibt kurz (< 1800 Zeichen), ganzer Text liegt in der Zwischenablage", lang.length > 0 && lang.length < 1800 && (await page.evaluate(async () => (await navigator.clipboard.readText()).includes("Überlange Äusserung öffnet Türen."))) && (await page.evaluate(() => document.querySelector('main form [role="status"]').textContent.includes("Zwischenablage"))), `${lang.length} Zeichen`);
  ok("Formular: Eingabelängen begrenzt (Name 100, E-Mail 120, Telefon 40, Nachricht 1200)", await page.evaluate(() => ["Name:100", "E-Mail:120", "Telefon:40", "Nachricht:1200"].every((p) => { const [n, l] = p.split(":"); return document.querySelector(`main form [name="${n}"]`).maxLength === Number(l); })));
  await ctx.close();
}

// 8) Links: Telefon, E-Mail, Karte nur als externer Link
{
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/kontakt/", { waitUntil: "networkidle0" });
  const tels = await page.evaluate(() => [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute("href")));
  ok("Telefon-Links im Format tel:+41…", tels.length >= 3 && tels.every((t) => t === "tel:+41444326161"), [...new Set(tels)].join(","));
  ok(`E-Mail-Link auf ${EMAIL}`, await page.evaluate((m) => !!document.querySelector(`main a[href="mailto:${m}"]`), EMAIL));
  ok("Karte: nur externer Link in neuem Fenster mit rel=noopener noreferrer, keine Einbettung", (await page.$("iframe")) === null && (await page.evaluate(() => { const a = document.querySelector('main a[href^="https://www.google.com/maps"]'); return !!a && a.target === "_blank" && a.rel.includes("noopener") && a.rel.includes("noreferrer") && a.textContent.includes("neuen Fenster"); })));
  ok("Kontakt: keine Öffnungszeiten angezeigt (nicht bestätigt)", await page.evaluate(() => !document.querySelector("main").textContent.includes("Öffnungszeiten")));
  await page.goto(BASE + "/ueber-casatex/", { waitUntil: "networkidle0" });
  ok("Über Casatex: jede Aussage nennt ihre Quelle mit Abrufdatum", await page.evaluate(() => { const zeilen = [...document.querySelectorAll("main ul.aussagen > li")]; return zeilen.length === 3 && zeilen.every((z) => /Quellen?: .+abgerufen am \d\d\.\d\d\.\d{4}/.test(z.textContent)); }));
  ok("Über Casatex: Handelsregisterzweck als Zitat mit Quelle", await page.evaluate(() => { const b = document.querySelector("main blockquote"); return !!b && b.textContent.includes("Bodenbeläge und Vorhänge") && b.getAttribute("cite")?.includes("zefix.ch"); }));
  await page.goto(BASE + "/impressum/", { waitUntil: "networkidle0" });
  ok("Impressum: trennt Betreiber der Demo und dargestelltes Unternehmen, nennt UID, listet Bildnachweise", await page.evaluate(() => { const t = document.querySelector("main").textContent; return t.includes("Betreiber dieser Demo-Website") && t.includes("Dargestelltes Unternehmen") && t.includes("CHE-112.962.998") && !!document.getElementById("bildnachweis") && [...document.querySelectorAll("main li")].filter((li) => /CC0 1\.0|Unsplash License|Casatex Zürich AG/.test(li.textContent)).length >= 10 && t.includes("CC0 1.0") && t.includes("Unsplash License"); }));
  await ctx.close();
}

// 9) Adressen: Direktaufruf, Neuladen, Canonical, Dateien unter dem Unterpfad, Fehlerseite
{
  const { ctx, page } = await frisch();
  const fehlgeschlagen = [];
  page.on("response", (r) => { if (r.status() >= 400) fehlgeschlagen.push(`${r.status()} ${r.url().replace(BASE, "")}`); });
  let alleOk = true; const details = [];
  for (const s of alleSeiten()) {
    const a = await page.goto(BASE + s, { waitUntil: "networkidle0" });
    const b = await page.reload({ waitUntil: "networkidle0" });
    const canonical = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.href ?? "");
    const gut = a.status() === 200 && b.status() === 200 && canonical.endsWith(`/casatex-zuerich-demo${s}`) && canonical.startsWith("https://");
    if (!gut) { alleOk = false; details.push(`${s}: ${a.status()}/${b.status()} ${canonical}`); }
  }
  ok(`Adressen: ${alleSeiten().length} Seiten per Direktaufruf und nach Neuladen erreichbar, Canonical zeigt auf die Demo`, alleOk, details.join(" | "));
  ok("Adressen: keine fehlgeschlagene Anfrage (Bilder, Schriften, Skripte unter dem Unterpfad)", fehlgeschlagen.length === 0, fehlgeschlagen.slice(0, 4).join(", "));
  const ohneSchraegstrich = await page.goto(BASE + "/kontakt", { waitUntil: "networkidle0" });
  ok("Adressen: «/kontakt» ohne Schrägstrich am Ende funktioniert", ohneSchraegstrich.status() === 200 && (await page.evaluate(() => !!document.querySelector("main h1"))));
  const r = await page.goto(BASE + "/gibt-es-nicht/", { waitUntil: "networkidle0" });
  ok("Fehlerseite: unbekannte Adresse liefert 404 mit gestalteter Seite, Kopfzeile und noindex", r.status() === 404 && (await page.evaluate(() => document.querySelector("main h1")?.textContent.trim() === "Diese Seite gibt es nicht" && !!document.querySelector("header") && document.querySelector("meta[name=robots]")?.content.includes("noindex"))));
  ok("Fehlerseite: Link zur Startseite führt unter den Unterpfad", await page.evaluate(() => document.querySelector("main a.knopf").getAttribute("href") === "/casatex-zuerich-demo/"));
  const direkt = await page.goto(BASE + "/404.html", { waitUntil: "networkidle0" });
  ok("Fehlerseite: 404.html direkt aufrufbar", direkt.status() === 200 && (await page.evaluate(() => !!document.querySelector("main h1"))));
  await ctx.close();
}

// 10) Bewegung
{
  const { ctx, page } = await frisch({ reduziert: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  ok("Reduzierte Bewegung: keine Animationen und Übergänge, Inhalt sichtbar", await page.evaluate(() => { const a = document.querySelector(".auftauchen"); const h = document.querySelector(".einstieg > *"); const b = document.querySelector(".boden"); return getComputedStyle(a).animationName === "none" && getComputedStyle(h).animationName === "none" && getComputedStyle(a).opacity === "1" && parseFloat(getComputedStyle(b).transitionDuration) === 0 && getComputedStyle(document.documentElement).scrollBehavior === "auto"; }));
  await ctx.close();
  const n = await frisch();
  await n.page.goto(BASE + "/", { waitUntil: "networkidle0" });
  ok("Normale Bewegung: Einblenden beim Scrollen aktiv, Materialwechsel mit Übergang", await n.page.evaluate(() => /view/.test(getComputedStyle(document.querySelector(".auftauchen")).animationTimeline) && parseFloat(getComputedStyle(document.querySelector(".boden")).transitionDuration) > 0));
  ok("Ohne Scrollführung: die Seite lässt sich frei scrollen (kein scroll-snap, kein fixiertes Scrollen)", await n.page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType === "none" && getComputedStyle(document.body).overflowY !== "hidden"));
  await n.ctx.close();
}

await browser.close();
mkdirSync("pruefung", { recursive: true });
writeFileSync("pruefung/funktionen.json", JSON.stringify(ergebnisse, null, 1));
console.log(`\n${ergebnisse.filter((e) => e.ok).length}/${ergebnisse.length} bestanden → pruefung/funktionen.json`);
process.exitCode = ergebnisse.every((e) => e.ok) ? 0 : 1;
