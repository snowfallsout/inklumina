import type { MbtiCode } from '../shared/contracts';

export const MBTI_COLORS: Record<MbtiCode, string> = {
	INTJ: '#4B0082', INTP: '#6495ED', ENTJ: '#FF4500', ENTP: '#FF00FF',
	INFJ: '#00A86B', INFP: '#DA70D6', ENFJ: '#FC913A', ENFP: '#92FE9D',
	ISTJ: '#95A5A6', ISFJ: '#BDB76B', ESTJ: '#4682B4', ESFJ: '#FFB6C1',
	ISTP: '#4A4A4A', ISFP: '#00CED1', ESTP: '#FF2400', ESFP: '#7B68EE',
};

export const MBTI_NAMES: Record<MbtiCode, string> = {
	INTJ: '战略家', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
	INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
	ISTJ: '检察官', ISFJ: '守护者', ESTJ: '总经理', ESFJ: '执政官',
	ISTP: '鉴赏家', ISFP: '探险家', ESTP: '企业家', ESFP: '表演者',
};

export const MBTI_LUCKY_PHRASES: Record<MbtiCode, string> = {
	INTJ: '深邃星河', INTP: '量子涟漪', ENTJ: '赤焰烈炬', ENTP: '橙光裂变',
	INFJ: '紫境幽光', INFP: '蔷薇共鸣', ENFJ: '黄金旋律', ENFP: '荧光奇境',
	ISTJ: '蓝海稳浪', ISFJ: '碧玉守护', ESTJ: '烈红征途', ESFJ: '樱粉温暖',
	ISTP: '银弦孤鸣', ISFP: '兰紫自由', ESTP: '电光闪耀', ESFP: '霓虹盛放',
};
