# ? Task 3 — Plokiju Agents (Slack ? Notion Toggle Automation)

Você é um engenheiro de software sênior.

Nesta tarefa, você vai implementar a terceira integração real do projeto **Plokiju Agents**:

**Slack message ? adiciona automaticamente um Toggle no Notion ? responde no Slack**

?? Ainda NÃO existe OpenAI, banco de dados, autenticação ou dashboard.  
O foco é apenas em integração e automação real via API.

---

## ? Objetivo

Quando alguém mandar uma mensagem no Slack no formato:

[title]: [description]


O sistema deve:

1. Receber o evento via Slack Events API  
2. Interpretar a mensagem no padrão:

- Antes de `:` ? título do toggle
- Depois de `:` ? conteúdo do toggle

3. Adicionar automaticamente um **toggle** em uma página fixa no Notion
4. Responder no Slack confirmando:

? Notion toggle added


---

## <notion_context>

O Notion permite adicionar blocos em uma página via REST API:

POST /v1/blocks/{block_id}/children


Documentação oficial:  
([developers.notion.com](https://developers.notion.com/reference/patch-block-children?utm_source=chatgpt.com))  

Autenticação é feita via Bearer Token:

Authorization: Bearer <token>


([developers.notion.com](https://developers.notion.com/reference/authentication?utm_source=chatgpt.com))

</notion_context>

---

## ? Behavior Rules

### Parsing obrigatório

Mensagem recebida:

Doc: write postmortem


Deve gerar:

- Title: "Doc"
- Content: "write postmortem"

Se não existir `:`, ignore.

Se content estiver vazio, ignore.

---

### Página alvo obrigatória

Para adicionar blocos via API, você precisa do ID da página alvo.

O MVP deve usar uma página fixa definida no `.env`:

NOTION_PAGE_ID=

A página precisa estar compartilhada com a integração.

---

### Bot sempre responde no Slack

Após criar o toggle, enviar:

? Notion toggle added


---

## <env_vars>

Adicionar no `.env.example`:

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_PAGE_ID=xxxxxxxxxxxxxxxxxxxx

SLACK_BOT_TOKEN=xoxb-xxxx
```

<implementation_spec>
1. Detectar mensagens Slack
Processar apenas:

event.type === "message"

Ignorar bots (bot_id)

2. Parsing Title + Content
Implementar função:

function parseDocMessage(text: string) {
  if (!text.includes(":")) return null

  const [title, ...rest] = text.split(":")
  return {
    title: title.trim(),
    content: rest.join(":").trim(),
  }
}
Se content estiver vazio ? ignore.

3. Adicionar Toggle no Notion
Endpoint:

POST https://api.notion.com/v1/blocks/{page_id}/children
Headers obrigatórios:

Authorization: Bearer <NOTION_API_KEY>
Notion-Version: 2022-06-28
Content-Type: application/json
Notion aceita bearer tokens no header Authorization.
(developers.notion.com)

Payload mínimo (toggle com parágrafo):
{
  "children": [
    {
      "object": "block",
      "type": "toggle",
      "toggle": {
        "rich_text": [
          { "type": "text", "text": { "content": "Doc" } }
        ],
        "children": [
          {
            "object": "block",
            "type": "paragraph",
            "paragraph": {
              "rich_text": [
                { "type": "text", "text": { "content": "write a postmortem..." } }
              ]
            }
          }
        ]
      }
    }
  ]
}

4. Responder no Slack
Bot responde:

? Notion toggle added

Para responder, use chat.postMessage.
(docs.slack.dev)

<file_structure>
Adicionar os arquivos:

src/
  notion/
    notion-client.ts       # appendToggle()
  slack/
    slack-handler.ts       # detect Doc: ? trigger Notion
.env.example
README.md
<constraints>
? NÃO usar OpenAI

? NÃO usar banco de dados

? NÃO implementar autenticação

? Apenas integração Slack ? Notion Toggles

</constraints>
<acceptance_criteria>
? Mensagem Doc: something cria toggle no Notion
? Title vem antes do ":"
? Content vem depois do ":"
? Bot responde no Slack confirmando
? Mensagens sem ":" são ignoradas
? Projeto roda local via npm run dev

? Output esperado
Terminal:

Incoming Slack message: Doc: write postmortem
? Notion toggle added
Slack channel:

? Notion toggle added
Quando terminar, forneça:

Arquivos criados

Como criar Notion Integration + token

Como obter NOTION_PAGE_ID

Como testar enviando mensagem no Slack
