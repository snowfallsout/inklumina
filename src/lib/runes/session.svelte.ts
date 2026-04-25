// @ts-nocheck
export const session = $state({
  sessionName: null as string | null,
  history: [] as any[],
  panelOpen: false
});

export function setSessionName(name: string | null) {
  session.sessionName = name;
}

export function setPanelOpen(open: boolean) {
  session.panelOpen = open;
}

export async function loadHistory(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('cf_session_history');
    if (!raw) {
      session.history = [];
      return;
    }
    const parsed = JSON.parse(raw);
    session.history = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    session.history = [];
  }
}

export async function createSession(name?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const id = name && name.length ? name : `s_${Date.now()}_${Math.floor(Math.random() * 9000) + 1000}`;
  const entry = { id, name: name || id, createdAt: Date.now() };
  const MAX_HISTORY = 30;
  const arr = [entry, ...session.history.filter((h: any) => h.id !== entry.id)];
  if (arr.length > MAX_HISTORY) arr.length = MAX_HISTORY;
  session.history = arr;
  try {
    localStorage.setItem('cf_session_history', JSON.stringify(arr));
  } catch (e) {}
  setSessionName(entry.name);
}

export function getJoinUrl(name?: string) {
  if (!name) return '';
  if (typeof window === 'undefined') return `/join/${name}`;
  return `${location.origin}/join/${name}`;
}

export function deleteSession(id: string) {
  if (typeof window === 'undefined') return;
  const removed = session.history.find((item: any) => item.id === id) ?? null;
  const cur = session.history.filter((i: any) => i.id !== id);
  session.history = cur;
  try {
    localStorage.setItem('cf_session_history', JSON.stringify(cur));
  } catch (e) {}
  if (session.sessionName && removed && session.sessionName === removed.name) {
    setSessionName(cur[0]?.name ?? null);
  } else if (cur.length === 0) {
    setSessionName(null);
  }
}

export function viewSession(id: string) {
  const entry = session.history.find((item: any) => item.id === id);
  setSessionName(entry?.name ?? id);
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  session.history = [];
  try {
    localStorage.removeItem('cf_session_history');
  } catch (e) {}
  setSessionName(null);
}
