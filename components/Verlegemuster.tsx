import type { VerlegemusterArt } from "@/lib/content/modell";

/**
 * Gezeichnete Verlegemuster für die Materialkunde. Die Muster sind konstruiert, nicht dekoriert: jedes Rechteck ist ein Stab,
 * die Verhältnisse (Stablänge = 4 × Stabbreite) entsprechen gängigem Stabparkett. Eine Einheit ist blau hervorgehoben,
 * damit man sieht, was sich wiederholt.
 */
const B = 240; // Zeichenfläche
const H = 150;
type Stab = { punkte: [number, number][]; betont?: boolean };

const rechteck = (x: number, y: number, b: number, h: number, betont = false): Stab => ({ punkte: [[x, y], [x + b, y], [x + b, y + h], [x, y + h]], betont });

function schiffsboden(): Stab[] {
  const w = 15, l = 84;
  const versatz = [0, 46, 20, 64, 34, 8, 54, 28, 70, 14]; // unregelmässig, aber fest
  const staebe: Stab[] = [];
  for (let reihe = 0; reihe * w < H; reihe++) for (let x = -versatz[reihe % versatz.length]; x < B; x += l) staebe.push(rechteck(x, reihe * w, l, w, reihe === 4 && x > 60 && x < 140));
  return staebe;
}

function englisch(): Stab[] {
  const w = 15, l = 60;
  const staebe: Stab[] = [];
  for (let reihe = 0; reihe * w < H; reihe++) for (let x = reihe % 2 ? -l / 2 : 0; x < B; x += l) staebe.push(rechteck(x, reihe * w, l, w, (reihe === 4 || reihe === 5) && x >= 90 && x < 150));
  return staebe;
}

function wuerfel(): Stab[] {
  const feld = 50, n = 5, w = feld / n;
  const staebe: Stab[] = [];
  for (let zy = 0; zy * feld < H; zy++) {
    for (let zx = 0; zx * feld < B + feld; zx++) {
      const x0 = zx * feld - 5, y0 = zy * feld;
      const betont = zx === 2 && zy === 1;
      for (let i = 0; i < n; i++) staebe.push((zx + zy) % 2 === 0 ? rechteck(x0, y0 + i * w, feld, w, betont) : rechteck(x0 + i * w, y0, w, feld, betont));
    }
  }
  return staebe;
}

/**
 * Fischgrat (90 Grad): waagrechte Stäbe H und senkrechte Stäbe V auf einem Gitter mit den Vektoren a = (w, w) und
 * b = (l + w, w − l). Das Ganze ist um 45 Grad gedreht, damit das Zickzack wie im Raum üblich senkrecht läuft.
 */
function fischgrat(): Stab[] {
  const w = 13, l = 52;
  const drehen = ([x, y]: [number, number]): [number, number] => {
    const c = Math.SQRT1_2;
    return [B / 2 + (x - y) * c, H / 2 + (x + y) * c - 20];
  };
  const staebe: Stab[] = [];
  for (let i = -14; i <= 14; i++) {
    for (let j = -6; j <= 6; j++) {
      const ox = i * w + j * (l + w), oy = i * w + j * (w - l);
      const betont = j === 0 && (i === 0 || i === 1);
      const hStab = rechteck(ox, oy, l, w, betont);
      const vStab = rechteck(ox + l, oy + w - l, w, l, betont);
      for (const s of [hStab, vStab]) {
        const punkte = s.punkte.map(drehen);
        if (punkte.some(([x, y]) => x > -20 && x < B + 20 && y > -20 && y < H + 20)) staebe.push({ punkte, betont: s.betont });
      }
    }
  }
  return staebe;
}

const MUSTER: Record<VerlegemusterArt, () => Stab[]> = { schiffsboden, englisch, fischgrat, wuerfel };

export function Verlegemuster({ art, titel }: { art: VerlegemusterArt; titel: string }) {
  const staebe = MUSTER[art]();
  // Hervorgehobene Stäbe zuletzt zeichnen, damit ihre Kontur vollständig sichtbar ist
  const sortiert = [...staebe.filter((s) => !s.betont), ...staebe.filter((s) => s.betont)];
  return (
    <svg className="verlegemuster" viewBox={`0 0 ${B} ${H}`} role="img" aria-label={`Zeichnung des Verlegemusters ${titel}`}>
      {sortiert.map((s, i) => (
        <polygon key={i} className={s.betont ? "betont" : undefined} points={s.punkte.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} />
      ))}
    </svg>
  );
}
