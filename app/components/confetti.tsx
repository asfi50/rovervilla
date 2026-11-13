const COLORS = ["#1238ff", "#ff5a1f", "#ffd166", "#34d399", "#c084fc", "#38bdf8", "#ff8fab"];

/** A repeatable pseudo-random number in [0, 1) for bit `i` of burst `n`. */
const rand = (i: number, k: number, n: number) => {
  const x = Math.sin((i + 1) * 12.9898 * k + n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** A burst of confetti from the top of the screen. Change `burst` (1, 2, …) to fire again; 0 shows nothing. */
export default function Confetti({ burst, count = 80 }: { burst: number; count?: number }) {
  if (!burst) return null;
  return (
    <div key={burst} aria-hidden className="pointer-events-none fixed inset-x-0 -top-4 z-[90] h-0">
      {Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rand(i, k, burst);
        return (
          <span
            key={i}
            className="confetti-bit"
            style={
              {
                left: `${r(1) * 100}%`,
                width: 6 + r(7) * 6,
                height: 8 + r(8) * 9,
                borderRadius: r(9) > 0.65 ? 999 : 2,
                background: COLORS[i % COLORS.length],
                "--dx": `${(r(2) - 0.5) * 260}px`,
                "--dy": `${55 + r(3) * 50}vh`,
                "--spin": `${(r(4) - 0.5) * 1440}deg`,
                "--delay": `${r(5) * 0.4}s`,
                "--dur": `${1.7 + r(6) * 1.5}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
