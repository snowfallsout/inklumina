"use strict";
(() => {
  // src/shared/constants.ts
  var MBTI_COLORS = {
    INTJ: "#9D4EDD",
    INTP: "#00F5FF",
    ENTJ: "#FF073A",
    ENTP: "#FF6B00",
    INFJ: "#CC00FF",
    INFP: "#FF1493",
    ENFJ: "#FFD700",
    ENFP: "#39FF14",
    ISTJ: "#1E90FF",
    ISFJ: "#00FFCD",
    ESTJ: "#FF4500",
    ESFJ: "#FF69B4",
    ISTP: "#B8C0FF",
    ISFP: "#E040FB",
    ESTP: "#FFE600",
    ESFP: "#FF6EC7"
  };
  var MBTI_NAMES = {
    INTJ: "\u6218\u7565\u5BB6",
    INTP: "\u903B\u8F91\u5B66\u5BB6",
    ENTJ: "\u6307\u6325\u5B98",
    ENTP: "\u8FA9\u8BBA\u5BB6",
    INFJ: "\u63D0\u5021\u8005",
    INFP: "\u8C03\u505C\u8005",
    ENFJ: "\u4E3B\u4EBA\u516C",
    ENFP: "\u7ADE\u9009\u8005",
    ISTJ: "\u68C0\u5BDF\u5B98",
    ISFJ: "\u5B88\u62A4\u8005",
    ESTJ: "\u603B\u7ECF\u7406",
    ESFJ: "\u6267\u653F\u5B98",
    ISTP: "\u9274\u8D4F\u5BB6",
    ISFP: "\u63A2\u9669\u5BB6",
    ESTP: "\u4F01\u4E1A\u5BB6",
    ESFP: "\u8868\u6F14\u8005"
  };

  // src/shared/dom.ts
  function element(id) {
    const node = document.getElementById(id);
    if (!node) {
      throw new Error(`Missing element #${id}`);
    }
    return node;
  }

  // src/client/common/screens.ts
  function showScreen(name) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.add("hidden");
    });
    const target = document.getElementById(`s-${name}`);
    if (!target) {
      throw new Error(`Missing screen #s-${name}`);
    }
    target.classList.remove("hidden");
  }

  // src/client/common/sparkles.ts
  function createSparkleController(canvas, isActive) {
    let frameId = 0;
    let sparkleContext = null;
    let sparkleStars = [];
    let tick = 0;
    let activeColor = "#ffffff";
    let resizeAttached = false;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const stop = () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };
    const draw = () => {
      if (!isActive()) {
        stop();
        return;
      }
      frameId = window.requestAnimationFrame(draw);
      const context = sparkleContext;
      if (!context) {
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      tick += 1;
      for (const star of sparkleStars) {
        const alpha = (Math.sin(tick * star.speed + star.phase) + 1) / 2;
        const arm = star.size * 3.5;
        context.globalAlpha = alpha * 0.9;
        context.strokeStyle = activeColor;
        context.lineWidth = 1;
        context.shadowBlur = 6;
        context.shadowColor = activeColor;
        context.beginPath();
        context.moveTo(star.x - arm, star.y);
        context.lineTo(star.x + arm, star.y);
        context.moveTo(star.x, star.y - arm);
        context.lineTo(star.x, star.y + arm);
        const diamond = arm * 0.55;
        context.moveTo(star.x - diamond, star.y - diamond);
        context.lineTo(star.x + diamond, star.y + diamond);
        context.moveTo(star.x + diamond, star.y - diamond);
        context.lineTo(star.x - diamond, star.y + diamond);
        context.stroke();
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };
    const start = (color) => {
      stop();
      activeColor = color;
      resizeCanvas();
      sparkleContext = canvas.getContext("2d");
      if (!sparkleContext) {
        return;
      }
      sparkleStars = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.8,
        speed: Math.random() * 0.018 + 4e-3,
        phase: Math.random() * Math.PI * 2
      }));
      tick = 0;
      if (!resizeAttached) {
        window.addEventListener("resize", resizeCanvas);
        resizeAttached = true;
      }
      draw();
    };
    return { start, stop };
  }

  // src/client/mobile/main.ts
  var socket = io();
  var selection = [null, null, null, null];
  var previewLetters = [
    element("pl-0"),
    element("pl-1"),
    element("pl-2"),
    element("pl-3")
  ];
  var submitButton = element("submit-btn");
  var resultScreen = element("s-result");
  var sparkleCanvas = element("sparkle-cv");
  var sparkleController = createSparkleController(sparkleCanvas, () => !resultScreen.classList.contains("hidden"));
  var luckyOrb = element("r-orb");
  var luckyHex = element("r-hex");
  var luckyMbti = element("r-mbti");
  var luckyNick = element("r-nick");
  var colorWash = element("color-wash");
  var orbEls = Array.from(document.querySelectorAll(".orb"));
  function goTo(name) {
    showScreen(name);
  }
  function getSelectedMbti() {
    if (!selection.every(Boolean)) {
      return null;
    }
    return selection.join("");
  }
  function updatePreview() {
    for (let index = 0; index < previewLetters.length; index += 1) {
      const value = selection[index];
      previewLetters[index].textContent = value ?? "_";
      previewLetters[index].classList.toggle("active", value !== null);
    }
  }
  function tintOrbs(color) {
    for (const orb of orbEls) {
      orb.style.transition = "background 0.6s";
      orb.style.background = color ?? "";
    }
  }
  function updateSubmitState() {
    const mbti = getSelectedMbti();
    submitButton.disabled = mbti === null;
    if (!mbti) {
      submitButton.style.borderColor = "";
      submitButton.style.boxShadow = "";
      tintOrbs();
      return;
    }
    const color = MBTI_COLORS[mbti];
    submitButton.style.borderColor = `${color}88`;
    submitButton.style.boxShadow = `0 0 30px ${color}33`;
    tintOrbs(color);
  }
  function pick(dim, value, button) {
    document.querySelectorAll(`[data-d="${dim}"]`).forEach((node) => node.classList.remove("sel"));
    button.classList.add("sel");
    selection[dim] = value;
    updatePreview();
    updateSubmitState();
  }
  function submitMBTI() {
    const mbti = getSelectedMbti();
    if (!mbti) {
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = "\u53D1\u9001\u4E2D\u2026";
    socket.emit("submit_mbti", { mbti });
  }
  function showResult(mbti, color, nickname, luckyPhrase) {
    goTo("result");
    luckyOrb.style.background = color;
    luckyOrb.style.boxShadow = `0 0 80px ${color}, 0 0 160px ${color}55`;
    luckyHex.textContent = color;
    luckyHex.style.color = color;
    luckyMbti.textContent = mbti;
    luckyMbti.style.color = color;
    luckyMbti.style.textShadow = `0 0 50px ${color}`;
    luckyNick.textContent = `${nickname}${luckyPhrase ? ` \xB7 ${luckyPhrase}` : ""}`;
    colorWash.style.background = `radial-gradient(ellipse at 50% 65%, ${color}28 0%, transparent 65%)`;
    window.requestAnimationFrame(() => {
      colorWash.style.opacity = "1";
      window.setTimeout(() => luckyOrb.classList.add("show"), 80);
      window.setTimeout(() => luckyMbti.classList.add("show"), 250);
      window.setTimeout(() => luckyNick.classList.add("show"), 450);
    });
    sparkleController.start(color);
  }
  socket.on("lucky_color", ({ mbti, color, nickname, luckyPhrase }) => {
    showResult(mbti, color, nickname || MBTI_NAMES[mbti], luckyPhrase);
  });
  Object.assign(window, {
    goTo,
    pick,
    submitMBTI,
    tintOrbs
  });
  updatePreview();
  updateSubmitState();
})();
//# sourceMappingURL=mobile.js.map
