import { serve } from '@hono/node-server';
import { app } from './index.js';

const port = parseInt(process.env.PORT ?? '3001', 10);

serve({ fetch: app.fetch, port });
