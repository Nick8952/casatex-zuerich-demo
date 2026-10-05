"use client";

import { useId, useRef, useState } from "react";
import { ListIcon, XIcon, PhoneIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import type { Link as LinkTyp, Material, Texte } from "@/lib/content/modell";
import { telLink } from "@/lib/assets";
import { Handmuster } from "./Handmuster";
import { NavLink } from "./NavLink";
import { SmartLink } from "./SmartLink";

/**
 * «Materialregister»: Navigation als Musterbuch. Ein Knopf in der Kopfzeile öffnet einen Dialog mit allen Seiten und
 * allen Materialien als Handmuster. Auf dem Handy ist das zugleich das Hauptmenü (ganze Fläche), am Bildschirm ein Blatt
 * von oben. Natives <dialog>: Fokus bleibt im Dialog, Escape schliesst, der Fokus kehrt zum Knopf zurück.
 */
export function Register({ texte, navigation, materialien, telefon, telefonAnzeige, email }: { texte: Texte["kopf"]; navigation: LinkTyp[]; materialien: Material[]; telefon: string; telefonAnzeige: string; email: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [offen, setOffen] = useState(false);
  const titelId = useId();
  const schliessen = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        className="knopf knopf-sekundaer knopf-klein"
        aria-haspopup="dialog"
        aria-expanded={offen}
        onClick={() => { dialog.current?.showModal(); setOffen(true); }}
      >
        <ListIcon size={20} weight="bold" aria-hidden="true" />
        <span className="lg:hidden">{texte.menueKnopf}</span>
        <span className="hidden lg:inline">{texte.registerKnopf}</span>
      </button>

      <dialog ref={dialog} className="register" aria-labelledby={titelId} onClose={() => setOffen(false)} onClick={(ev) => { if (ev.target === dialog.current) schliessen(); }}>
        <div className="behaelter pb-12 pt-4 lg:pb-14 lg:pt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 id={titelId} className="titel-3">{texte.registerTitel}</h2>
            <button type="button" className="knopf knopf-sekundaer knopf-klein" onClick={schliessen}>
              <XIcon size={18} weight="bold" aria-hidden="true" />
              {texte.schliessen}
            </button>
          </div>

          <div className="mt-8 grid gap-12 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-16">
            <div>
              <nav aria-label="Seiten">
                <ul className="grid">
                  {navigation.map((n) => (
                    <li key={n.ziel} className="border-b border-linie-stark first:border-t">
                      <NavLink ziel={n.ziel} onClick={schliessen} className="titel-3 flex min-h-14 items-center py-2 hover:text-blau-tief" aktivKlasse="text-blau-tief">
                        {n.text}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <ul className="klein mt-6 grid gap-1">
                <li>
                  <a href={telLink(telefon)} className="inline-flex min-h-11 items-center gap-2.5 font-semibold hover:text-blau-tief">
                    <PhoneIcon size={20} aria-hidden="true" />
                    {telefonAnzeige}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center gap-2.5 font-semibold hover:text-blau-tief">
                    <EnvelopeSimpleIcon size={20} aria-hidden="true" />
                    {email}
                  </a>
                </li>
              </ul>
              <SmartLink ziel={texte.aufruf.ziel} className="knopf knopf-primaer mt-5" onClick={schliessen}>{texte.aufruf.text}</SmartLink>
            </div>

            <div>
              <p className="lauftext text-tinte-2">{texte.registerText}</p>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-5">
                {materialien.map((m) => (
                  <li key={m.slug}>
                    <Handmuster material={m} onClick={schliessen} sizes="(min-width: 80rem) 12vw, (min-width: 40rem) 22vw, 44vw" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
