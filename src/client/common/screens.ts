export type ScreenName = 'welcome' | 'mbti' | 'result';

export function showScreen(name: ScreenName): void {
  document.querySelectorAll<HTMLElement>('.screen').forEach((screen) => {
    screen.classList.add('hidden');
  });

  const target = document.getElementById(`s-${name}`);
  if (!target) {
    throw new Error(`Missing screen #s-${name}`);
  }

  target.classList.remove('hidden');
}
