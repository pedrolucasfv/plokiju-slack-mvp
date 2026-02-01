# ✅ Task 2 — Plokiju Agents (Slack → GitHub Issue Automation)

Você é um engenheiro de software sênior.

Nesta tarefa, você vai implementar a segunda integração real do projeto **Plokiju Agents**:

**Slack message → cria automaticamente uma Issue no GitHub → responde no Slack**

⚠️ Ainda NÃO existe OpenAI, banco de dados, autenticação ou dashboard.  
O foco é apenas em integração e automação real via API.

---

## ✅ Objetivo

Quando alguém mandar uma mensagem no Slack no formato:

Issue: login button is broken on mobile


O sistema deve:

1. Receber o evento via Slack Events API  
2. Interpretar a mensagem no padrão:

- Antes de `:` → título da issue (GitHub title)
- Depois de `:` → descrição da issue (GitHub body)

3. Criar automaticamente uma Issue no GitHub
4. Responder no Slack confirmando:

✅ GitHub Issue created: #24


---

## <github_context>

GitHub permite criar issues via REST API:

POST /repos/{owner}/{repo}/issues


Documentação oficial:  
([docs.github.com](https://docs.github.com/en/rest/issues/issues?utm_source=chatgpt.com))

Payload mínimo:

```json
{
  "title": "Issue title",
  "body": "Issue description"
}
Autenticação deve ser feita com Personal Access Token (PAT).

GitHub recomenda PATs fine-grained ou classic dependendo do uso.
(docs.github.com)

</github_context>

✅ Behavior Rules
Parsing obrigatório
Mensagem recebida:

Issue: login button is broken
Deve gerar:

Title: "Issue"

Body: "login button is broken"

Se não existir :, ignore a mensagem.

GitHub Repo Target
A issue deve ser criada sempre em um repo fixo definido no .env:

GITHUB_OWNER=
GITHUB_REPO=
Bot sempre responde no Slack
Após criar a issue, enviar no Slack:

✅ GitHub Issue created: #<number>
<env_vars>
Adicionar no .env.example:

GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo

SLACK_BOT_TOKEN=xoxb-xxxx
Token precisa ter permissão para criar issues no repo.

GitHub fornece um header X-Accepted-GitHub-Permissions para debug de permissões.
(docs.github.com)

<implementation_spec>
1. Detectar mensagens Slack
Apenas processar:

event.type === "message"

Ignorar bots (bot_id)

2. Parsing Title + Body
Implementar função:

function parseIssueMessage(text: string) {
  if (!text.includes(":")) return null

  const [title, ...rest] = text.split(":")
  return {
    title: title.trim(),
    body: rest.join(":").trim(),
  }
}
Se body estiver vazio, ignore.

3. Criar Issue no GitHub
Implementar client:

Endpoint:

POST https://api.github.com/repos/{owner}/{repo}/issues
Headers:

Authorization: Bearer <GITHUB_TOKEN>
Accept: application/vnd.github+json
A API oficial de issues está documentada aqui:
(docs.github.com)

4. Responder no Slack
GitHub retorna:

{
  "number": 24,
  "html_url": "https://github.com/owner/repo/issues/24"
}
Bot responde:

✅ GitHub Issue created: #24
https://github.com/.../24
<file_structure>
Adicionar os arquivos:

src/
  github/
    github-client.ts       # createIssue()
  slack/
    slack-handler.ts       # detect Issue: → trigger GitHub
.env.example
README.md
<constraints>
❌ NÃO usar OpenAI

❌ NÃO usar banco de dados

❌ NÃO implementar autenticação

✅ Apenas integração Slack → GitHub Issues

</constraints>
<acceptance_criteria>
✅ Mensagem Issue: something broken cria issue no GitHub
✅ Title vem antes do ":"
✅ Body vem depois do ":"
✅ Bot responde no Slack com número e link da issue
✅ Mensagens sem ":" são ignoradas
✅ Projeto roda local via npm run dev

✅ Output esperado
Terminal:

Incoming Slack message: Issue: login broken
✅ GitHub Issue created: #24
Slack channel:

✅ GitHub Issue created: #24
https://github.com/user/repo/issues/24
Quando terminar, forneça:

Arquivos criados

Como gerar GitHub PAT corretamente

Como testar enviando mensagem no Slack

