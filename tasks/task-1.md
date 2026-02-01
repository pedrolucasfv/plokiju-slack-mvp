# ✅ Task 1 — Plokiju Agents (Slack → Jira Bug Creator)

Você é um engenheiro de software sênior.

Nesta tarefa, você vai implementar a primeira automação real do projeto mantendo as outras **Plokiju Agents**:

**Slack message → detecta BUG → cria Issue do tipo Bug no Jira → responde no Slack**

⚠️ Ainda NÃO existe OpenAI, banco de dados, autenticação ou dashboard.
Apenas integração e automação real.

---

## ✅ Objetivo

Quando alguém mandar uma mensagem no Slack no formato:

Bug: checkout is failing in production


O sistema deve:

1. Receber o evento via Slack Events API  
2. Interpretar a mensagem no padrão:

- Antes de `:` → título do ticket (summary)
- Depois de `:` → descrição do ticket

3. Criar automaticamente um Issue no Jira do tipo **Bug**
4. Responder no Slack confirmando a criação:

✅ Jira Bug created: PROJ-123


---

## <slack_context>

Você já implementou o endpoint:

POST /slack/events


Slack envia mensagens via evento `message.channels`.  
:contentReference[oaicite:1]{index=1}

Para responder no canal, use:

`chat.postMessage`  
:contentReference[oaicite:2]{index=2}

---

## <jira_context>

O Jira Cloud permite criar issues via REST API:

POST /rest/api/3/issue


Documentação oficial:  
:contentReference[oaicite:3]{index=3}

O campo `description` em Jira Cloud usa o formato oficial **ADF (Atlassian Document Format)**.  
:contentReference[oaicite:4]{index=4}

---

## ✅ Behavior Rules (Definido pelo usuário)

### Parsing obrigatório

Mensagem recebida:

Bug: checkout is failing


Deve gerar:

- Summary: `"Bug"`
- Description: `"checkout is failing"`

Se não existir `:`, ignore a mensagem.

---

### Tipo fixo

Todo ticket criado deve ser do tipo:

issuetype.name = "Bug"


---

### Bot sempre responde no Slack

Após criar o issue, enviar mensagem:

✅ Jira Bug created: PROJ-123


Usando `chat.postMessage`.  
:contentReference[oaicite:5]{index=5}

---

## <env_vars>

Adicionar no `.env.example`:

```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=xxxxxxxxxxxx
JIRA_PROJECT_KEY=PROJ

SLACK_BOT_TOKEN=xoxb-xxxx
<implementation_spec>
1. Detectar mensagens de canal
Apenas processar eventos:

event.type === "message"

Ignorar bots (bot_id)

2. Parsing Title + Description
Implementar função:

function parseBugMessage(text: string) {
  if (!text.includes(":")) return null

  const [summary, ...rest] = text.split(":")
  return {
    summary: summary.trim(),
    description: rest.join(":").trim(),
  }
}
3. Criar Issue Jira (Bug)
Endpoint:

POST /rest/api/3/issue
Payload mínimo:

{
  "fields": {
    "project": { "key": "PROJ" },
    "summary": "Bug",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "checkout is failing" }
          ]
        }
      ]
    },
    "issuetype": { "name": "Bug" }
  }
}
ADF é o formato oficial para rich text no Jira Cloud.

4. Responder no Slack
Após Jira retornar:

{ "key": "PROJ-123" }
Enviar mensagem:

✅ Jira Bug created: PROJ-123
Usar chat.postMessage.

<file_structure>
Adicionar os arquivos:

src/
  jira/
    jira-client.ts       # createBugIssue()
  slack/
    slack-handler.ts     # parse + trigger jira
  index.ts               # webhook receiver
.env.example
README.md
<acceptance_criteria>
✅ Mensagem "Bug: something failed" cria ticket Bug no Jira
✅ Summary vem antes do ":"
✅ Description vem depois do ":"
✅ Bot responde no Slack com PROJ-123
✅ Mensagens sem ":" são ignoradas
✅ Projeto roda local via npm run dev

✅ Output esperado
Terminal:

Incoming Slack message: Bug: checkout is failing
✅ Jira Bug created: PROJ-123
Slack channel:

✅ Jira Bug created: PROJ-123
Quando terminar, forneça:

Arquivos criados

Como gerar Jira API Token

Como testar enviando uma mensagem no Slack