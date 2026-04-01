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

app.post('/api/webhook', express.text({ type: '*/*' }), async (req, res) => {
  console.log('[API Webhook] SubscriptionConfirmation recebido, confirmando:', req.body);
  try {
    const envelope = JSON.parse(req.body);
    const type = envelope?.Type;

    if (type === 'SubscriptionConfirmation') {
      console.log('[API Webhook] SubscriptionConfirmation recebido, confirmando:', envelope.SubscribeURL);
      try {
        await fetch(envelope.SubscribeURL);
        console.log('[API Webhook] Subscription confirmada com sucesso.');
      } catch (err) {
        console.error('[API Webhook] Erro ao confirmar subscription:', err);
      }
      return res.status(200).send('Confirmed');
    }

    if (type === 'Notification') {
      const payload = JSON.parse(envelope.Message);
      const vehicles = payload?.event?.data?.vehicles ?? [];

      for (const vehicle of vehicles) {
        const plate = vehicle?.plate?.unicodeText;
        const country = vehicle?.plate?.country;

        if (!plate) continue;

        console.log(`[API Webhook] Placa: ${plate} | País: ${country ?? 'N/A'}`);
        stats.totalReceived++;
        stats.lastPlate = plate;
        stats.lastReceivedAt = new Date().toISOString();
      }
    }
  } catch (err) {
    console.error('[API Webhook] Erro ao processar requisição:', err);
  }

  res.status(200).send('OK');
});

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`[Servidor] Rodando na porta ${PORT}`);
  });
}

export default app;
