import { serve } from '@hono/node-server';
import { app } from './index.js';

const PORT = parseInt(process.env.PORT ?? '3002', 10);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`training service running on port ${PORT}`);
});
