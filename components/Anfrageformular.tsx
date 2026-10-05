"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { CopyIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import type { Texte } from "@/lib/content/modell";
import { SmartLink } from "./SmartLink";

/** Ab dieser Länge kürzen manche E-Mail-Programme oder Betriebssysteme einen mailto:-Link. */
const MAILTO_GRENZE = 1800;
export const GRENZEN = { name: 100, email: 120, telefon: 40, nachricht: 1200 } as const;

/** Baut den mailto:-Link. Alles ist mit encodeURIComponent kodiert (auch Zeilenumbrüche als %0A und «&», «?», «#»). */
export function mailtoBauen(empfaenger: string, betreff: string, text: string): string {
  return `mailto:${empfaenger}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(text)}`;
}

/**
 * «E-Mail vorbereiten»: baut aus Name, E-Mail, optionaler Telefonnummer, Anliegen und Nachricht einen mailto:-Link und öffnet
 * das E-Mail-Programm. Die Website sendet, speichert und protokolliert nichts; es gibt keine Versandbestätigung, nur den Hinweis,
 * dass sich das E-Mail-Programm öffnen sollte. Öffnet sich nichts (kein E-Mail-Programm eingerichtet), lässt sich die Nachricht
 * kopieren. Sehr lange Nachrichten kommen als Kurzfassung in den Link, der ganze Text liegt dann in der Zwischenablage. Ist die
 * Zwischenablage gesperrt, öffnet sich KEIN gekürzter Entwurf; stattdessen steht die ganze Nachricht zum Kopieren von Hand da.
 *
 * Ohne JavaScript bleibt der Knopf gesperrt: Ein gewöhnliches Absenden würde die Eingaben sonst als Parameter an die Adresse
 * hängen und damit an den Server schicken. Stattdessen nennt <noscript> die E-Mail-Adresse.
 */
export function Anfrageformular({ texte: f, empfaenger, startAnliegen }: { texte: Texte["formular"]; empfaenger: string; startAnliegen?: string }) {
  const id = useId();
  // Mit JavaScript: eigene, beschriftete Fehlermeldungen (noValidate). Ohne JavaScript sendet das Formular nichts.
  const geladen = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [anliegen, setAnliegen] = useState(f.anliegenOptionen.some((o) => o.wert === startAnliegen) ? (startAnliegen as string) : f.anliegenOptionen[0].wert);
  const [nachricht, setNachricht] = useState("");
  const [fehler, setFehler] = useState<{ name?: string; email?: string; nachricht?: string }>({});
  const [status, setStatus] = useState("");
  const [vorbereitet, setVorbereitet] = useState(false);
  const [volltext, setVolltext] = useState(false);

  const anliegenTitel = f.anliegenOptionen.find((o) => o.wert === anliegen)?.titel ?? anliegen;
  const emailGueltig = (w: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(w.trim());
  const kopf = [`Name: ${name.trim()}`, `E-Mail: ${email.trim()}`, telefon.trim() ? `Telefon: ${telefon.trim()}` : null, `Anliegen: ${anliegenTitel}`].filter((z) => z !== null).join("\n");
  const text = `${kopf}\n\n${nachricht.trim()}`;
  const betreff = `${f.betreff}: ${anliegenTitel}`;

  async function kopieren(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(`An: ${empfaenger}\nBetreff: ${betreff}\n\n${text}`);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <form
      className="grid gap-5"
      noValidate={geladen}
      onSubmit={async (ev) => {
        ev.preventDefault();
        const neu: typeof fehler = {};
        if (!name.trim()) neu.name = f.fehlerName;
        if (!emailGueltig(email)) neu.email = f.fehlerEmail;
        if (!nachricht.trim()) neu.nachricht = f.fehlerNachricht;
        setFehler(neu);
        const erstes = (["name", "email", "nachricht"] as const).find((k) => neu[k]);
        if (erstes) { setStatus(""); document.getElementById(`${id}-${erstes}`)?.focus(); return; }
        let link = mailtoBauen(empfaenger, betreff, text);
        let zusatz = "";
        if (link.length > MAILTO_GRENZE) {
          // Zu lang für einen verlässlichen mailto:-Link: Kurzfassung in den Link, ganzer Text in die Zwischenablage.
          // Klappt das Kopieren nicht, wird kein Entwurf geöffnet (er wäre unvollständig): Der ganze Text erscheint zum Kopieren von Hand.
          if (!(await kopieren())) {
            setVorbereitet(true);
            setVolltext(true);
            setStatus(f.zuLangFehler);
            return;
          }
          link = mailtoBauen(empfaenger, betreff, `${kopf}\n\n(Bitte die Nachricht aus der Zwischenablage hier einfügen.)`);
          zusatz = ` ${f.kopiert}`;
        }
        setVorbereitet(true);
        setStatus(f.hinweisNachher + zusatz);
        window.location.href = link;
      }}
    >
      <div>
        <h2 className="titel-2">{f.titel}</h2>
        <p className="klein mt-3 max-w-[58ch] text-tinte-2">{f.einleitung}</p>
        <noscript>
          <p className="klein mt-3">
            {f.ohneJavascript} <a href={`mailto:${empfaenger}`} className="textlink">{empfaenger}</a>.
          </p>
        </noscript>
      </div>
      <div className="feld">
        <label htmlFor={`${id}-name`}>{f.name} <span aria-hidden="true">*</span></label>
        <input id={`${id}-name`} name="Name" type="text" autoComplete="name" maxLength={GRENZEN.name} required aria-required="true" aria-invalid={fehler.name ? "true" : undefined} aria-describedby={fehler.name ? `${id}-name-fehler` : undefined} value={name} onChange={(ev) => setName(ev.target.value)} />
        {fehler.name ? <p id={`${id}-name-fehler`} className="fehler" role="alert">{fehler.name}</p> : null}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="feld">
          <label htmlFor={`${id}-email`}>{f.email} <span aria-hidden="true">*</span></label>
          <input id={`${id}-email`} name="E-Mail" type="email" autoComplete="email" inputMode="email" maxLength={GRENZEN.email} required aria-required="true" aria-invalid={fehler.email ? "true" : undefined} aria-describedby={fehler.email ? `${id}-email-fehler` : undefined} value={email} onChange={(ev) => setEmail(ev.target.value)} />
          {fehler.email ? <p id={`${id}-email-fehler`} className="fehler" role="alert">{fehler.email}</p> : null}
        </div>
        <div className="feld">
          <label htmlFor={`${id}-telefon`}>{f.telefon}</label>
          <input id={`${id}-telefon`} name="Telefon" type="tel" autoComplete="tel" inputMode="tel" maxLength={GRENZEN.telefon} value={telefon} onChange={(ev) => setTelefon(ev.target.value)} />
        </div>
      </div>
      <div className="feld">
        <label htmlFor={`${id}-anliegen`}>{f.anliegen}</label>
        <select id={`${id}-anliegen`} name="Anliegen" value={anliegen} onChange={(ev) => setAnliegen(ev.target.value)}>
          {f.anliegenOptionen.map((o) => (
            <option key={o.wert} value={o.wert}>{o.titel}</option>
          ))}
        </select>
      </div>
      <div className="feld">
        <label htmlFor={`${id}-nachricht`}>{f.nachricht} <span aria-hidden="true">*</span></label>
        <textarea id={`${id}-nachricht`} name="Nachricht" rows={6} maxLength={GRENZEN.nachricht} required aria-required="true" aria-invalid={fehler.nachricht ? "true" : undefined} aria-describedby={`${id}-hilfe${fehler.nachricht ? ` ${id}-nachricht-fehler` : ""}`} value={nachricht} onChange={(ev) => setNachricht(ev.target.value)} />
        <p id={`${id}-hilfe`} className="hilfe">{f.nachrichtHilfe} ({nachricht.length}/{GRENZEN.nachricht})</p>
        {fehler.nachricht ? <p id={`${id}-nachricht-fehler`} className="fehler" role="alert">{fehler.nachricht}</p> : null}
      </div>
      <p className="klein text-grau">
        {f.pflicht} {f.datenschutzHinweis} <SmartLink ziel={f.datenschutzLink.ziel} className="textlink">{f.datenschutzLink.text}</SmartLink>.
      </p>
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="knopf knopf-primaer disabled:cursor-not-allowed disabled:opacity-60" disabled={!geladen}>
            <EnvelopeSimpleIcon size={20} weight="bold" aria-hidden="true" />
            {f.absenden}
          </button>
          {vorbereitet ? (
            <button type="button" className="knopf knopf-sekundaer" onClick={async () => { const ok = await kopieren(); if (!ok) setVolltext(true); setStatus(ok ? f.kopiert : f.kopierenFehler); }}>
              <CopyIcon size={20} weight="bold" aria-hidden="true" />
              {f.kopieren}
            </button>
          ) : null}
        </div>
        <p role="status" aria-live="polite" className="klein max-w-[58ch] text-tinte-2">
          {status}
          {vorbereitet ? <> <a href={`mailto:${empfaenger}`} className="textlink">{empfaenger}</a></> : null}
        </p>
        {volltext ? (
          <div className="feld">
            <label htmlFor={`${id}-volltext`}>{f.volltextLabel}</label>
            <textarea id={`${id}-volltext`} readOnly rows={8} value={`An: ${empfaenger}\nBetreff: ${betreff}\n\n${text}`} onFocus={(ev) => ev.currentTarget.select()} />
          </div>
        ) : null}
      </div>
    </form>
  );
}
