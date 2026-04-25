export let sessionName = $state<string | null>(null);
export let history = $state<any[]>([]);
export let panelOpen = $state<boolean>(false);

export function setSessionName(name: string | null) {
  sessionName = name;
}

export function setPanelOpen(open: boolean) {
  panelOpen = open;
}

export async function loadHistory(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('cf_session_history');
    if (!raw) {
      history = [];
      return;
    }
    const parsed = JSON.parse(raw);
    history = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    history = [];
  }
}

export async function createSession(name?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const id = name && name.length ? name : `s_${Date.now()}_${Math.floor(Math.random() * 9000) + 1000}`;
  const entry = { id, name: name || id, createdAt: Date.now() };
  const MAX_HISTORY = 30;
  const arr = [(entry), ...history.filter((h: any) => h.id !== entry.id)];
  if (arr.length > MAX_HISTORY) arr.length = MAX_HISTORY;
  history = arr;
  try { localStorage.setItem('cf_session_history', JSON.stringify(arr)); } catch (e) {}
  setSessionName(entry.name);
}

export function getJoinUrl(name?: string) {
  if (!name) return '';
  if (typeof window === 'undefined') return `/join/${name}`;
  return `${location.origin}/join/${name}`;
}

export function deleteSession(id: string) {
  if (typeof window === 'undefined') return;
  const removed = history.find((item: any) => item.id === id) ?? null;
  const cur = history.filter((i: any) => i.id !== id);
  history = cur;
  try { localStorage.setItem('cf_session_history', JSON.stringify(cur)); } catch (e) {}
  if (sessionName && removed && sessionName === removed.name) {
    setSessionName(cur[0]?.name ?? null);
  } else if (cur.length === 0) {
    setSessionName(null);
  }
}

export function viewSession(id: string) {
  const entry = history.find((item: any) => item.id === id);
  setSessionName(entry?.name ?? id);
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  history = [];
  try { localStorage.removeItem('cf_session_history'); } catch (e) {}
  setSessionName(null);
}
