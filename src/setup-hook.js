import 'dotenv/config';
import { StorageAndHookAPIClient } from '@adaptive-recognition/carmen-cloud-client';

const apiKey = process.env.CARMEN_API_KEY;
const region = process.env.CARMEN_REGION ?? 'sam';
const hookUrl = process.env.HOOK_URL;

if (!apiKey || !hookUrl) {
  console.error('[setup-hook] CARMEN_API_KEY e HOOK_URL são obrigatórios no .env');
  process.exit(1);
}

const client = new StorageAndHookAPIClient({ apiKey });

try {
  const result = await client.createHook({
    hookUrl,
    apis: ['vehicle'],
  });
  console.log('[setup-hook] Hook registrado com sucesso:', result);
} catch (err) {
  console.error('[setup-hook] Erro ao registrar hook:', err);
  process.exit(1);
}
