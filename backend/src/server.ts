import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import apiRoutes from './routes';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { InterviewSignalingService } from './services/interviewSignalingService';

const app = express();
const server = createServer(app);

// Initialize Socket.io signaling service
const signalingService = new InterviewSignalingService(server);

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

// Socket.io stats endpoint
app.get('/api/socket/stats', (_req, res) => {
  res.json(signalingService.getRoomStats());
});

// centralized error handler (should be last)
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);

// start when run directly (keeps ability to import app in tests)
if (require.main === module) {
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`🔥 Socket.io signaling server initialized`);
  });
}

export default app;