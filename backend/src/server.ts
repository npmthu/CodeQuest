import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// CORS - allow all in development
app.use(cors({
  origin: true, // Allow all origins in dev
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

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