import type { LuckyColorPayload, MbtiCode, MbtiLetter, MbtiSelection, MobileCardGradient, MobilePageData } from './mobile.types';
import { roundRect, mix, lighten } from './mobile.utils';

export function computeCardGradient(
	selectionState: MbtiSelection,
	mbti: MbtiCode | null,
	source: MobilePageData
): MobileCardGradient {
	if (mbti) {
		const main = source.mbti.colors[mbti];
		return {
			c0: lighten(main, 0.55),
			c1: lighten(main, 0.25),
			c2: mix(main, source.mbti.letterColors[mbti[2] as MbtiLetter], 0.25),
			c3: main
		};
	}

	if (selectionState.some(Boolean)) {
		const picks = selectionState.map((item) => (item ? source.mbti.letterColors[item] : null));
		const fallback = '#cfd2de';
		return {
			c0: picks[0] ? lighten(picks[0], 0.6) : '#eceef5',
			c1: picks[1] ? lighten(picks[1], 0.35) : picks[0] ? lighten(picks[0], 0.4) : '#dcdee7',
			c2: picks[2] ? lighten(picks[2], 0.1) : picks[1] ? lighten(picks[1], 0.15) : '#cfd2de',
			c3: picks[3] || picks[2] || picks[1] || picks[0] || fallback
		};
	}

	return {
		c0: '#eceef5',
		c1: '#dcdee7',
		c2: '#cfd2de',
		c3: '#bec2d2'
	};
}

export function renderMobileHoloCard(incoming: LuckyColorPayload, source: MobilePageData): string | null {
	if (typeof document === 'undefined') {
		return null;
	}

	const mbti = incoming.mbti;
	const color = incoming.color || source.mbti.colors[mbti];
	const nickname = incoming.nickname || source.mbti.names[mbti];
	const phrase = incoming.luckyPhrase || source.copy.resultTagline;

	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	if (!context) {
		return null;
	}

	const width = 1080;
	const height = 1920;
	canvas.width = width;
	canvas.height = height;

	const cardWidth = width - 120;
	const cardHeight = height - 220;
	const cardX = (width - cardWidth) / 2;
	const cardY = (height - cardHeight) / 2 - 20;
	const radius = 56;

	const pageBg = context.createRadialGradient(width * 0.5, 0, 0, width * 0.5, height * 0.3, width);
	pageBg.addColorStop(0, '#ffffff');
	pageBg.addColorStop(1, '#f4f5f8');
	context.fillStyle = pageBg;
	context.fillRect(0, 0, width, height);

	context.save();
	context.shadowColor = 'rgba(40,50,80,0.22)';
	context.shadowBlur = 80;
	context.shadowOffsetY = 30;
	context.fillStyle = '#fff';
	roundRect(context, cardX, cardY, cardWidth, cardHeight, radius);
	context.fill();
	context.restore();

	context.save();
	roundRect(context, cardX, cardY, cardWidth, cardHeight, radius);
	context.clip();

	const top = lighten(color, 0.55);
	const upper = lighten(color, 0.25);
	const mid = color;
	const gradient = context.createLinearGradient(0, cardY, 0, cardY + cardHeight);
	gradient.addColorStop(0, top);
	gradient.addColorStop(0.35, upper);
	gradient.addColorStop(0.75, mid);
	gradient.addColorStop(1, mid);
	context.fillStyle = gradient;
	context.fillRect(cardX, cardY, cardWidth, cardHeight);

	const highlight = context.createLinearGradient(0, cardY, 0, cardY + cardHeight * 0.4);
	highlight.addColorStop(0, 'rgba(255,255,255,0.28)');
	highlight.addColorStop(1, 'rgba(255,255,255,0)');
	context.fillStyle = highlight;
	context.fillRect(cardX, cardY, cardWidth, cardHeight * 0.4);

	context.textBaseline = 'top';
	context.textAlign = 'left';
	context.fillStyle = 'rgba(255,255,255,0.95)';
	context.font = '600 26px Inter, sans-serif';
	context.fillText('COLORFIELD', cardX + 60, cardY + 60);
	context.fillStyle = 'rgba(255,255,255,0.75)';
	context.font = '300 22px Inter, sans-serif';
	context.fillText('MBTI · PARTICLE ART', cardX + 60, cardY + 96);

	const now = new Date();
	const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
	context.textAlign = 'right';
	context.fillStyle = 'rgba(255,255,255,0.75)';
	context.font = '300 22px Inter, sans-serif';
	context.fillText(timestamp, cardX + cardWidth - 60, cardY + 96);
	context.fillStyle = 'rgba(255,255,255,0.95)';
	context.font = '600 26px Inter, sans-serif';
	context.fillText('Sixteen Personalities', cardX + cardWidth - 60, cardY + 60);

	context.textAlign = 'center';
	context.textBaseline = 'middle';
	const centerY = cardY + cardHeight * 0.42;
	context.fillStyle = 'rgba(0,0,0,0.18)';
	context.font = '900 360px Inter, Arial Black, sans-serif';
	context.fillText(mbti, width / 2 + 6, centerY + 8);
	context.fillStyle = '#ffffff';
	context.fillText(mbti, width / 2, centerY);

	if (nickname) {
		context.fillStyle = 'rgba(255,255,255,0.98)';
		context.font = '500 72px "PingFang SC", "Hiragino Sans GB", sans-serif';
		context.fillText(nickname, width / 2, cardY + cardHeight * 0.7);
	}

	if (phrase) {
		context.fillStyle = 'rgba(255,255,255,0.8)';
		context.font = '300 44px "PingFang SC", "Hiragino Sans GB", serif';
		context.fillText(phrase, width / 2, cardY + cardHeight * 0.76);
	}

	context.textBaseline = 'bottom';
	context.textAlign = 'left';
	context.fillStyle = 'rgba(255,255,255,0.65)';
	context.font = '300 18px Inter, sans-serif';
	context.fillText(source.copy.resultTagline, cardX + 60, cardY + cardHeight - 95);
	context.fillStyle = 'rgba(255,255,255,0.9)';
	context.font = '600 28px Inter, sans-serif';
	context.fillText(mbti, cardX + 60, cardY + cardHeight - 60);

	context.textAlign = 'right';
	context.fillStyle = 'rgba(255,255,255,0.6)';
	context.font = '300 18px Inter, sans-serif';
	context.fillText(source.copy.resultSite, cardX + cardWidth - 60, cardY + cardHeight - 95);
	context.fillStyle = 'rgba(255,255,255,0.95)';
	context.font = '500 28px Inter, sans-serif';
	context.fillText(source.copy.resultHandle, cardX + cardWidth - 60, cardY + cardHeight - 60);

	context.restore();

	context.save();
	roundRect(context, cardX, cardY, cardWidth, cardHeight, radius);
	context.clip();
	context.globalAlpha = 0.06;
	for (let index = 0; index < 3000; index += 1) {
		context.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
		context.fillRect(cardX + Math.random() * cardWidth, cardY + Math.random() * cardHeight, 1.5, 1.5);
	}
	context.restore();

	return canvas.toDataURL('image/jpeg', 0.92);
}

// utility functions (roundRect, mix, lighten) moved to `mobile.utils.ts`
