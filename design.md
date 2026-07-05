# Humanizador App Design Guide

## Objetivo

Este documento passa a ser a referencia de UI do Humanizador App. Ele substitui o guide anterior, que descrevia uma marca externa e nao ajudava a manter consistencia no produto atual.

O app deve parecer um workspace editorial privado: leve, caloroso, preciso e orientado a formulios longos. A interface nao e "marketing dark", nem dashboard corporativo frio. Ela mistura superficie clara com profundidade suave, foco forte em legibilidade e blocos grandes que suportam escrita, revisao e historico.

## Direcao visual

- Atmosfera: editorial-operacional, com base clara e calor humano.
- Percepcao: ferramenta privada, premium, nao publica.
- Hierarquia: formularios e saidas estruturadas sao o centro; navegacao e chrome devem ficar discretos.
- Ritmo: cards grandes, espacamento generoso, labels pequenas e texto principal respirando.

## Principios

### 1. Conteudo primeiro
- O texto precisa dominar a tela, nao o chrome.
- Inputs, textareas e blocos de saida devem ter largura confortavel para leitura e edicao.
- Em telas de duas colunas, a coluna de formulario nunca pode ficar espremida.

### 2. Uma unica familia visual
- Fundo com gradiente claro quente-frio.
- Superficies brancas transluidas.
- Borda suave azul-ardosia.
- Um unico acento principal terracota.
- Tipografia sem excesso de ornamentacao.

### 3. Consistencia por tokens
- Raio, sombra, foco, borda e espacamento devem nascer de tokens globais.
- Componentes compartilhados devem evitar valores soltos repetidos.

### 4. Interacao discreta
- Sem animacao chamativa.
- Hover, foco e disabled precisam ser claros, mas curtos e locais.
- Formularios devem mostrar foco no proprio campo, nao deslocar layout.

## Tokens

### Cores

#### Fundo
- `--page-background`: gradiente principal da aplicacao.
- `--surface`: vidro claro principal dos cards.
- `--surface-strong`: bloco claro de apoio para chips e estados leves.
- `--surface-field`: branco mais opaco para campos editaveis.

#### Texto
- `--ink`: texto principal.
- `--ink-soft`: texto secundario e suporte.
- `--ink-muted`: labels, eyebrows e metadados.

#### Acao
- `--accent`: terracota principal.
- `--accent-foreground`: texto sobre acento.
- `--focus-ring`: halo do foco.

#### Estrutura
- `--border`: borda padrao.
- `--border-strong`: borda de hover e destaque leve.

### Forma
- `--radius-shell`: 32px para hero-shell e cards estruturais grandes.
- `--radius-panel`: 28px para paineis principais.
- `--radius-field`: 18px para campos.
- `--radius-pill`: 999px para navegação, badges e acoes compactas.

### Sombra
- `--shadow-shell`: sombra mais profunda do header principal.
- `--shadow-panel`: sombra padrao dos paineis.
- `--shadow-soft`: sombra curta para botoes e elementos compactos.

## Tipografia

### Hierarquia
- Hero da aplicacao: grande, peso 600, tracking fechado.
- Titulo de secao: `text-2xl` a `text-3xl`, sem exagero.
- Eyebrow: caixa alta, tracking alto, cor `--ink-muted`.
- Corpo: `text-sm` ou `text-base`, sempre com line-height confortavel.

### Regras
- Headings usam `text-balance` quando possivel.
- Texto corrido usa `text-pretty` quando possivel.
- Labels pequenas podem usar tracking aberto.
- Nao usar mais de um acento cromatico por view.

## Layout

### Container
- O shell geral trabalha com largura maxima `max-w-7xl`.
- O header principal deve funcionar como uma "capsula" superior da aplicacao.

### Grid
- Formularios simples: 2 colunas em `md`, 1 coluna em `sm`.
- Formularios densos: 3 ou 4 colunas apenas quando os campos continuarem legiveis.
- Tela de detalhe de texto:
  - Desktop largo: coluna esquerda maior para base do job.
  - Coluna direita menor para saida, workflow e historico.
  - Nunca usar fracoes que comprimam a coluna de edicao abaixo do conforto visual.

### Espacamento
- Blocos principais: 24px.
- Respiro entre secoes: 24px ou 32px.
- Campos no mesmo grupo: 16px.

## Componentes base

### Shell principal
- Usa superficie clara transludida, blur discreto, raio grande e sombra profunda.
- Navegacao em pills leves.
- CTA de saida em pill preenchida escura.

### Panel
- Card principal da aplicacao.
- Serve para formularios, saidas estruturadas, historico e cards resumidos.
- Deve sempre respeitar `min-w-0` quando viver em grid.

### Field
- Campo claro com borda suave.
- Altura suficiente para toque e leitura.
- Foco com borda de acento e halo discreto.

### Buttons

#### Primario
- Fundo `--accent`.
- Texto `--accent-foreground`.
- Forma pill.

#### Secundario
- Fundo branco transluzido.
- Borda suave.
- Texto `--ink`.

#### Escuro
- Fundo `--ink`.
- Texto branco.
- Uso reservado para acoes de chrome, como sair.

### Badges
- Sempre em pill.
- Tracking levemente aberto.
- Estados por cor podem variar, mas a forma deve ser fixa.

## Padroes por tela

### Painel
- Cards de metricas com leitura imediata.
- Blocos de perfis e textos em paineis separados.

### Perfis
- Formulario superior longo e confortavel.
- Campos textuais grandes antes dos numericos.
- Cards existentes repetem exatamente a mesma linguagem do formulario novo.

### Textos
- Tela de listagem com card de criacao acima e lista abaixo.
- Tela de detalhe com prioridade para base do job e texto final.

### Login
- Continua na mesma familia visual do app.
- Nao deve parecer landing page independente.

## Do

- Use tokens globais antes de criar novos valores.
- Garanta `min-w-0` em filhos de grid com conteudo denso.
- Prefira paineis largos e legiveis para escrita.
- Mantenha o terracota como unico acento principal.
- Use o mesmo raio de pill para navegacao, badges e acoes compactas.

## Dont

- Nao reutilize guides de outras marcas como fonte direta de UI.
- Nao comprima formularios em colunas estreitas so para "caber tudo".
- Nao misture superficies escuras com esta proposta clara sem motivo funcional.
- Nao introduza varias cores de destaque na mesma view.
- Nao espalhe sombras e raios arbitrarios fora dos tokens.

## Aplicacao no codigo

Este guide deve refletir os componentes compartilhados do projeto:

- `app/globals.css`: tokens de cor, raio, foco e sombra.
- `components/dashboard-shell.tsx`: shell, navegacao e hierarquia superior.
- `components/submit-button.tsx`: botoes primarios consistentes.
- `components/status-badge.tsx`: base de badge consistente.

Quando a interface evoluir, este documento deve ser atualizado junto com os tokens globais, nao depois.
