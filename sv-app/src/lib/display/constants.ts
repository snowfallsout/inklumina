export const MBTI_COLORS = {
	INTJ: '#4B0082',
	INTP: '#6495ED',
	ENTJ: '#FF4500',
	ENTP: '#FF00FF',
	INFJ: '#00A86B',
	INFP: '#DA70D6',
	ENFJ: '#FC913A',
	ENFP: '#92FE9D',
	ISTJ: '#95A5A6',
	ISFJ: '#BDB76B',
	ESTJ: '#4682B4',
	ESFJ: '#FFB6C1',
	ISTP: '#4A4A4A',
	ISFP: '#00CED1',
	ESTP: '#FF2400',
	ESFP: '#7B68EE'
} as const;

export type MbtiCode = keyof typeof MBTI_COLORS;

export const MBTI_ORDER = [
	'INTJ', 'INTP', 'ENTJ', 'ENTP',
	'INFJ', 'INFP', 'ENFJ', 'ENFP',
	'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
	'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const;

export const MBTI_PALETTES = {
	INTJ: { core: '#1A0A2E', mid: '#4B0082', edge: '#E0B0FF' },
	INTP: { core: '#002366', mid: '#6495ED', edge: '#F0F8FF' },
	ENTJ: { core: '#8B0000', mid: '#FF4500', edge: '#FFD700' },
	ENTP: { core: '#FFD700', mid: '#FF00FF', edge: '#00FFFF' },
	INFJ: { core: '#2E0854', mid: '#00A86B', edge: '#F5F5DC' },
	INFP: { core: '#FF69B4', mid: '#DA70D6', edge: '#98FB98' },
	ENFJ: { core: '#FF4E50', mid: '#FC913A', edge: '#F9D423' },
	ENFP: { core: '#00D2FF', mid: '#92FE9D', edge: '#FF758C' },
	ISTJ: { core: '#2C3E50', mid: '#95A5A6', edge: '#ECF0F1' },
	ISFJ: { core: '#556B2F', mid: '#BDB76B', edge: '#FFFACD' },
	ESTJ: { core: '#000080', mid: '#4682B4', edge: '#D3D3D3' },
	ESFJ: { core: '#FF7F50', mid: '#FFB6C1', edge: '#E6E6FA' },
	ISTP: { core: '#1C1C1C', mid: '#4A4A4A', edge: '#00CCCC' },
	ISFP: { core: '#FF007F', mid: '#00CED1', edge: '#FFFFE0' },
	ESTP: { core: '#FFD700', mid: '#FF2400', edge: '#2F4F4F' },
	ESFP: { core: '#FF00FF', mid: '#7B68EE', edge: '#7FFFD4' }
} as const;

export const AMBIENT_COLS = ['#003153', '#C8A2C8', '#F9A602', '#9DC183', '#40E0D0'];

export const HAND_CONNECTIONS: Array<[number, number]> = [
	[0, 1], [1, 2], [2, 3], [3, 4],
	[0, 5], [5, 6], [6, 7], [7, 8],
	[5, 9], [9, 10], [10, 11], [11, 12],
	[9, 13], [13, 14], [14, 15], [15, 16],
	[13, 17], [17, 18], [18, 19], [19, 20],
	[0, 17]
];

export const SMILE_EMOJIS = [
	'🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤',
	'🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔲', '🔳',
	'✨', '💫', '⚡', '🔥', '💥', '🌟', '⭐', '🌈',
	'☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',
	'❄️', '☃️', '⛄', '🌬️', '💨', '🌀', '🌊', '💧', '💦', '☔',
	'⛱️', '🌙', '🌛', '🌜', '🌚', '🌝', '🌞', '☄️', '🌪️',
	'🌱', '🌿', '🍀', '🍃', '🍂', '🍁', '🌵', '🌾', '🎋', '🎍',
	'🌺', '🌸', '🌼', '🌻', '🌹', '🥀', '🌷', '🪷', '🪴',
	'🌲', '🌳', '🌴', '🪵', '🪨'
];
