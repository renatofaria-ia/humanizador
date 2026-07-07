"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

import { CHANNEL_PRESETS } from "@/lib/channel-presets";
import { TEXT_STATUSES, type TextStatus } from "@/lib/types";
import { HEADER_TAB_ACTIVE, HEADER_TAB_BASE, HEADER_TAB_INACTIVE, getStatusMeta } from "@/lib/ui";

type TextViewTabsProps = {
  activeView: "biblioteca" | "novo";
  query: string;
  statusFilter: string;
  channelFilter: string;
};

export function TextViewTabs({ activeView, query, statusFilter, channelFilter }: TextViewTabsProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const hasSearchValue = query.trim().length > 0;
  const searchIsHighlighted = isSearchOpen || hasSearchValue;

  return (
    <>
      <section className="surface-card rounded-[32px] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
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
          <button
            type="button"
            aria-label={isSearchOpen ? "Ocultar busca" : "Abrir busca"}
            aria-pressed={isSearchOpen}
            onClick={() => setIsSearchOpen((value) => !value)}
            className={`button-secondary h-12 w-12 shrink-0 p-0 sm:h-14 sm:w-14 ${
              searchIsHighlighted
                ? "border-[color-mix(in_srgb,var(--accent)_34%,var(--border))] text-[var(--accent)] shadow-[0_4px_12px_rgba(73,97,119,0.1)]"
                : ""
            }`}
          >
            <Search aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      </section>

      {isSearchOpen ? (<section className="surface-card rounded-[32px] p-6">
        <form
          method="get"
          className={`grid gap-4 ${
            isSearchOpen
              ? "lg:grid-cols-[minmax(0,1.2fr)_repeat(2,minmax(0,0.5fr))_auto_auto]"
              : "lg:grid-cols-[repeat(2,minmax(0,0.5fr))_auto_auto]"
          }`}
        >
          <div className={isSearchOpen ? "block" : "hidden"}>
            <label className="field-label">Buscar</label>
            <input
              name="q"
              defaultValue={query}
              className="field"
              placeholder="Titulo, perfil ou trecho da base"
            />
          </div>
          <div>
            <label className="field-label">Status</label>
            <select name="status" defaultValue={statusFilter} className="field">
              <option value="">Todos</option>
              {TEXT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {getStatusMeta(status as TextStatus).label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Formato</label>
            <select name="channel" defaultValue={channelFilter} className="field">
              <option value="">Todos</option>
              {CHANNEL_PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="button-primary w-full">
              Aplicar
            </button>
          </div>
          <div className="flex items-end">
            <Link href="/texts" className="button-secondary w-full">
              Limpar
            </Link>
          </div>
        </form>
      </section>) : null}
    </>
  );
}
