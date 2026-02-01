Prompt — Task 0: Slack Connection MVP (Local)

Você é um engenheiro de software sênior. Vai implementar um MVP local do projeto Plokiju Agents, focado exclusivamente em integrar o Slack Events API para receber mensagens em tempo real.

O objetivo desta task é construir apenas a fundação de trigger:

Slack → Webhook → Log no terminal

Nada de agentes ainda, nada de OpenAI ainda.

<project_context>

Nome do projeto: Plokiju Agents

MVP inicial (Task 0):

Rodar localmente em Node.js + TypeScript

Expor endpoint HTTP para receber eventos do Slack

Fazer ACK imediato

Logar mensagens recebidas

Slack envia eventos via Events API Webhooks, e exige URL Verification com challenge.

Documentação oficial:

URL verification event: responder com o campo challenge em plaintext


Slack envia mensagens de canal via evento message.channels


Events API flow: Slack envia JSON → servidor ACK → processa evento


</project_context>

<requirements>
MUST-HAVES

Implementar um servidor HTTP local usando Node.js + TypeScript

Usar um framework simples (Express ou Fastify)

Criar endpoint:

POST /slack/events

Implementar corretamente:

✅ Slack URL verification handshake
✅ ACK imediato (responder 200 rápido)
✅ Processamento assíncrono simples (apenas log)

Capturar apenas mensagens humanas:

event.type === "message"

ignorar mensagens de bots (bot_id)

</requirements>

<slack_behavior>

Slack enviará payloads como:

1. URL Verification
{
  "type": "url_verification",
  "challenge": "random_string"
}


Seu servidor deve responder:

random_string


2. Message Event

Slack enviará eventos como:

{
  "type": "event_callback",
  "event": {
    "type": "message",
    "text": "Bug: checkout is failing"
  }
}


Evento oficial: message.channels


</slack_behavior>

<file_structure>

Crie o projeto dentro de um diretório isolado local:

plokiju-slack-mvp/

src/
  index.ts        # servidor principal
.env.example      # exemplo de variáveis
package.json
tsconfig.json
README.md


</file_structure>

<implementation_spec>

Endpoint /slack/events deve:

Detectar type === "url_verification" e retornar challenge

Caso contrário:

retornar 200 OK imediatamente (ACK)

depois logar o conteúdo do evento

Exemplo:

console.log("Incoming Slack message:", event.text)


Slack exige ACK rápido, senão reenvia eventos.


</implementation_spec>

<local_dev_instructions>

MUST INCLUDE

Guia no README explicando como testar local:

Rodar servidor:

npm run dev


Expor localhost com ngrok:

ngrok http 3000


Configurar Slack App:

Event Subscriptions → Enable

Request URL = ngrok URL + /slack/events

Subscribe to Bot Events:

message.channels


</local_dev_instructions>

<constraints>

NÃO implementar OpenAI ainda

NÃO implementar banco de dados

NÃO implementar autenticação

NÃO implementar queue ou worker

NÃO criar frontend

Apenas Slack → webhook → logs

</constraints>

<acceptance_criteria>

✅ Servidor roda local em localhost:3000

✅ Slack valida corretamente a Request URL (challenge respondido)

✅ Mensagens postadas no Slack aparecem no terminal:

Incoming Slack message: Bug: checkout is failing


✅ Eventos de bot são ignorados

✅ README contém setup completo do Slack App e ngrok

</acceptance_criteria>

Quando terminar, forneça:

Lista dos arquivos criados

Explicação do fluxo Slack → Webhook

Como executar e testar localmente