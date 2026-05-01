import { Router } from 'express';
import { randomUUID } from 'crypto';
import { fetchAllTracks } from '../lib/tracks.js';
import { fuzzyMatch } from '../lib/fuzzyMatch.js';
import type { GameRound, GuessResponse } from '../types/index.js';

const router = Router();
const rounds = new Map<string, GameRound>();
const MAX_ATTEMPTS = 6;

router.post('/start', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'No authorization token' });
    return;
  }

  const { playlistId } = req.body;
  if (!playlistId) {
    res.status(400).json({ error: 'playlistId required' });
    return;
  }

  try {
    const tracks = await fetchAllTracks(playlistId, token);

    if (tracks.length === 0) {
      res.status(400).json({ error: 'No playable tracks found' });
      return;
    }

    const answer = tracks[Math.floor(Math.random() * tracks.length)];
    const roundId = randomUUID();

    rounds.set(roundId, {
      id: roundId,
      playlistId,
      answer,
      attemptNumber: 0,
      guesses: [],
      status: 'playing',
    });

    res.json({
      roundId,
      trackCount: tracks.length,
      trackUri: answer.uri,
    });
  } catch (error: any) {
    console.error('Game start error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

router.post('/:roundId/guess', (req, res) => {
  const round = rounds.get(req.params.roundId);
  if (!round) {
    res.status(404).json({ error: 'Round not found' });
    return;
  }
  if (round.status !== 'playing') {
    res.status(400).json({ error: 'Round already ended' });
    return;
  }

  const { guess } = req.body;
  if (!guess || typeof guess !== 'string') {
    res.status(400).json({ error: 'guess required' });
    return;
  }

  const { isCorrect, similarity } = fuzzyMatch(guess, round.answer.name);
  round.guesses.push({ text: guess, isSkip: false, isCorrect });
  round.attemptNumber++;

  const gameOver = isCorrect || round.attemptNumber >= MAX_ATTEMPTS;
  if (isCorrect) round.status = 'won';
  else if (gameOver) round.status = 'lost';

  const response: GuessResponse = {
    correct: isCorrect,
    similarity,
    attemptNumber: round.attemptNumber,
    gameOver,
    ...(gameOver ? { answer: round.answer } : {}),
  };

  res.json(response);
});

router.post('/:roundId/skip', (_req, res) => {
  const round = rounds.get(_req.params.roundId);
  if (!round) {
    res.status(404).json({ error: 'Round not found' });
    return;
  }
  if (round.status !== 'playing') {
    res.status(400).json({ error: 'Round already ended' });
    return;
  }

  round.guesses.push({ text: '', isSkip: true, isCorrect: false });
  round.attemptNumber++;

  const gameOver = round.attemptNumber >= MAX_ATTEMPTS;
  if (gameOver) round.status = 'lost';

  const response: GuessResponse = {
    correct: false,
    similarity: 0,
    attemptNumber: round.attemptNumber,
    gameOver,
    ...(gameOver ? { answer: round.answer } : {}),
  };

  res.json(response);
});

router.get('/:roundId', (req, res) => {
  const round = rounds.get(req.params.roundId);
  if (!round) {
    res.status(404).json({ error: 'Round not found' });
    return;
  }

  res.json({
    id: round.id,
    attemptNumber: round.attemptNumber,
    guesses: round.guesses,
    status: round.status,
    ...(round.status !== 'playing' ? { answer: round.answer } : {}),
  });
});

export default router;
