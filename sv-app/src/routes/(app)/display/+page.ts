import type { PageLoad } from './$types';
import type { DisplaySampleData } from '$lib/display/types';

export const prerender = false;
export const ssr = false;

const legendRows: DisplaySampleData['legend']['rows'] = [
	{ color: '#4B0082', label: 'INTJ', fillPercent: 0, count: 0 },
	{ color: '#6495ED', label: 'INTP', fillPercent: 0, count: 0 },
	{ color: '#FF4500', label: 'ENTJ', fillPercent: 0, count: 0 },
	{ color: '#FF00FF', label: 'ENTP', fillPercent: 0, count: 0 },
	{ color: '#00A86B', label: 'INFJ', fillPercent: 0, count: 0 },
	{ color: '#DA70D6', label: 'INFP', fillPercent: 0, count: 0 },
	{ color: '#FC913A', label: 'ENFJ', fillPercent: 0, count: 0 },
	{ color: '#92FE9D', label: 'ENFP', fillPercent: 0, count: 0 },
	{ color: '#95A5A6', label: 'ISTJ', fillPercent: 0, count: 0 },
	{ color: '#BDB76B', label: 'ISFJ', fillPercent: 0, count: 0 },
	{ color: '#4682B4', label: 'ESTJ', fillPercent: 0, count: 0 },
	{ color: '#FFB6C1', label: 'ESFJ', fillPercent: 0, count: 0 },
	{ color: '#4A4A4A', label: 'ISTP', fillPercent: 0, count: 0 },
	{ color: '#00CED1', label: 'ISFP', fillPercent: 0, count: 0 },
	{ color: '#FF2400', label: 'ESTP', fillPercent: 0, count: 0 },
	{ color: '#7B68EE', label: 'ESFP', fillPercent: 0, count: 0 }
];

const sample: DisplaySampleData = {
	header: {
		title: 'Colorfield',
		subtitle: 'MBTI · Emotion · Particle Art',
		emotionBadge: '● FACE TRACKING',
		cameraToggleOff: '◎ 摄像头 OFF',
		cameraToggleOn: '◎ 摄像头 ON',
		handBadge: '✋ HAND TRACKING INIT'
	},
	legend: {
		title: 'Present',
		rows: legendRows
	},
	hints: {
		interaction: 'Try smiling · Pinch your fingers and move your hands',
		waiting: 'Waiting for participants to join...'
	},
	sessionControls: {
		buttonLabel: '⊕ 新场次 / 历史'
	},
	footer: {
		participantsLabel: 'Participants',
		participantCount: 0,
		scanToJoinLabel: 'SCAN TO JOIN',
		qrHintLines: ['在活动管理中', '设置局域网 IP']
	},
	sessionPanel: {
		closeLabel: '关闭场次管理',
		title: '活动场次管理',
		newSessionPlaceholder: '新活动名称（可留空）',
		newSessionButtonLabel: '开始新场次',
		ipPlaceholder: 'PC 局域网 IP（如 192.168.0.68）',
		generateQrButtonLabel: '生成二维码',
		qrHint: 'SCAN TO JOIN · 手机扫码加入',
		historyTitle: '历史记录',
		emptyHistory: '暂无历史记录'
	}
};

export const load: PageLoad = () => {
	return {
		sample
	};
};
