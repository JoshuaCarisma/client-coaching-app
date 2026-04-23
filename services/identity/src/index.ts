import { Hono } from 'hono';
import { health } from './routes/health.js';

const app = new Hono();

app.route('/health', health);

export { app };
