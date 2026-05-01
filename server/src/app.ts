import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import playlistRouter from './routes/playlist.js';
import gameRouter from './routes/game.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://127.0.0.1:5173' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/api/playlist', playlistRouter);
app.use('/api/game', gameRouter);

export default app;
