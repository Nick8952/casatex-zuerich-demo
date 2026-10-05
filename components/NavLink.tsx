"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Navigationslink, der die aktuelle Seite kennzeichnet (aria-current) und auch Unterseiten des Ziels als aktiv zeigt. */
export function NavLink({ ziel, className, aktivKlasse = "", children, onClick }: { ziel: string; className?: string; aktivKlasse?: string; children: ReactNode; onClick?: () => void }) {
  const pfad = usePathname() ?? "/";
  const normal = pfad.endsWith("/") ? pfad : `${pfad}/`;
  const aktiv = ziel === "/" ? normal === "/" : normal.startsWith(ziel);
  return (
    <Link href={ziel} className={`${className ?? ""} ${aktiv ? aktivKlasse : ""}`} aria-current={normal === ziel ? "page" : undefined} onClick={onClick}>
      {children}
    </Link>
  );
}
