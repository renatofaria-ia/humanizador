import { createTextAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { CHANNEL_PRESETS } from "@/lib/channel-presets";
import { HUMANIZER_MODE_LABELS, HUMANIZER_PRESET_LABELS } from "@/lib/humanizer-protocol";
import { Profile, HUMANIZER_OPERATION_MODES, HUMANIZER_VOICE_PRESETS } from "@/lib/types";

type NewTextFormProps = {
  isDemo: boolean;
  profiles: Profile[];
};

export function NewTextForm({ isDemo, profiles }: NewTextFormProps) {
  return (
    <section className="surface-card rounded-[32px] p-4 sm:p-6">
        <form action={isDemo ? undefined : createTextAction} className="space-y-6">
          <section className="rounded-[28px] border border-[var(--border)] bg-white/78 p-5 sm:p-6">
            <p className="text-sm font-semibold text-[var(--accent)]">1. Base</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Dados base</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              Comece pelo que decide o contexto: nome interno, perfil e texto base.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="field-label">Nome interno</label>
                <input name="title" required className="field" />
              </div>
              <div>
                <label className="field-label">Perfil</label>
                <select name="profile_id" required className="field">
                  <option value="">Selecione um perfil</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="field-label">Texto base</label>
              <textarea
                name="original_text"
                required
                className="field min-h-40"
                placeholder="Cole aqui o texto bruto que precisa ser humanizado."
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--border)] bg-white/78 p-5 sm:p-6">
            <p className="text-sm font-semibold text-[var(--accent)]">2. Formatos</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Formatos de saida</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              Cada formato vira um texto proprio, mas todos compartilham a mesma base.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {CHANNEL_PRESETS.map((preset) => (
                <label
                  key={preset.key}
                  className="flex items-start gap-3 rounded-[24px] border border-[var(--border)] bg-white px-4 py-4 text-sm text-[var(--ink)]"
                >
                  <input
                    type="checkbox"
                    name="output_channels"
                    value={preset.key}
                    defaultChecked={preset.key === "linkedin"}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold">{preset.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-[var(--ink-soft)]">
                      {preset.descricao}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <details className="rounded-[28px] border border-[var(--border)] bg-white/78 px-5 py-4 sm:px-6">
            <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ink)]">
              3. Ajustes finos
            </summary>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              Use estes campos apenas quando o contexto pedir um ajuste mais fino.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="field-label">Objetivo</label>
                <input name="objetivo" className="field" />
              </div>
              <div>
                <label className="field-label">CTA</label>
                <input name="cta" className="field" />
              </div>
              <div>
                <label className="field-label">Tom</label>
                <select name="tom" className="field">
                  {["consultivo", "didatico", "provocativo", "institucional", "neutro"].map(
                    (tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="field-label">Tamanho</label>
                <select name="tamanho" className="field">
                  {["curto", "medio", "longo"].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="field-label">Formalidade</label>
                <select name="formalidade" className="field">
                  {["baixa", "media", "alta"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Nivel de ousadia</label>
                <input
                  name="nivel_ousadia"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue="3"
                  className="field"
                />
              </div>
              <div>
                <label className="field-label">Modo de humanizacao</label>
                <select name="modo_operacao" defaultValue="completo" className="field">
                  {HUMANIZER_OPERATION_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {HUMANIZER_MODE_LABELS[mode]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Estilo de voz</label>
                <select name="preset_de_voz" defaultValue="auto" className="field">
                  {HUMANIZER_VOICE_PRESETS.map((voicePreset) => (
                    <option key={voicePreset} value={voicePreset}>
                      {HUMANIZER_PRESET_LABELS[voicePreset]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                <input type="checkbox" name="usar_emojis" />
                Usar emojis
              </label>
              <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                <input type="checkbox" name="usar_hashtags" />
                Usar hashtags
              </label>
              <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)] md:col-span-2">
                <input type="checkbox" name="primeira_pessoa" defaultChecked />
                Preferir primeira pessoa
              </label>
            </div>

            <div className="mt-4">
              <label className="field-label">Instrucoes extras</label>
              <textarea name="instrucoes_extras" className="field min-h-24" />
            </div>
          </details>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4">
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              Com base, perfil e ao menos um formato definidos, o texto ja pode ser criado.
            </p>
            <SubmitButton label="Criar texto" pendingLabel="Criando..." />
          </div>
        </form>
    </section>
  );
}
