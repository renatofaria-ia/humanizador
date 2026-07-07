import Link from "next/link";

import { HEADER_TAB_ACTIVE, HEADER_TAB_BASE, HEADER_TAB_INACTIVE } from "@/lib/ui";

type TextViewTabsProps = {
  activeView: "biblioteca" | "novo";
};

export function TextViewTabs({ activeView }: TextViewTabsProps) {
  return (
    <section className="surface-card rounded-[32px] p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/texts"
          aria-current={activeView === "biblioteca" ? "page" : undefined}
          className={`${HEADER_TAB_BASE} ${
            activeView === "biblioteca" ? HEADER_TAB_ACTIVE : HEADER_TAB_INACTIVE
          }`}
        >
          Biblioteca
        </Link>
        <Link
          href="/texts/new"
          aria-current={activeView === "novo" ? "page" : undefined}
          className={`${HEADER_TAB_BASE} ${
            activeView === "novo" ? HEADER_TAB_ACTIVE : HEADER_TAB_INACTIVE
          }`}
        >
          Novo texto
        </Link>
      </div>
    </section>
  );
}
