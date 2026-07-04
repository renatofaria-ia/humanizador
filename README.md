# Humanizador App

App privado para uso interno em `Vercel + Supabase`, focado em transformar texto-base em copy humanizada a partir de:

- protocolo fixo do Humanizador;
- perfil comportamental reutilizavel;
- canal/intencao de saida;
- controles editoriais ajustaveis.

O MVP nao publica em redes sociais. Ele organiza a producao, gera sugestoes, guarda historico de versoes e permite marcar manualmente quando um texto foi publicado fora do sistema.

## Stack

- `Next.js 16` com `App Router`
- `TypeScript`
- `Vercel AI SDK`
- `OpenAI` via adapter simples
- `Supabase Auth`
- `Supabase Postgres`

## Fluxo principal

1. Entrar com login unico via magic link.
2. Cadastrar um ou mais perfis comportamentais.
3. Criar um texto-base e escolher o canal.
4. Ajustar tom, tamanho, CTA, formalidade e demais controles.
5. Gerar uma versao humanizada.
6. Revisar, salvar nova versao manual, aprovar e marcar como publicado.

## Status do texto

- `rascunho`
- `gerado`
- `em_revisao`
- `aprovado`
- `publicado`
- `arquivado`

## Estrutura de dados

O schema SQL do MVP esta em [supabase/schema.sql](./supabase/schema.sql) e cria:

- `profiles`
- `channel_presets`
- `texts`
- `text_versions`

Cada geracao salva auditoria basica:

- `model`
- `prompt_version`
- `input_tokens`
- `output_tokens`
- `total_tokens`
- `duration_ms`
- `error`

## Variaveis de ambiente

Use [`.env.example`](./.env.example) como base:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
APP_OWNER_EMAIL=
OPENAI_API_KEY=
```

## Rodando localmente

1. Instale dependencias:

```bash
npm install
```

2. Copie `.env.example` para `.env.local` e preencha as variaveis.

3. Rode o schema em um projeto Supabase novo.

4. Suba o app:

```bash
npm run dev
```

Se o Supabase ou a OpenAI nao estiverem configurados, a interface entra em modo demonstracao com dados de exemplo.

## Endpoints do MVP

- `GET /api/profiles`
- `POST /api/profiles`
- `GET /api/profiles/:id`
- `PATCH /api/profiles/:id`
- `GET /api/texts`
- `POST /api/texts`
- `GET /api/texts/:id`
- `PATCH /api/texts/:id`
- `POST /api/texts/:id/generate`
- `POST /api/texts/:id/regenerate`
- `GET /api/texts/:id/versions`
- `POST /api/texts/:id/versions`
- `PATCH /api/texts/:id/status`

## Observacoes de produto

- O motor usa `system prompt` fixo do Humanizador e adiciona o perfil como camada de calibragem.
- O app salva a resposta estruturada completa mesmo quando a interface mostra apenas o texto final.
- Os presets de canal existem no banco e tambem estao espelhados na camada de aplicacao para manter o MVP simples.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
