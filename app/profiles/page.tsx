import Link from "next/link";
import { redirect } from "next/navigation";

import { createProfileAction, updateProfileAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { SetupCallout } from "@/components/setup-callout";
import { SubmitButton } from "@/components/submit-button";
import { getAppAccess } from "@/lib/app-context";
import { listProfiles } from "@/lib/data";
import { demoProfiles } from "@/lib/demo-data";
import { Profile } from "@/lib/types";
import { HEADER_TAB_ACTIVE, HEADER_TAB_BASE, HEADER_TAB_INACTIVE } from "@/lib/ui";

function ProfileFields({ defaults }: { defaults?: Partial<Profile> }) {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          Etapa 1
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--ink)]">Identidade da voz</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Nome</label>
            <input name="nome" defaultValue={defaults?.nome ?? ""} required className="field" />
          </div>
          <div>
            <label className="field-label">Descricao curta</label>
            <input
              name="descricao_curta"
              defaultValue={defaults?.descricao_curta ?? ""}
              required
              className="field"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="field-label">Amostra de escrita</label>
          <textarea
            name="amostra_de_escrita"
            defaultValue={defaults?.amostra_de_escrita ?? ""}
            className="field min-h-28"
          />
        </div>
      </section>

      <section className="border-t border-[var(--border)] pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          Etapa 2
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--ink)]">Direcao editorial</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Regras de voz</label>
            <textarea
              name="regras_de_voz"
              defaultValue={defaults?.regras_de_voz ?? ""}
              required
              className="field min-h-28"
            />
          </div>
          <div>
            <label className="field-label">Sempre usar</label>
            <textarea
              name="sempre_usar"
              defaultValue={defaults?.sempre_usar ?? ""}
              required
              className="field min-h-28"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="field-label">Evitar</label>
          <textarea
            name="evitar"
            defaultValue={defaults?.evitar ?? ""}
            required
            className="field min-h-28"
          />
        </div>
      </section>

      <section className="border-t border-[var(--border)] pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          Etapa 3
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--ink)]">Calibragem</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="field-label">Nivel de firmeza</label>
            <div className="rounded-[20px] border border-[var(--border)] bg-white/80 px-4 py-4">
              <input
                name="nivel_firmeza"
                type="range"
                min="1"
                max="5"
                defaultValue={String(defaults?.nivel_firmeza ?? 3)}
                className="w-full accent-[var(--accent)]"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-[var(--ink-muted)]">
                <span>Suave</span>
                <span>Arraste para calibrar</span>
                <span>Firme</span>
              </div>
            </div>
          </div>
          <div>
            <label className="field-label">Nivel de humor</label>
            <div className="rounded-[20px] border border-[var(--border)] bg-white/80 px-4 py-4">
              <input
                name="nivel_humor"
                type="range"
                min="0"
                max="5"
                defaultValue={String(defaults?.nivel_humor ?? 2)}
                className="w-full accent-[var(--accent)]"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-[var(--ink-muted)]">
                <span>Seco</span>
                <span>Arraste para calibrar</span>
                <span>Solto</span>
              </div>
            </div>
          </div>
          <div>
            <label className="field-label">Observacoes</label>
            <input
              name="observacoes"
              defaultValue={defaults?.observacoes ?? ""}
              className="field"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

type ProfilesPageSearchParams = {
  view?: string;
};

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<ProfilesPageSearchParams>;
}) {
  const access = await getAppAccess();

  if (access.mode === "login-required") {
    redirect("/login");
  }

  const params = await searchParams;
  const isDemo = access.mode === "setup";
  const profiles = isDemo ? demoProfiles : await listProfiles();
  const activeView = params.view === "novo" ? "novo" : "biblioteca";

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="mx-auto max-w-6xl space-y-6">
        {isDemo ? <SetupCallout title="Perfis em modo demonstracao" /> : null}

        <section className="surface-card rounded-[32px] p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/profiles"
              aria-current={activeView === "biblioteca" ? "page" : undefined}
              className={`${HEADER_TAB_BASE} ${
                activeView === "biblioteca" ? HEADER_TAB_ACTIVE : HEADER_TAB_INACTIVE
              }`}
            >
              Biblioteca
            </Link>
            <Link
              href="/profiles?view=novo"
              aria-current={activeView === "novo" ? "page" : undefined}
              className={`${HEADER_TAB_BASE} ${
                activeView === "novo" ? HEADER_TAB_ACTIVE : HEADER_TAB_INACTIVE
              }`}
            >
              Novo perfil
            </Link>
          </div>
        </section>

        {activeView === "biblioteca" ? (
          <section id="profiles-library" className="surface-card rounded-[32px] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">Biblioteca de perfis</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  Compare, expanda e edite apenas o que for necessario
                </h2>
              </div>
              <div className="rounded-[var(--radius-pill)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                {profiles.length} ativos
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-[var(--ink-soft)]">
              <span className="rounded-full border border-[var(--border)] bg-white/85 px-3 py-1">
                Voz reutilizavel
              </span>
              <span className="rounded-full border border-[var(--border)] bg-white/85 px-3 py-1">
                Edicao direta no card
              </span>
              <span className="rounded-full border border-[var(--border)] bg-white/85 px-3 py-1">
                Calibragem por firmeza e humor
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {profiles.map((profile) => (
                <details
                  key={profile.id}
                  className="rounded-[28px] border border-[var(--border)] bg-white/78 p-5"
                >
                  <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3">
                    <div className="max-w-2xl">
                      <p className="text-xs font-semibold text-[var(--ink-muted)]">Perfil pronto</p>
                      <h3 className="mt-2 text-xl font-semibold text-[var(--ink)]">
                        {profile.nome}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                        {profile.descricao_curta}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-[var(--radius-pill)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--ink-muted)]">
                        Firmeza {profile.nivel_firmeza}/5
                      </span>
                      <span className="rounded-[var(--radius-pill)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--ink-muted)]">
                        Humor {profile.nivel_humor}/5
                      </span>
                    </div>
                  </summary>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                      ["Como soa", profile.descricao_curta],
                      ["Sempre usar", profile.sempre_usar],
                      ["Evitar", profile.evitar],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[22px] border border-[var(--border)] bg-white/85 p-4"
                      >
                        <p className="text-xs font-semibold text-[var(--ink-muted)]">{label}</p>
                        <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    action={isDemo ? undefined : updateProfileAction}
                    className="mt-6 border-t border-[var(--border)] pt-6"
                  >
                    <input type="hidden" name="profile_id" value={profile.id} />
                    <ProfileFields defaults={profile} />
                    <div className="mt-6">
                      <SubmitButton label="Atualizar perfil" pendingLabel="Atualizando..." />
                    </div>
                  </form>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {activeView === "novo" ? (
          <section id="new-profile" className="surface-card rounded-[32px] p-6 sm:p-8">
            <p className="text-sm font-semibold text-[var(--accent)]">Novo perfil</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
              Cadastre uma nova voz reutilizavel
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              Use esta area quando a biblioteca atual nao cobre a voz que voce precisa. Nomeie o
              perfil de forma objetiva e descreva o que deve soar constante.
            </p>
            <form action={isDemo ? undefined : createProfileAction} className="mt-6">
              <ProfileFields />
              <div className="mt-6">
                <SubmitButton label="Salvar perfil" pendingLabel="Salvando perfil..." />
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </DashboardShell>
  );
}
