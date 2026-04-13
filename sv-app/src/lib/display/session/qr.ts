import QRCode from 'qrcode';
import { buildJoinUrl, STORAGE_KEY } from '$lib/display/session';

export function restoreSavedIp(): void {
	const saved = window.localStorage.getItem(STORAGE_KEY);
	if (!saved) return;
	const input = document.getElementById('sp-ip-input') as HTMLInputElement | null;
	if (input) input.value = saved;
}

export async function generateJoinQr(): Promise<void> {
	const input = document.getElementById('sp-ip-input') as HTMLInputElement | null;
	if (!input) return;
	const raw = input.value.trim();
	if (!raw) {
		window.alert('请先填写 PC 的局域网 IPv4 地址（ipconfig → WLAN 适配器 IPv4 Address）');
		return;
	}

	const host = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
	if (!/^[\d.]+(:\d+)?$/.test(host)) {
		window.alert('IP 格式看起来不对，示例：192.168.0.68  或  192.168.0.68:3000');
		return;
	}
	const url = buildJoinUrl(raw);
	window.localStorage.setItem(STORAGE_KEY, raw);

	const wrap = document.getElementById('sp-qr-wrap');
	const qrBox = document.getElementById('sp-qr');
	if (!wrap || !qrBox) return;
	const dataUrl = await QRCode.toDataURL(url, {
		width: 180,
		margin: 1,
		color: { dark: '#000000', light: '#ffffff' }
	});
	qrBox.innerHTML = `<img alt="Session join QR code" src="${dataUrl}" />`;
	const urlElement = document.getElementById('sp-qr-url');
	if (urlElement) urlElement.textContent = url;
	wrap.style.display = 'block';
	refreshCornerQr();
}

export async function refreshCornerQr(): Promise<void> {
	const box = document.getElementById('corner-qr');
	const urlElement = document.getElementById('corner-qr-url');
	const hint = document.getElementById('corner-qr-hint');
	if (!box) return;
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) {
		box.innerHTML = '';
		if (urlElement) urlElement.textContent = '';
		if (hint) hint.style.display = '';
		return;
	}

	const url = buildJoinUrl(raw);
	box.innerHTML = '';
	if (hint) hint.style.display = 'none';
	const dataUrl = await QRCode.toDataURL(url, {
		width: 120,
		margin: 1,
		color: { dark: '#000000', light: '#ffffff' }
	});
	box.innerHTML = `<img alt="Corner QR code" src="${dataUrl}" />`;
	if (urlElement) urlElement.textContent = url;
}
