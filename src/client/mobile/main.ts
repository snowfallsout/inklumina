import { MBTI_COLORS, MBTI_NAMES, type Mbti } from '../../shared/constants';
import { element } from '../../shared/dom';
import { showScreen, type ScreenName } from '../common/screens';
import { createSparkleController } from '../common/sparkles';

declare const io: () => SocketLike;

interface SocketLike {
  emit(event: 'submit_mbti', payload: { mbti: Mbti }): void;
  on(event: 'lucky_color', handler: (payload: { mbti: Mbti; color: string; nickname: string; luckyPhrase: string }) => void): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
}

type DimensionLetter = 'E' | 'I' | 'N' | 'S' | 'T' | 'F' | 'J' | 'P';

type Selection = [DimensionLetter | null, DimensionLetter | null, DimensionLetter | null, DimensionLetter | null];

const socket = io();
const selection: Selection = [null, null, null, null];
const previewLetters = [
  element<HTMLDivElement>('pl-0'),
  element<HTMLDivElement>('pl-1'),
  element<HTMLDivElement>('pl-2'),
  element<HTMLDivElement>('pl-3'),
];
const submitButton = element<HTMLButtonElement>('submit-btn');
const resultScreen = element<HTMLElement>('s-result');
const sparkleCanvas = element<HTMLCanvasElement>('sparkle-cv');
const sparkleController = createSparkleController(sparkleCanvas, () => !resultScreen.classList.contains('hidden'));
const luckyOrb = element<HTMLDivElement>('r-orb');
const luckyHex = element<HTMLDivElement>('r-hex');
const luckyMbti = element<HTMLDivElement>('r-mbti');
const luckyNick = element<HTMLDivElement>('r-nick');
const colorWash = element<HTMLDivElement>('color-wash');
const orbEls = Array.from(document.querySelectorAll<HTMLElement>('.orb'));

function goTo(name: ScreenName): void {
  showScreen(name);
}

function getSelectedMbti(): Mbti | null {
  if (!selection.every(Boolean)) {
    return null;
  }

  return selection.join('') as Mbti;
}

function updatePreview(): void {
  for (let index = 0; index < previewLetters.length; index += 1) {
    const value = selection[index];
    previewLetters[index].textContent = value ?? '_';
    previewLetters[index].classList.toggle('active', value !== null);
  }
}

function tintOrbs(color?: string): void {
  for (const orb of orbEls) {
    orb.style.transition = 'background 0.6s';
    orb.style.background = color ?? '';
  }
}

function updateSubmitState(): void {
  const mbti = getSelectedMbti();
  submitButton.disabled = mbti === null;
  if (!mbti) {
    submitButton.style.borderColor = '';
    submitButton.style.boxShadow = '';
    tintOrbs();
    return;
  }

  const color = MBTI_COLORS[mbti];
  submitButton.style.borderColor = `${color}88`;
  submitButton.style.boxShadow = `0 0 30px ${color}33`;
  tintOrbs(color);
}

function pick(dim: number, value: DimensionLetter, button: HTMLButtonElement): void {
  document.querySelectorAll(`[data-d="${dim}"]`).forEach((node) => node.classList.remove('sel'));
  button.classList.add('sel');
  selection[dim] = value;
  updatePreview();
  updateSubmitState();
}

function submitMBTI(): void {
  const mbti = getSelectedMbti();
  if (!mbti) {
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = '发送中…';
  socket.emit('submit_mbti', { mbti });
}

function showResult(mbti: Mbti, color: string, nickname: string, luckyPhrase?: string): void {
  goTo('result');

  luckyOrb.style.background = color;
  luckyOrb.style.boxShadow = `0 0 80px ${color}, 0 0 160px ${color}55`;
  luckyHex.textContent = color;
  luckyHex.style.color = color;
  luckyMbti.textContent = mbti;
  luckyMbti.style.color = color;
  luckyMbti.style.textShadow = `0 0 50px ${color}`;
  luckyNick.textContent = `${nickname}${luckyPhrase ? ` · ${luckyPhrase}` : ''}`;
  colorWash.style.background = `radial-gradient(ellipse at 50% 65%, ${color}28 0%, transparent 65%)`;

  window.requestAnimationFrame(() => {
    colorWash.style.opacity = '1';
    window.setTimeout(() => luckyOrb.classList.add('show'), 80);
    window.setTimeout(() => luckyMbti.classList.add('show'), 250);
    window.setTimeout(() => luckyNick.classList.add('show'), 450);
  });

  sparkleController.start(color);
}

socket.on('lucky_color', ({ mbti, color, nickname, luckyPhrase }) => {
  showResult(mbti, color, nickname || MBTI_NAMES[mbti], luckyPhrase);
});

Object.assign(window, {
  goTo,
  pick,
  submitMBTI,
  tintOrbs,
});

updatePreview();
updateSubmitState();
