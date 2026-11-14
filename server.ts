// server.ts
import path from 'path';
import { fileURLToPath } from 'url';
import { createExpressApp } from './backend/src/app.js';
import { initDatabase } from './backend/src/config/db.js';
import { ENV } from './backend/src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log('[JourneySynth AI] Initializing server...');
  initDatabase();

  const app = createExpressApp();
  const PORT = ENV.PORT;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[JourneySynth AI] Vite middleware mounted for development.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[JourneySynth AI] Serving production static assets from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JourneySynth AI] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[JourneySynth AI] Fatal startup error:', err);
  process.exit(1);
});
