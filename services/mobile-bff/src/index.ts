import { Hono } from 'hono';
import { jwtMiddleware } from '@bbc/service-identity/middleware/jwt';
import { rolesMiddleware } from '@bbc/service-identity/middleware/roles';
import { health } from './routes/health.js';

const app = new Hono();

app.use('*', jwtMiddleware);
app.use('*', rolesMiddleware);

app.route('/health', health);

export { app };
