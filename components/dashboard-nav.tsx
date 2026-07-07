"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  APP_MOBILE_NAV_LINKS,
  APP_NAV_LINKS,
  HEADER_NAV_ACTIVE,
  HEADER_NAV_BASE,
  HEADER_NAV_INACTIVE,
  isNavActive,
} from "@/lib/ui";

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label="Navegacao principal" className="hidden items-center gap-2 md:flex">
        {APP_NAV_LINKS.map((link) => {
          const active = isNavActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`${HEADER_NAV_BASE} ${active ? HEADER_NAV_ACTIVE : HEADER_NAV_INACTIVE}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <nav aria-label="Navegacao principal mobile" className="mobile-bottom-nav md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2 px-4 py-3">
          {APP_MOBILE_NAV_LINKS.map((link) => {
            const active = isNavActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-medium ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "border border-[var(--border)] bg-white/80 text-[var(--ink-soft)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
