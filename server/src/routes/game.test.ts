import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';

// Mock the Spotify API fetch so /start doesn't call real Spotify
vi.mock('../lib/spotify.js', () => ({
  exchangeCode: vi.fn(),
  refreshToken: vi.fn(),
  fetchFromSpotify: vi.fn().mockResolvedValue({
    id: 'playlist123',
    name: 'Test Playlist',
    images: [{ url: 'https://example.com/img.jpg' }],
    owner: { display_name: 'TestUser' },
    tracks: {
      items: [
        {
          track: {
            id: 'track1',
            uri: 'spotify:track:track1',
            name: 'Bohemian Rhapsody',
            artists: [{ name: 'Queen' }],
            album: {
              name: 'A Night at the Opera',
              images: [{ url: 'https://example.com/album.jpg' }],
            },
            duration_ms: 354000,
            is_local: false,
          },
        },
        {
          track: {
            id: 'track2',
            uri: 'spotify:track:track2',
            name: 'Yesterday',
            artists: [{ name: 'The Beatles' }],
            album: {
              name: 'Help!',
              images: [{ url: 'https://example.com/album2.jpg' }],
            },
            duration_ms: 125000,
            is_local: false,
          },
        },
      ],
      next: null,
    },
  }),
}));

async function startRound(): Promise<{ roundId: string; trackUri: string }> {
  const res = await request(app)
    .post('/api/game/start')
    .set('Authorization', 'Bearer fake-token')
    .send({ playlistId: 'playlist123' });
  return res.body;
}

describe('Game Routes', () => {
  describe('POST /api/game/start', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/game/start')
        .send({ playlistId: 'playlist123' });
      expect(res.status).toBe(401);
    });

    it('returns 400 without playlistId', async () => {
      const res = await request(app)
        .post('/api/game/start')
        .set('Authorization', 'Bearer fake-token')
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns roundId, trackCount, and trackUri on success', async () => {
      const res = await request(app)
        .post('/api/game/start')
        .set('Authorization', 'Bearer fake-token')
        .send({ playlistId: 'playlist123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('roundId');
      expect(res.body.trackCount).toBe(2);
      expect(res.body.trackUri).toMatch(/^spotify:track:/);
    });
  });

  describe('POST /api/game/:roundId/guess', () => {
    it('returns 404 for nonexistent round', async () => {
      const res = await request(app)
        .post('/api/game/nonexistent/guess')
        .send({ guess: 'something' });
      expect(res.status).toBe(404);
    });

    it('returns 400 without guess body', async () => {
      const { roundId } = await startRound();
      const res = await request(app)
        .post(`/api/game/${roundId}/guess`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns correct=true for correct guess', async () => {
      const { roundId, trackUri } = await startRound();
      // Determine the answer name based on trackUri
      const answerName = trackUri === 'spotify:track:track1'
        ? 'Bohemian Rhapsody'
        : 'Yesterday';

      const res = await request(app)
        .post(`/api/game/${roundId}/guess`)
        .send({ guess: answerName });

      expect(res.status).toBe(200);
      expect(res.body.correct).toBe(true);
      expect(res.body.similarity).toBe(1);
      expect(res.body.gameOver).toBe(true);
      expect(res.body.answer).toBeDefined();
      expect(res.body.attemptNumber).toBe(1);
    });

    it('returns correct=false for wrong guess', async () => {
      const { roundId, trackUri } = await startRound();
      // Guess the wrong song
      const wrongGuess = trackUri === 'spotify:track:track1'
        ? 'Yesterday'
        : 'Bohemian Rhapsody';

      const res = await request(app)
        .post(`/api/game/${roundId}/guess`)
        .send({ guess: wrongGuess });

      expect(res.status).toBe(200);
      expect(res.body.correct).toBe(false);
      expect(res.body.gameOver).toBe(false);
      expect(res.body.answer).toBeUndefined();
      expect(res.body.attemptNumber).toBe(1);
    });

    it('ends game after 6 wrong guesses', async () => {
      const { roundId } = await startRound();

      // Make 5 wrong guesses
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post(`/api/game/${roundId}/guess`)
          .send({ guess: 'totally wrong guess' });
        expect(res.body.gameOver).toBe(false);
      }

      // 6th wrong guess should end the game
      const finalRes = await request(app)
        .post(`/api/game/${roundId}/guess`)
        .send({ guess: 'totally wrong guess' });
      expect(finalRes.body.gameOver).toBe(true);
      expect(finalRes.body.correct).toBe(false);
      expect(finalRes.body.answer).toBeDefined();
      expect(finalRes.body.attemptNumber).toBe(6);
    });

    it('rejects guess on ended round', async () => {
      const { roundId, trackUri } = await startRound();
      const answerName = trackUri === 'spotify:track:track1'
        ? 'Bohemian Rhapsody'
        : 'Yesterday';

      // Win the round
      await request(app)
        .post(`/api/game/${roundId}/guess`)
        .send({ guess: answerName });

      // Try to guess again
      const res = await request(app)
        .post(`/api/game/${roundId}/guess`)
        .send({ guess: 'another guess' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Round already ended');
    });
  });

  describe('POST /api/game/:roundId/skip', () => {
    it('returns 404 for nonexistent round', async () => {
      const res = await request(app).post('/api/game/nonexistent/skip');
      expect(res.status).toBe(404);
    });

    it('advances attempt number on skip', async () => {
      const { roundId } = await startRound();
      const res = await request(app)
        .post(`/api/game/${roundId}/skip`);

      expect(res.status).toBe(200);
      expect(res.body.correct).toBe(false);
      expect(res.body.similarity).toBe(0);
      expect(res.body.attemptNumber).toBe(1);
      expect(res.body.gameOver).toBe(false);
    });

    it('ends game after 6 skips', async () => {
      const { roundId } = await startRound();

      for (let i = 0; i < 5; i++) {
        await request(app).post(`/api/game/${roundId}/skip`);
      }

      const res = await request(app).post(`/api/game/${roundId}/skip`);
      expect(res.body.gameOver).toBe(true);
      expect(res.body.answer).toBeDefined();
      expect(res.body.attemptNumber).toBe(6);
    });

    it('rejects skip on ended round', async () => {
      const { roundId } = await startRound();
      // Skip 6 times to end
      for (let i = 0; i < 6; i++) {
        await request(app).post(`/api/game/${roundId}/skip`);
      }
      const res = await request(app).post(`/api/game/${roundId}/skip`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/game/:roundId', () => {
    it('returns 404 for nonexistent round', async () => {
      const res = await request(app).get('/api/game/nonexistent');
      expect(res.status).toBe(404);
    });

    it('returns round state without answer while playing', async () => {
      const { roundId } = await startRound();
      const res = await request(app).get(`/api/game/${roundId}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('playing');
      expect(res.body.attemptNumber).toBe(0);
      expect(res.body.guesses).toEqual([]);
      expect(res.body.answer).toBeUndefined();
    });

    it('includes answer after game ends', async () => {
      const { roundId } = await startRound();
      // Skip 6 times to end
      for (let i = 0; i < 6; i++) {
        await request(app).post(`/api/game/${roundId}/skip`);
      }

      const res = await request(app).get(`/api/game/${roundId}`);
      expect(res.body.status).toBe('lost');
      expect(res.body.answer).toBeDefined();
      expect(res.body.attemptNumber).toBe(6);
    });

    it('tracks guess history', async () => {
      const { roundId } = await startRound();

      await request(app)
        .post(`/api/game/${roundId}/guess`)
        .send({ guess: 'wrong answer' });
      await request(app)
        .post(`/api/game/${roundId}/skip`);

      const res = await request(app).get(`/api/game/${roundId}`);
      expect(res.body.guesses).toHaveLength(2);
      expect(res.body.guesses[0].text).toBe('wrong answer');
      expect(res.body.guesses[0].isSkip).toBe(false);
      expect(res.body.guesses[1].text).toBe('');
      expect(res.body.guesses[1].isSkip).toBe(true);
    });
  });
});
