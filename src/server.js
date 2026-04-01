import 'dotenv/config';
import express from 'express';
import { readFileSync } from 'fs';
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
  console.log('[Webhook] Payload recebido:', JSON.stringify(req.body, null, 2));

  const vehicles = req.body?.data?.vehicles ?? [];

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
