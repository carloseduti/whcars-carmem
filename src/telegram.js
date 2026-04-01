import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

export async function sendToTelegram(plate, country) {
  const text = `🚗 *Placa detectada\\!*\nPlaca: \`${plate}\`\nPaís: ${country}`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'MarkdownV2',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[Telegram] Erro ao enviar mensagem (status ${response.status}):`, body);
  }
}
