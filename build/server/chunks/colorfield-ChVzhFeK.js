import fs from 'fs';
import path from 'path';

const MBTI_COLORS = {
  INTJ: "#4B0082",
  INTP: "#6495ED",
  ENTJ: "#FF4500",
  ENTP: "#FF00FF",
  INFJ: "#00A86B",
  INFP: "#DA70D6",
  ENFJ: "#FC913A",
  ENFP: "#92FE9D",
  ISTJ: "#95A5A6",
  ISFJ: "#BDB76B",
  ESTJ: "#4682B4",
  ESFJ: "#FFB6C1",
  ISTP: "#4A4A4A",
  ISFP: "#00CED1",
  ESTP: "#FF2400",
  ESFP: "#7B68EE"
};
const MBTI_NAMES = {
  INTJ: "战略家",
  INTP: "逻辑学家",
  ENTJ: "指挥官",
  ENTP: "辩论家",
  INFJ: "提倡者",
  INFP: "调停者",
  ENFJ: "主人公",
  ENFP: "竞选者",
  ISTJ: "检察官",
  ISFJ: "守护者",
  ESTJ: "总经理",
  ESFJ: "执政官",
  ISTP: "鉴赏家",
  ISFP: "探险家",
  ESTP: "企业家",
  ESFP: "表演者"
};
const MBTI_LUCKY_PHRASES = {
  INTJ: "深邃星河",
  INTP: "量子涟漪",
  ENTJ: "赤焰烈炬",
  ENTP: "橙光裂变",
  INFJ: "紫境幽光",
  INFP: "蔷薇共鸣",
  ENFJ: "黄金旋律",
  ENFP: "荧光奇境",
  ISTJ: "蓝海稳浪",
  ISFJ: "碧玉守护",
  ESTJ: "烈红征途",
  ESFJ: "樱粉温暖",
  ISTP: "银弦孤鸣",
  ISFP: "兰紫自由",
  ESTP: "电光闪耀",
  ESFP: "霓虹盛放"
};
const SESSIONS_FILE = path.join(process.cwd(), "sessions.json");
const DEFAULT_SESSION_NAME = "默认活动";
const listeners = /* @__PURE__ */ new Set();
function createSession(name = DEFAULT_SESSION_NAME) {
  return {
    id: Date.now().toString(36),
    name,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    counts: {},
    total: 0
  };
}
function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (!parsed.active) parsed.active = createSession();
        if (!Array.isArray(parsed.history)) parsed.history = [];
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Failed to load sessions:", error.message);
  }
  return { active: createSession(), history: [] };
}
function saveSessions() {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsData, null, 2), "utf8");
}
function ensureActiveSession() {
  if (!sessionsData.active) {
    sessionsData.active = createSession();
    saveSessions();
  }
}
function getState() {
  ensureActiveSession();
  return {
    active: sessionsData.active,
    history: sessionsData.history.map((session) => ({
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      total: session.total
    }))
  };
}
function getHistorySession(id) {
  ensureActiveSession();
  return sessionsData.history.find((session) => session.id === id) || null;
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function publish(event, data) {
  for (const listener of listeners) {
    try {
      listener(event, data);
    } catch (error) {
      console.warn("Event listener failed:", error);
    }
  }
}
function createNewSession(name) {
  ensureActiveSession();
  const sessionName = (name || "").trim() || `活动 ${sessionsData.history.length + 2}`;
  sessionsData.history.unshift({
    ...sessionsData.active,
    archivedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  sessionsData.active = createSession(sessionName);
  saveSessions();
  publish("session_reset", { session: sessionsData.active });
  return sessionsData.active;
}
function deleteHistorySession(id) {
  ensureActiveSession();
  const index = sessionsData.history.findIndex((session) => session.id === id);
  if (index === -1) return false;
  sessionsData.history.splice(index, 1);
  saveSessions();
  return true;
}
function submitMbti(rawMbti) {
  ensureActiveSession();
  const mbti = (rawMbti || "").toUpperCase().trim();
  if (!MBTI_COLORS[mbti]) return null;
  const counts = sessionsData.active.counts;
  counts[mbti] = (counts[mbti] || 0) + 1;
  sessionsData.active.total += 1;
  saveSessions();
  const payload = {
    mbti,
    color: MBTI_COLORS[mbti],
    nickname: MBTI_NAMES[mbti],
    luckyPhrase: MBTI_LUCKY_PHRASES[mbti],
    count: counts[mbti],
    counts: { ...counts },
    total: sessionsData.active.total,
    session: sessionsData.active
  };
  publish("state", getState());
  publish("lucky_color", payload);
  publish("spawn_particles", {
    mbti,
    color: MBTI_COLORS[mbti],
    nickname: MBTI_NAMES[mbti],
    luckyPhrase: MBTI_LUCKY_PHRASES[mbti],
    count: counts[mbti],
    counts: { ...counts },
    total: sessionsData.active.total,
    session: sessionsData.active
  });
  return payload;
}
let sessionsData = loadSessions();

export { getHistorySession as a, submitMbti as b, createNewSession as c, deleteHistorySession as d, getState as g, subscribe as s };
//# sourceMappingURL=colorfield-ChVzhFeK.js.map
