create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao_curta text not null default '',
  regras_de_voz text not null default '',
  evitar text not null default '',
  sempre_usar text not null default '',
  amostra_de_escrita text not null default '',
  nivel_firmeza integer not null default 3 check (nivel_firmeza between 1 and 5),
  nivel_humor integer not null default 2 check (nivel_humor between 0 and 5),
  observacoes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.channel_presets (
  key text primary key,
  label text not null,
  descricao text not null,
  intencao text not null,
  saidas_esperadas jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.texts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  original_text text not null,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  channel_key text not null references public.channel_presets(key) on delete restrict,
  status text not null default 'rascunho' check (status in ('rascunho', 'gerado', 'em_revisao', 'aprovado', 'publicado', 'arquivado')),
  current_version_id uuid null,
  objetivo text not null default '',
  cta text not null default '',
  tom text not null default 'consultivo',
  tamanho text not null default 'medio',
  formalidade text not null default 'media',
  usar_emojis boolean not null default false,
  usar_hashtags boolean not null default false,
  primeira_pessoa boolean not null default true,
  nivel_ousadia integer not null default 3 check (nivel_ousadia between 1 and 5),
  instrucoes_extras text not null default '',
  published_url text null,
  published_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.text_versions (
  id uuid primary key default gen_random_uuid(),
  text_id uuid not null references public.texts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('llm', 'manual')),
  version_number integer not null,
  notes text null,
  output_payload_json jsonb null,
  prompt_version text null,
  model text null,
  input_tokens integer null,
  output_tokens integer null,
  total_tokens integer null,
  duration_ms integer null,
  error text null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (text_id, version_number)
);

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'texts_current_version_id_fkey'
      and table_name = 'texts'
  ) then
    alter table public.texts
      add constraint texts_current_version_id_fkey
      foreign key (current_version_id)
      references public.text_versions(id)
      on delete set null;
  end if;
end
$$;

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists texts_user_id_idx on public.texts(user_id);
create index if not exists texts_status_idx on public.texts(status);
create index if not exists text_versions_text_id_idx on public.text_versions(text_id);
create index if not exists text_versions_user_id_idx on public.text_versions(user_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists texts_set_updated_at on public.texts;
create trigger texts_set_updated_at
before update on public.texts
for each row
execute function public.set_updated_at();

insert into public.channel_presets (key, label, descricao, intencao, saidas_esperadas)
values
  ('blog', 'Blog', 'Texto mais desenvolvido com estrutura editorial.', 'Publicar em blog com mais profundidade.', '["titulo","subtitulo","excerpt","cta"]'::jsonb),
  ('instagram', 'Instagram', 'Legenda orientada a engajamento.', 'Publicar legenda com CTA e hashtags opcionais.', '["legenda","cta","hashtags"]'::jsonb),
  ('x', 'X', 'Versao curta e mais direta.', 'Publicar com abertura forte e opcao alternativa.', '["texto_curto","alternativa_abertura"]'::jsonb),
  ('linkedin', 'LinkedIn', 'Tom profissional com gancho inicial.', 'Publicar reflexao profissional ou institucional.', '["hook","texto_final"]'::jsonb),
  ('email', 'Email', 'Assunto e corpo separados.', 'Enviar mensagem com assunto claro e corpo pronto.', '["assunto","corpo_email"]'::jsonb),
  ('generico', 'Generico', 'Saida universal sem formato fechado.', 'Usar o protocolo base do Humanizador.', '["texto_final"]'::jsonb)
on conflict (key) do update
set
  label = excluded.label,
  descricao = excluded.descricao,
  intencao = excluded.intencao,
  saidas_esperadas = excluded.saidas_esperadas;

alter table public.profiles enable row level security;
alter table public.texts enable row level security;
alter table public.text_versions enable row level security;
alter table public.channel_presets enable row level security;

drop policy if exists "profiles own rows" on public.profiles;
create policy "profiles own rows"
on public.profiles
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "texts own rows" on public.texts;
create policy "texts own rows"
on public.texts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "versions own rows" on public.text_versions;
create policy "versions own rows"
on public.text_versions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "channel presets read" on public.channel_presets;
create policy "channel presets read"
on public.channel_presets
for select
using (auth.role() = 'authenticated');
