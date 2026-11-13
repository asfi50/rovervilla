"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, FilmIcon, GameIcon, HomeIcon, RoverIcon } from "@/app/components/icons";
import { isActive } from "@/app/components/header";

/* The five main sections, in the header's order. About, Timeline and Tributes live in the menu. */
const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/heroes", label: "Heroes", Icon: RoverIcon },
  { href: "/videos", label: "Videos", Icon: FilmIcon },
  { href: "/books", label: "Books", Icon: BookIcon },
  { href: "/games", label: "Games", Icon: GameIcon },
];

/**
 * App-style bottom navigation for phones and tablets, in liquid glass: a floating clear bar,
 * and a lighter glass lens over the selected tab that slides (with a little wobble) when you
 * switch sections. The selected icon and label take the brand colour.
 */
export default function TabBar() {
  const pathname = usePathname();
  // Full-screen experiences (story mode, games, a book chapter) have their own way back.
  if (/^\/heroes\/[^/]+\/story$/.test(pathname) || pathname.startsWith("/games/") || /^\/books\/[^/]+\/[^/]+/.test(pathname)) return null;
  const dark = pathname.startsWith("/videos") || pathname.startsWith("/series");
  const at = TABS.findIndex((t) => isActive(pathname, t.href));

  return (
    <nav aria-label="Sections" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(10px,env(safe-area-inset-bottom))] lg:hidden">
      <ul className={`glass pointer-events-auto mx-auto grid max-w-md grid-cols-5 rounded-[30px] p-1.5 ${dark ? "glass-dark" : ""}`}>
        {/* the selected lens, sliding from tab to tab */}
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 left-1.5 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.3,0.5,1)]"
          style={{ width: "calc((100% - 12px) / 5)", transform: `translateX(${Math.max(0, at) * 100}%)`, opacity: at < 0 ? 0 : 1 }}
        >
          <span key={at} className="glass-lens glass-jelly block h-full w-full rounded-[24px]" />
        </span>
        {TABS.map(({ href, label, Icon }, i) => {
          const active = i === at;
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex flex-col items-center gap-0.5 rounded-[24px] pt-2 pb-1.5 text-[10.5px] tracking-[0.01em] transition-colors duration-300 ${
                  active ? (dark ? "font-semibold text-white" : "font-semibold text-brand") : dark ? "font-medium text-white/60" : "font-medium text-ink/70"
                }`}
              >
                <Icon
                  className={`h-[23px] w-[23px] transition-transform duration-300 group-active:scale-90 ${
                    active ? `scale-105 ${dark ? "[&_path]:fill-white/25 [&_rect]:fill-white/25" : "[&_path]:fill-brand/20 [&_rect]:fill-brand/20"}` : ""
                  }`}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
