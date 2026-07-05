import { redirect } from "next/navigation";

import { createProfileAction, updateProfileAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { SetupCallout } from "@/components/setup-callout";
import { SubmitButton } from "@/components/submit-button";
import { demoProfiles } from "@/lib/demo-data";
import { getAppAccess } from "@/lib/app-context";
import { listProfiles } from "@/lib/data";

function ProfileFields({ profileId }: { profileId?: string }) {
  return (
    <>
      {profileId ? <input type="hidden" name="profile_id" value={profileId} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label">Nome</label>
          <input name="nome" required className="field" />
        </div>
        <div>
          <label className="field-label">Descricao curta</label>
          <input name="descricao_curta" required className="field" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label">Regras de voz</label>
          <textarea name="regras_de_voz" required className="field min-h-28" />
        </div>
        <div>
          <label className="field-label">Evitar</label>
          <textarea name="evitar" required className="field min-h-28" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label">Sempre usar</label>
          <textarea name="sempre_usar" required className="field min-h-28" />
        </div>
        <div>
          <label className="field-label">Amostra de escrita</label>
          <textarea name="amostra_de_escrita" className="field min-h-28" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label className="field-label">Nivel de firmeza</label>
          <input
            name="nivel_firmeza"
            type="number"
            min="1"
            max="5"
            defaultValue="3"
            className="field"
          />
        </div>
        <div>
          <label className="field-label">Nivel de humor</label>
          <input
            name="nivel_humor"
            type="number"
            min="0"
            max="5"
            defaultValue="2"
            className="field"
          />
        </div>
        <div>
          <label className="field-label">Observacoes</label>
          <input name="observacoes" className="field" />
        </div>
      </div>
    </>
  );
}

export default async function ProfilesPage() {
  const access = await getAppAccess();

  if (access.mode === "login-required") {
    redirect("/login");
  }

  const isDemo = access.mode === "setup";
  const profiles = isDemo ? demoProfiles : await listProfiles();

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="space-y-6">
        {isDemo ? <SetupCallout title="Perfis em modo demonstracao" /> : null}
        <section className="panel rounded-[32px] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Biblioteca de voz
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)] text-balance">
                Edite perfis existentes primeiro. Crie um novo apenas quando a voz for realmente
                diferente.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] text-pretty">
                Esta pagina foi reorganizada para separar consulta, edicao e criacao. Assim, voce
                nao precisa disputar atencao com varios formularios completos ao mesmo tempo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#new-profile" className="button-primary">
                Novo perfil
              </a>
            </div>
          </div>
        </section>

        <section className="panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Perfis existentes
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Expanda apenas o perfil que precisa de ajuste
              </h2>
            </div>
            <div className="rounded-[var(--radius-pill)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">
              {profiles.length} ativos
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {profiles.map((profile) => (
              <details
                key={profile.id}
                id={`profile-${profile.id}`}
                className="rounded-[28px] border border-[var(--border)] bg-white/70 p-5"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      Perfil pronto
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--ink)]">{profile.nome}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                      {profile.descricao_curta}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-[var(--radius-pill)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      Firmeza {profile.nivel_firmeza}/5
                    </span>
                    <span className="rounded-[var(--radius-pill)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      Humor {profile.nivel_humor}/5
                    </span>
                  </div>
                </summary>
                <form action={isDemo ? undefined : updateProfileAction} className="mt-6 border-t border-[var(--border)] pt-6">
                  <input type="hidden" name="profile_id" value={profile.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="field-label">Nome</label>
                      <input name="nome" defaultValue={profile.nome} required className="field" />
                    </div>
                    <div>
                      <label className="field-label">Descricao curta</label>
                      <input
                        name="descricao_curta"
                        defaultValue={profile.descricao_curta}
                        required
                        className="field"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="field-label">Regras de voz</label>
                      <textarea
                        name="regras_de_voz"
                        defaultValue={profile.regras_de_voz}
                        required
                        className="field min-h-28"
                      />
                    </div>
                    <div>
                      <label className="field-label">Evitar</label>
                      <textarea
                        name="evitar"
                        defaultValue={profile.evitar}
                        required
                        className="field min-h-28"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="field-label">Sempre usar</label>
                      <textarea
                        name="sempre_usar"
                        defaultValue={profile.sempre_usar}
                        required
                        className="field min-h-28"
                      />
                    </div>
                    <div>
                      <label className="field-label">Amostra de escrita</label>
                      <textarea
                        name="amostra_de_escrita"
                        defaultValue={profile.amostra_de_escrita}
                        className="field min-h-28"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="field-label">Nivel de firmeza</label>
                      <input
                        name="nivel_firmeza"
                        type="number"
                        min="1"
                        max="5"
                        defaultValue={profile.nivel_firmeza}
                        className="field"
                      />
                    </div>
                    <div>
                      <label className="field-label">Nivel de humor</label>
                      <input
                        name="nivel_humor"
                        type="number"
                        min="0"
                        max="5"
                        defaultValue={profile.nivel_humor}
                        className="field"
                      />
                    </div>
                    <div>
                      <label className="field-label">Observacoes</label>
                      <input
                        name="observacoes"
                        defaultValue={profile.observacoes}
                        className="field"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <SubmitButton label="Atualizar perfil" pendingLabel="Atualizando..." />
                  </div>
                </form>
              </details>
            ))}
          </div>
        </section>

        <section id="new-profile" className="panel rounded-[32px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Novo perfil
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
            Cadastrar uma nova calibragem comportamental
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Crie um perfil novo somente se as regras de voz, o nivel de firmeza ou a amostra de
            escrita nao puderem ser atendidos pelos perfis existentes.
          </p>
          <form action={isDemo ? undefined : createProfileAction} className="mt-6">
            <ProfileFields />
            <div className="mt-6">
              <SubmitButton label="Salvar perfil" pendingLabel="Salvando perfil..." />
            </div>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
}
