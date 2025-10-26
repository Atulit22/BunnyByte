const API_URL = 'http://localhost:5000/api';

export const api = {
  // Auth endpoints
  signup: async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return response.json();
  },

  login: async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  // User endpoints
  getProfile: async (userId: number) => {
    const response = await fetch(`${API_URL}/users/${userId}`);
    return response.json();
  },

  updateProfile: async (userId: number, username: string, email: string) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });
    return response.json();
  },

  getLeaderboard: async () => {
    const response = await fetch(`${API_URL}/users/leaderboard`);
    return response.json();
  },

  // Challenge endpoints
  getAllChallenges: async () => {
    const response = await fetch(`${API_URL}/challenges`);
    return response.json();
  },

  getChallengesByDifficulty: async (difficulty: string) => {
    const response = await fetch(`${API_URL}/challenges/difficulty/${difficulty}`);
    return response.json();
  },

  getChallenge: async (challengeId: number) => {
    const response = await fetch(`${API_URL}/challenges/${challengeId}`);
    return response.json();
  },

  createChallenge: async (title: string, description: string, difficulty: string, points: number) => {
    const response = await fetch(`${API_URL}/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, difficulty, points })
    });
    return response.json();
  },

  // Progress endpoints
  createProgress: async (userId: number, challengeId: number, status: string = 'Not Started', score: number = 0) => {
    const response = await fetch(`${API_URL}/progress/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, challengeId, status, score })
    });
    return response.json();
  },

  updateProgress: async (userId: number, challengeId: number, status: string, score: number, submitted_code: string) => {
    const response = await fetch(`${API_URL}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, challengeId, status, score, submitted_code })
    });
    return response.json();
  },

  getProgress: async (userId: number) => {
    const response = await fetch(`${API_URL}/progress/${userId}`);
    return response.json();
  },

  getFastestCompletions: async (challengeId: number) => {
    const response = await fetch(`${API_URL}/progress/fastest/${challengeId}`);
    return response.json();
  }
};
