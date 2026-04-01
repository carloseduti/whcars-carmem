# Carmen Cloud → Telegram

Servidor Node.js que recebe eventos de leitura de placas veiculares via webhook da **Carmen Cloud** e encaminha as informações para um bot do **Telegram**.

---

## Pré-requisitos

- Node.js 18+
- Conta e API key na [Carmen Cloud](https://cloud.adaptiverecognition.com)
- Bot criado no Telegram (via @BotFather)

---

## Instalação

```bash
npm install
```

---

## Configuração

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

| Variável        | Descrição                                           |
|-----------------|-----------------------------------------------------|
| `CARMEN_API_KEY`| API key da sua conta na Carmen Cloud                |
| `CARMEN_REGION` | Região da API (`EU` ou `US`)                        |
| `HOOK_URL`      | URL pública do seu servidor (`https://...`/webhook) |
| `BOT_TOKEN`     | Token do bot do Telegram                            |
| `CHAT_ID`       | ID do chat/grupo para onde as mensagens serão enviadas |
| `PORT`          | Porta do servidor (padrão: `3000`)                  |

---

## Como obter o BOT_TOKEN

1. Abra o Telegram e procure por **@BotFather**
2. Envie `/newbot` e siga as instruções
3. Ao final, o BotFather fornecerá um token no formato `123456:ABC-DEF...`

---

## Como obter o CHAT_ID

1. Inicie uma conversa com o seu bot (ou adicione-o a um grupo)
2. Envie qualquer mensagem para ele
3. Acesse no navegador:
   ```
   https://api.telegram.org/bot{SEU_BOT_TOKEN}/getUpdates
   ```
4. Procure pelo campo `"id"` dentro de `"chat"` no JSON retornado

---

## Desenvolvimento local com ngrok

Para expor o servidor local à internet durante o desenvolvimento:

```bash
ngrok http 3000
```

Copie a URL gerada (ex: `https://abcd1234.ngrok.io`) e coloque em `HOOK_URL` no `.env`.

---

## Registrar o hook na Carmen Cloud

Execute **uma única vez** para registrar a URL do webhook:

```bash
node src/setup-hook.js
```

---

## Subir o servidor

```bash
node src/server.js
# ou
npm start
```

---

## Payload da Carmen Cloud

Na primeira execução, o `req.body` completo é logado no console. A estrutura esperada é:

```json
{
  "data": {
    "vehicles": [
      {
        "plate": {
          "unicodeText": "ABC1234",
          "country": "BRA"
        }
      }
    ]
  }
}
```

Caso a estrutura real difira, ajuste a extração em `src/server.js`.
