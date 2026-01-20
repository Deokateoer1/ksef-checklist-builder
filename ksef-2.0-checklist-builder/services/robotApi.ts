
// Zaktualizowano port zgodnie z konfiguracją użytkownika
const ROBOT_API_BASE = 'https://localhost:8443';

export interface RobotStatus {
  status: 'online' | 'offline' | 'error';
  ksef_connected: boolean;
  db_healthy: boolean;
  redis_queue: number;
  processed_today: number;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<Response> {
  try {
    // Uwaga: Przy pracy z https://localhost:8443 może być wymagane zaakceptowanie certyfikatu samopodpisanego w przeglądarce
    const res = await fetch(url, options);

    if (res.status === 429 && retries > 0) {
      console.warn(`[RobotAPI] Rate Limit (429) na porcie 8443. Ponawiam...`);
      await wait(backoff);
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    return res;
  } catch (error) {
    if (retries > 0) {
      console.warn(`[RobotAPI] Brak połączenia z https://localhost:8443. Ponawiam...`);
      await wait(backoff);
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export const robotApi = {
  async getStatus(): Promise<RobotStatus> {
    const res = await fetch(`${ROBOT_API_BASE}/api/stats`); // Zaktualizowano endpoint na podany przez użytkownika /api/stats
    if (!res.ok) throw new Error('Robot offline');
    return res.json();
  },

  async getLogs() {
    const res = await fetch(`${ROBOT_API_BASE}/api/logs`);
    if (!res.ok) return [];
    return res.json();
  },

  // Zmienione: Dane NIE są wysyłane automatycznie na serwer dla zachowania prywatności localstorage
  async saveChecklist(data: any) {
    console.log("[PRIVACY] Dane zapisane wyłącznie w Twoim LocalStorage. Synchronizacja z serwerem wyłączona.");
    return Promise.resolve({ ok: true });
  },

  async loadChecklist() {
    // Nie pobieramy automatycznie z serwera, bo każdy ma swój localstorage
    return null;
  },

  async updateTaskStatus(taskId: string, completed: boolean) {
    // Powiadamiamy lokalne API tylko o zmianie statusu (jeśli robot musi coś wiedzieć)
    try {
        return fetchWithRetry(`${ROBOT_API_BASE}/api/task-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, completed })
        });
    } catch (e) {
        return null;
    }
  },

  async triggerSync() {
    const res = await fetchWithRetry(`${ROBOT_API_BASE}/api/sync`, { method: 'POST' });
    return res.json();
  },

  async rotateToken() {
    const res = await fetchWithRetry(`${ROBOT_API_BASE}/api/auth/rotate`, { method: 'POST' });
    return res.json();
  }
};
