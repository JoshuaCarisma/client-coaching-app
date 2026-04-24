import { Hono } from 'hono';
import { health } from './routes/health.js';
import { exercises } from './routes/exercises.js';

const app = new Hono();

app.route('/health', health);
app.route('/exercises', exercises);

export { app };
