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
        <section className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Novo perfil
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
            Cadastrar uma nova calibragem comportamental
          </h2>
          <form action={isDemo ? undefined : createProfileAction} className="mt-6">
            <ProfileFields />
            <div className="mt-6">
              <SubmitButton label="Salvar perfil" pendingLabel="Salvando perfil..." />
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {profiles.map((profile) => (
            <article
              key={profile.id}
              className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                    Perfil existente
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                    {profile.nome}
                  </h3>
                </div>
                <div className="rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                  Humor {profile.nivel_humor}/5
                </div>
              </div>
              <form action={isDemo ? undefined : updateProfileAction} className="mt-6">
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
            </article>
          ))}
        </section>
      </div>
    </DashboardShell>
  );
}
