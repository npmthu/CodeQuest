import 'dotenv/config';
import express from 'express';
import apiRoutes from './routes';
import corsMiddleware from './middleware/cors';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);
app.use(corsMiddleware);

// API routes mounted under /api
app.use('/api', apiRoutes);

// simple health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// centralized error handler (should be last)
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);

// start when run directly (keeps ability to import app in tests)
if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

export default app;