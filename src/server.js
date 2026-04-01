import 'dotenv/config';
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// import { sendToTelegram } from './telegram.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

const stats = { totalReceived: 0, lastPlate: null, lastReceivedAt: null, errors: 0 };
const startedAt = new Date().toISOString();

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/status.html'));
});

app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    startedAt,
    ...stats,
  });
});

app.post('/webhook', async (req, res) => {
  const body = req.body;
  const type = body?.Type;

  // 1. Confirmação de subscription do SNS
  if (type === 'SubscriptionConfirmation') {
    const subscribeUrl = body.SubscribeURL;
    console.log('[Webhook] SubscriptionConfirmation recebido, confirmando:', subscribeUrl);
    try {
      await fetch(subscribeUrl);
      console.log('[Webhook] Subscription confirmada com sucesso.');
    } catch (err) {
      console.error('[Webhook] Erro ao confirmar subscription:', err);
      stats.errors++;
    }
    return res.sendStatus(200);
  }

  // 2. Notificação normal do SNS
  if (type === 'Notification') {
    let payload;
    try {
      payload = JSON.parse(body.Message);
    } catch (err) {
      console.error('[Webhook] Erro ao fazer parse do Message:', err);
      stats.errors++;
      return res.sendStatus(200);
    }

    console.log('[Webhook] Notificação recebida:', JSON.stringify(payload, null, 2));

    const vehicles = payload?.data?.vehicles ?? [];

    if (vehicles.length === 0) {
      console.log('[Webhook] Nenhum veículo encontrado no payload.');
      return res.sendStatus(200);
    }

    for (const vehicle of vehicles) {
      const plate = vehicle?.plate?.unicodeText;
      const country = vehicle?.plate?.country;

      if (!plate) {
        console.log('[Webhook] Veículo sem placa identificada, ignorando.');
        continue;
      }

      console.log(`[Webhook] Placa: ${plate} | País: ${country ?? 'N/A'}`);
      stats.totalReceived++;
      stats.lastPlate = plate;
      stats.lastReceivedAt = new Date().toISOString();
      // await sendToTelegram(plate, country ?? 'N/A');
    }

    return res.sendStatus(200);
  }

  // 3. Qualquer outro tipo
  console.log(`[Webhook] Tipo desconhecido recebido: ${type}`);
  res.sendStatus(200);
});

// Local
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`[Servidor] Rodando na porta ${PORT}`);
  });
}

export default app;
