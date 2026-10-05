import Link from "next/link";
import type { ReactNode } from "react";
import { assetUrl, istExternerLink, sichererLink } from "@/lib/assets";

/**
 * Ein Link für alle Ziele aus den Inhalten.
 * - Interne Seiten laufen über next/link (kennt den Unterpfad).
 * - Interne Ziele mit Sprungmarke («/leistungen/#material-kork») sind gewöhnliche Links, damit der Browser das Ereignis
 *   `hashchange` auslöst und das passende Akkordeon aufklappt (components/AnkerOeffner.tsx).
 * - https-Links öffnen in einem neuen Fenster, mit rel="noopener noreferrer" und einem Hinweis für Screenreader.
 * - Nicht erlaubte Ziele (javascript:, data: usw.) werden zu «#».
 */
export function SmartLink({ ziel, className, children, onClick, ariaLabel, ariaCurrent }: { ziel: string; className?: string; children: ReactNode; onClick?: () => void; ariaLabel?: string; ariaCurrent?: "page" }) {
  const z = sichererLink(ziel);
  if (z.startsWith("#")) return <a href={z} className={className} onClick={onClick} aria-label={ariaLabel}>{children}</a>;
  if (istExternerLink(z)) {
    const neuesFenster = z.startsWith("https://");
    return (
      <a href={z} className={className} onClick={onClick} aria-label={ariaLabel} {...(neuesFenster ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
        {neuesFenster ? <span className="nur-sr"> (öffnet in einem neuen Fenster)</span> : null}
      </a>
    );
  }
  if (z.includes("#")) return <a href={assetUrl(z)} className={className} onClick={onClick} aria-label={ariaLabel}>{children}</a>;
  return <Link href={z} className={className} onClick={onClick} aria-label={ariaLabel} aria-current={ariaCurrent}>{children}</Link>;
}
