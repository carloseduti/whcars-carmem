import 'dotenv/config';
import express from 'express';
// import { sendToTelegram } from './telegram.js';

const app = express();
app.use(express.json());

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
