# AGENTS

## Regra documental

- `docs/diagramas/*.mmd` sao a fonte canonica de arquitetura, fluxos, estados, dados e runtime deste repo.
- Sempre que uma tarefa tocar auth, fluxo de texto, schema, APIs, estados, runtime ou deploy, leia primeiro os Mermaid relevantes antes de propor ou implementar mudancas.
- Sempre que uma tarefa mudar comportamento, contrato, fluxo ou estrutura coberta por um Mermaid, atualize o arquivo correspondente no mesmo trabalho.
- Considere a tarefa incompleta se o Mermaid relevante ficar defasado em relacao ao codigo.
- Rode `npm run diagramas:check` ao final quando a mudanca tocar arquivos cobertos por `docs/diagramas.manifest.json`.

## Regra para agentes e LLMs

- Prefira usar os Mermaid como contexto estrutural primario antes de expandir leitura do codigo.
- Use o codigo como fonte de verificacao e detalhe; use os Mermaid como mapa canonico de alto nivel.
- Nao recrie diagramas em `drawio`; este repo trabalha somente com Mermaid.
