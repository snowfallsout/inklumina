export const MBTI_COLORS = {
  INTJ: '#9D4EDD', INTP: '#00F5FF', ENTJ: '#FF073A', ENTP: '#FF6B00',
  INFJ: '#CC00FF', INFP: '#FF1493', ENFJ: '#FFD700', ENFP: '#39FF14',
  ISTJ: '#1E90FF', ISFJ: '#00FFCD', ESTJ: '#FF4500', ESFJ: '#FF69B4',
  ISTP: '#B8C0FF', ISFP: '#E040FB', ESTP: '#FFE600', ESFP: '#FF6EC7',
} as const;

export type Mbti = keyof typeof MBTI_COLORS;

export const MBTI_NAMES = {
  INTJ: '战略家', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
  INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
  ISTJ: '检察官', ISFJ: '守护者', ESTJ: '总经理', ESFJ: '执政官',
  ISTP: '鉴赏家', ISFP: '探险家', ESTP: '企业家', ESFP: '表演者',
} as const satisfies Record<Mbti, string>;

export const MBTI_LUCKY_PHRASES = {
  INTJ: '深邃星河', INTP: '量子涟漪', ENTJ: '赤焰烈炬', ENTP: '橙光裂变',
  INFJ: '紫境幽光', INFP: '蔷薇共鸣', ENFJ: '黄金旋律', ENFP: '荧光奇境',
  ISTJ: '蓝海稳浪', ISFJ: '碧玉守护', ESTJ: '烈红征途', ESFJ: '樱粉温暖',
  ISTP: '银弦孤鸣', ISFP: '兰紫自由', ESTP: '电光闪耀', ESFP: '霓虹盛放',
} as const satisfies Record<Mbti, string>;

export const MBTI_ORDER = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const satisfies readonly Mbti[];

export interface MbtiPalette {
  core: string;
  mid: string;
  outer: string;
  accent: string;
}

export const MBTI_PALETTES = {
  INTJ: { core: '#C490FF', mid: '#9D4EDD', outer: '#5B2D8E', accent: '#3A1D5C' },
  INTP: { core: '#80FFFF', mid: '#00F5FF', outer: '#007A80', accent: '#003D40' },
  ENTJ: { core: '#FF6B6B', mid: '#FF073A', outer: '#9E0024', accent: '#4D0012' },
  ENTP: { core: '#FFAA55', mid: '#FF6B00', outer: '#A04400', accent: '#502200' },
  INFJ: { core: '#E680FF', mid: '#CC00FF', outer: '#7A009A', accent: '#3D004D' },
  INFP: { core: '#FF6BAD', mid: '#FF1493', outer: '#A00D5E', accent: '#50072F' },
  ENFJ: { core: '#FFEC80', mid: '#FFD700', outer: '#A08600', accent: '#504300' },
  ENFP: { core: '#80FF6B', mid: '#39FF14', outer: '#22A00D', accent: '#115007' },
  ISTJ: { core: '#6BB8FF', mid: '#1E90FF', outer: '#1260A0', accent: '#093050' },
  ISFJ: { core: '#66FFE0', mid: '#00FFCD', outer: '#00A080', accent: '#005040' },
  ESTJ: { core: '#FF8055', mid: '#FF4500', outer: '#A02C00', accent: '#501600' },
  ESFJ: { core: '#FFA0CC', mid: '#FF69B4', outer: '#A04272', accent: '#502139' },
  ISTP: { core: '#D4DAFF', mid: '#B8C0FF', outer: '#7078A0', accent: '#383C50' },
  ISFP: { core: '#EC80FF', mid: '#E040FB', outer: '#8C289A', accent: '#46144D' },
  ESTP: { core: '#FFF066', mid: '#FFE600', outer: '#A09000', accent: '#504800' },
  ESFP: { core: '#FFA0DA', mid: '#FF6EC7', outer: '#A0447C', accent: '#50223E' },
} as const satisfies Record<Mbti, MbtiPalette>;

export const AMBIENT_COLS = ['#9D4EDD', '#00F5FF', '#39FF14', '#FFD700', '#FF1493'] as const;
