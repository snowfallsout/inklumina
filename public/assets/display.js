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
  var MBTI_ORDER = [
    "INTJ",
    "INTP",
    "ENTJ",
    "ENTP",
    "INFJ",
    "INFP",
    "ENFJ",
    "ENFP",
    "ISTJ",
    "ISFJ",
    "ESTJ",
    "ESFJ",
    "ISTP",
    "ISFP",
    "ESTP",
    "ESFP"
  ];
  var MBTI_PALETTES = {
    INTJ: { core: "#C490FF", mid: "#9D4EDD", outer: "#5B2D8E", accent: "#3A1D5C" },
    INTP: { core: "#80FFFF", mid: "#00F5FF", outer: "#007A80", accent: "#003D40" },
    ENTJ: { core: "#FF6B6B", mid: "#FF073A", outer: "#9E0024", accent: "#4D0012" },
    ENTP: { core: "#FFAA55", mid: "#FF6B00", outer: "#A04400", accent: "#502200" },
    INFJ: { core: "#E680FF", mid: "#CC00FF", outer: "#7A009A", accent: "#3D004D" },
    INFP: { core: "#FF6BAD", mid: "#FF1493", outer: "#A00D5E", accent: "#50072F" },
    ENFJ: { core: "#FFEC80", mid: "#FFD700", outer: "#A08600", accent: "#504300" },
    ENFP: { core: "#80FF6B", mid: "#39FF14", outer: "#22A00D", accent: "#115007" },
    ISTJ: { core: "#6BB8FF", mid: "#1E90FF", outer: "#1260A0", accent: "#093050" },
    ISFJ: { core: "#66FFE0", mid: "#00FFCD", outer: "#00A080", accent: "#005040" },
    ESTJ: { core: "#FF8055", mid: "#FF4500", outer: "#A02C00", accent: "#501600" },
    ESFJ: { core: "#FFA0CC", mid: "#FF69B4", outer: "#A04272", accent: "#502139" },
    ISTP: { core: "#D4DAFF", mid: "#B8C0FF", outer: "#7078A0", accent: "#383C50" },
    ISFP: { core: "#EC80FF", mid: "#E040FB", outer: "#8C289A", accent: "#46144D" },
    ESTP: { core: "#FFF066", mid: "#FFE600", outer: "#A09000", accent: "#504800" },
    ESFP: { core: "#FFA0DA", mid: "#FF6EC7", outer: "#A0447C", accent: "#50223E" }
  };
  var AMBIENT_COLS = ["#9D4EDD", "#00F5FF", "#39FF14", "#FFD700", "#FF1493"];

  // src/shared/dom.ts
  function element(id) {
    const node = document.getElementById(id);
    if (!node) {
      throw new Error(`Missing element #${id}`);
    }
    return node;
  }
  function getCanvasContext(target) {
    const context = target.getContext("2d");
    if (!context) {
      throw new Error("Unable to create 2D canvas context");
    }
    return context;
  }
  function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // src/display/sprites.ts
  var TWO_PI = Math.PI * 2;
  var DOT_HALF = 80;
  var BLOB_HALF = 128;
  var FIELD_HALF = 160;
  var DOT_REF_R = 16;
  var spriteCache = /* @__PURE__ */ new Map();
  function makeCanvas(half) {
    const size = half * 2;
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = size;
    spriteCanvas.height = size;
    const spriteContext = spriteCanvas.getContext("2d");
    if (!spriteContext) {
      throw new Error("Unable to create 2D canvas context");
    }
    return { canvas: spriteCanvas, ctx: spriteContext, cx: half, cy: half, size };
  }
  function makeDot(color) {
    const { canvas: spriteCanvas, ctx: g, cx, cy, size } = makeCanvas(DOT_HALF);
    const glow = g.createRadialGradient(cx, cy, DOT_REF_R * 0.4, cx, cy, DOT_HALF);
    glow.addColorStop(0, `${color}BB`);
    glow.addColorStop(0.5, `${color}44`);
    glow.addColorStop(1, `${color}00`);
    g.fillStyle = glow;
    g.fillRect(0, 0, size, size);
    const core = g.createRadialGradient(cx - DOT_REF_R * 0.28, cy - DOT_REF_R * 0.28, DOT_REF_R * 0.08, cx, cy, DOT_REF_R);
    core.addColorStop(0, "rgba(255,255,255,0.98)");
    core.addColorStop(0.22, color);
    core.addColorStop(0.72, `${color}BB`);
    core.addColorStop(1, `${color}00`);
    g.beginPath();
    g.arc(cx, cy, DOT_REF_R, 0, TWO_PI);
    g.fillStyle = core;
    g.fill();
    return { canvas: spriteCanvas, half: DOT_HALF, refR: DOT_REF_R };
  }
  function makeBlob(palette) {
    const { canvas: spriteCanvas, ctx: g, cx, cy } = makeCanvas(BLOB_HALF);
    const radius = BLOB_HALF * 0.85;
    const gradient = g.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `${palette.core}DD`);
    gradient.addColorStop(0.25, `${palette.mid}AA`);
    gradient.addColorStop(0.55, `${palette.outer}88`);
    gradient.addColorStop(0.8, `${palette.accent}44`);
    gradient.addColorStop(1, `${palette.accent}00`);
    g.fillStyle = gradient;
    g.beginPath();
    g.arc(cx, cy, radius, 0, TWO_PI);
    g.fill();
    g.globalCompositeOperation = "source-atop";
    const blobCount = 25 + Math.floor(Math.random() * 20);
    for (let index = 0; index < blobCount; index += 1) {
      const offsetX = cx + (Math.random() - 0.5) * radius * 1.4;
      const offsetY = cy + (Math.random() - 0.5) * radius * 1.4;
      const radiusX = 8 + Math.random() * radius * 0.4;
      const radiusY = 8 + Math.random() * radius * 0.4;
      const rotation = Math.random() * TWO_PI;
      const colors = [palette.core, palette.mid, palette.outer, palette.accent];
      g.fillStyle = `${colors[index % 4]}${Math.random() > 0.5 ? "44" : "28"}`;
      g.save();
      g.translate(offsetX, offsetY);
      g.rotate(rotation);
      g.beginPath();
      g.ellipse(0, 0, radiusX, radiusY, 0, 0, TWO_PI);
      g.fill();
      g.restore();
    }
    g.globalCompositeOperation = "source-over";
    return { canvas: spriteCanvas, half: BLOB_HALF, refR: BLOB_HALF * 0.35 };
  }
  function makeField(palette) {
    const { canvas: spriteCanvas, ctx: g, cx, cy } = makeCanvas(FIELD_HALF);
    const radius = FIELD_HALF * 0.95;
    const gradient = g.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `${palette.mid}55`);
    gradient.addColorStop(0.3, `${palette.outer}40`);
    gradient.addColorStop(0.65, `${palette.accent}22`);
    gradient.addColorStop(1, `${palette.accent}00`);
    g.fillStyle = gradient;
    g.beginPath();
    g.arc(cx, cy, radius, 0, TWO_PI);
    g.fill();
    g.globalCompositeOperation = "source-atop";
    for (let index = 0; index < 12; index += 1) {
      const offsetX = cx + (Math.random() - 0.5) * radius;
      const offsetY = cy + (Math.random() - 0.5) * radius;
      const fieldRadius = radius * (0.2 + Math.random() * 0.35);
      const swirl = g.createRadialGradient(offsetX, offsetY, 0, offsetX, offsetY, fieldRadius);
      const color = index % 2 === 0 ? palette.core : palette.mid;
      swirl.addColorStop(0, `${color}20`);
      swirl.addColorStop(1, `${color}00`);
      g.fillStyle = swirl;
      g.beginPath();
      g.arc(offsetX, offsetY, fieldRadius, 0, TWO_PI);
      g.fill();
    }
    g.globalCompositeOperation = "source-over";
    return { canvas: spriteCanvas, half: FIELD_HALF, refR: FIELD_HALF * 0.25 };
  }
  function getSpriteSet(mbti) {
    if (spriteCache.has(mbti)) {
      return spriteCache.get(mbti);
    }
    const color = MBTI_COLORS[mbti];
    const palette = MBTI_PALETTES[mbti] ?? { core: color, mid: color, outer: color, accent: color };
    const sprites = {
      dot: makeDot(color),
      blob: makeBlob(palette),
      field: makeField(palette)
    };
    spriteCache.set(mbti, sprites);
    return sprites;
  }
  function getDotSprite(color) {
    const key = `__dot_${color}`;
    if (spriteCache.has(key)) {
      return spriteCache.get(key);
    }
    const dot = makeDot(color);
    const spriteSet = { dot, blob: dot, field: dot };
    spriteCache.set(key, spriteSet);
    return spriteSet;
  }
  for (const mbti of MBTI_ORDER) {
    getSpriteSet(mbti);
  }
  for (const color of AMBIENT_COLS) {
    getDotSprite(color);
  }

  // src/display/particles.ts
  var TWO_PI2 = Math.PI * 2;
  var SIZE_CLASS_PARAMS = {
    dot: { sizeMin: 1.5, sizeMax: 8, alphaMin: 0.35, alphaMax: 0.95, speedCap: 6, drag: 0.992, accel: 0.45, trailMax: 10 },
    blob: { sizeMin: 12, sizeMax: 30, alphaMin: 0.12, alphaMax: 0.3, speedCap: 4, drag: 0.986, accel: 0.2, trailMax: 6 },
    field: { sizeMin: 35, sizeMax: 65, alphaMin: 0.04, alphaMax: 0.12, speedCap: 2, drag: 0.978, accel: 0.08, trailMax: 3 }
  };
  function pickSizeClass() {
    const roll = Math.random();
    if (roll < 0.03) {
      return "field";
    }
    if (roll < 0.12) {
      return "blob";
    }
    return "dot";
  }
  function dist2sq(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
  }
  function nearestFace(faces2, px, py) {
    if (!faces2.length) {
      return null;
    }
    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const face of faces2) {
      const distance = dist2sq(px, py, face.x, face.y);
      if (distance < bestDistance) {
        best = face;
        bestDistance = distance;
      }
    }
    return best;
  }
  function drawDiamondSparkle(renderCtx, x, y, size, alpha) {
    const sparkleSize = size * (2.5 + Math.random() * 2);
    const diamondSize = sparkleSize * 0.22;
    renderCtx.globalAlpha = alpha * (0.3 + Math.random() * 0.4);
    renderCtx.strokeStyle = "#ffffff";
    renderCtx.lineWidth = 0.6;
    renderCtx.beginPath();
    renderCtx.moveTo(x, y - sparkleSize);
    renderCtx.lineTo(x, y + sparkleSize);
    renderCtx.moveTo(x - sparkleSize, y);
    renderCtx.lineTo(x + sparkleSize, y);
    renderCtx.moveTo(x - diamondSize, y - diamondSize);
    renderCtx.lineTo(x + diamondSize, y + diamondSize);
    renderCtx.moveTo(x + diamondSize, y - diamondSize);
    renderCtx.lineTo(x - diamondSize, y + diamondSize);
    renderCtx.stroke();
    renderCtx.globalAlpha = alpha * 0.6;
    renderCtx.fillStyle = "#ffffff";
    renderCtx.beginPath();
    renderCtx.arc(x, y, 0.8, 0, TWO_PI2);
    renderCtx.fill();
  }
  function createParticleSystem() {
    let width2 = 0;
    let height2 = 0;
    const particles = [];
    const mbtiParticles = {};
    const mbtiCounts2 = {};
    const interactionPoints = /* @__PURE__ */ new Map();
    for (const mbti of MBTI_ORDER) {
      mbtiParticles[mbti] = [];
    }
    class Particle {
      constructor(x, y, color, mbtiType) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.mbti = mbtiType;
        this.sizeClass = pickSizeClass();
        const params = SIZE_CLASS_PARAMS[this.sizeClass];
        this.vx = (Math.random() - 0.5) * (this.sizeClass === "dot" ? 14 : 6);
        this.vy = (Math.random() - 0.5) * (this.sizeClass === "dot" ? 14 : 6) - 2;
        this.size = params.sizeMin + Math.random() * (params.sizeMax - params.sizeMin);
        this.alpha = 0;
        this.alphaTarget = params.alphaMin + Math.random() * (params.alphaMax - params.alphaMin);
        this.state = "born";
        this.age = 0;
        this.trail = [];
        this.orbitAngle = Math.random() * TWO_PI2;
        this.orbitRadius = 55 + Math.random() * 90;
        this.orbitSpeed = (0.022 + Math.random() * 0.03) * (Math.random() > 0.5 ? 1 : -1);
        this.targetFace = null;
        this.phaseOffset = Math.random() * TWO_PI2;
        this.sprites = mbtiType ? getSpriteSet(mbtiType) : getDotSprite(color);
      }
      update(faces2) {
        this.age += 1;
        this.alpha = Math.min(this.alphaTarget, this.alpha + 0.04);
        const params = SIZE_CLASS_PARAMS[this.sizeClass];
        if (params.trailMax > 0 && this.age % 2 === 0) {
          this.trail.push({ x: this.x, y: this.y, s: this.size });
          if (this.trail.length > params.trailMax) {
            this.trail.shift();
          }
        }
        if (this.age < 20) {
          this.state = "born";
        } else if (this.sizeClass === "field") {
          this.state = "free";
        } else {
          const nearest = nearestFace(faces2, this.x, this.y);
          const distanceSquared = nearest ? dist2sq(this.x, this.y, nearest.x, nearest.y) : Number.POSITIVE_INFINITY;
          if (nearest && distanceSquared < 260 * 260) {
            this.targetFace = nearest;
            this.state = nearest.smile ? "swirling" : "attracted";
          } else {
            this.state = "free";
          }
        }
        switch (this.state) {
          case "born":
          case "free": {
            this.vx += (Math.random() - 0.5) * params.accel;
            this.vy += (Math.random() - 0.5) * params.accel;
            if (this.mbti && this.sizeClass === "dot" && this.age % 4 === 0) {
              const siblings = mbtiParticles[this.mbti];
              if (siblings.length > 1) {
                const other = siblings[Math.floor(Math.random() * siblings.length)];
                if (other && other !== this) {
                  const dx = other.x - this.x;
                  const dy = other.y - this.y;
                  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                  if (distance > 30 && distance < 350) {
                    const pull = 0.012;
                    this.vx += dx / distance * pull;
                    this.vy += dy / distance * pull;
                  }
                }
              }
            }
            this.vx += (width2 * 0.5 - this.x) * 3e-5;
            this.vy += (height2 * 0.5 - this.y) * 3e-5;
            break;
          }
          case "attracted": {
            const target = this.targetFace;
            if (target) {
              const dx = target.x - this.x;
              const dy = target.y - this.y;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;
              const force = Math.min(2.2, 90 / distance) * 0.085;
              this.vx += dx / distance * force;
              this.vy += dy / distance * force;
              this.vx *= 0.92;
              this.vy *= 0.92;
            }
            break;
          }
          case "swirling": {
            const target = this.targetFace;
            if (target) {
              this.orbitAngle += this.orbitSpeed * 3.2;
              const targetX = target.x + Math.cos(this.orbitAngle) * this.orbitRadius;
              const targetY = target.y + Math.sin(this.orbitAngle) * this.orbitRadius;
              this.vx += (targetX - this.x) * 0.16;
              this.vy += (targetY - this.y) * 0.16;
              this.vx *= 0.78;
              this.vy *= 0.78;
            }
            break;
          }
        }
        this.applyInteractionRepulsion();
        const speedCapSquared = params.speedCap * params.speedCap;
        const speedSquared = this.vx * this.vx + this.vy * this.vy;
        if (speedSquared > speedCapSquared) {
          const inverse = params.speedCap / Math.sqrt(speedSquared);
          this.vx *= inverse;
          this.vy *= inverse;
        }
        this.vx *= params.drag;
        this.vy *= params.drag;
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -20) this.x = width2 + 10;
        if (this.x > width2 + 20) this.x = -10;
        if (this.y < -20) this.y = height2 + 10;
        if (this.y > height2 + 20) this.y = -10;
      }
      applyInteractionRepulsion() {
        for (const point of interactionPoints.values()) {
          const dx = this.x - point.x;
          const dy = this.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          if (distance >= point.radius) {
            continue;
          }
          const falloff = 1 - distance / point.radius;
          const sizeScale = this.sizeClass === "field" ? 0.45 : this.sizeClass === "blob" ? 0.8 : 1.1;
          const force = falloff * falloff * point.strength * sizeScale;
          this.vx += dx / distance * force;
          this.vy += dy / distance * force;
        }
      }
      draw(renderCtx) {
        const spriteEntry = this.sprites[this.sizeClass];
        const sprite = spriteEntry.canvas;
        const half = spriteEntry.half;
        const refR = spriteEntry.refR;
        const pulse = 1 + Math.sin(this.age * 0.018 + this.phaseOffset) * 0.2;
        const baseAlpha = this.alpha * pulse;
        for (let index = 1; index < this.trail.length; index += 1) {
          const trailPoint = this.trail[index];
          const trailT = index / this.trail.length;
          const halfWidth2 = half * (trailPoint.s / refR) * trailT * 0.7;
          if (halfWidth2 < 0.5) {
            continue;
          }
          renderCtx.globalAlpha = trailT * baseAlpha * 0.45;
          renderCtx.drawImage(sprite, trailPoint.x - halfWidth2, trailPoint.y - halfWidth2, halfWidth2 * 2, halfWidth2 * 2);
        }
        const halfWidth = half * (this.size / refR);
        renderCtx.globalAlpha = baseAlpha;
        renderCtx.drawImage(sprite, this.x - halfWidth, this.y - halfWidth, halfWidth * 2, halfWidth * 2);
        if (this.sizeClass === "dot" && Math.random() < 0.12) {
          drawDiamondSparkle(renderCtx, this.x, this.y, this.size, baseAlpha);
        }
        renderCtx.globalAlpha = 1;
      }
    }
    const totalMbtiCounts2 = () => Object.values(mbtiCounts2).reduce((total, value) => total + (value ?? 0), 0);
    const quotaForType = (mbti) => {
      const total = totalMbtiCounts2() || 1;
      const count = mbtiCounts2[mbti] ?? 1;
      const raw = Math.floor(count / total * 800);
      return Math.max(20, Math.min(120, raw));
    };
    const pruneType = (mbti) => {
      const particlesForType = mbtiParticles[mbti];
      const quota = quotaForType(mbti);
      while (particlesForType.length > quota) {
        const oldParticle = particlesForType.shift();
        if (!oldParticle) {
          break;
        }
        const index = particles.indexOf(oldParticle);
        if (index !== -1) {
          particles.splice(index, 1);
        }
      }
    };
    const pruneAllTypes = () => {
      for (const mbti of MBTI_ORDER) {
        pruneType(mbti);
      }
    };
    const decayInteractions = () => {
      for (const [id, point] of interactionPoints) {
        point.ttl -= 1;
        if (point.ttl <= 0) {
          interactionPoints.delete(id);
        }
      }
    };
    const bindPointer = (canvas2) => {
      const supportsTouchLike = (event) => event.pointerType === "touch" || event.pointerType === "pen" || event.pointerType === "mouse";
      const toCanvasPoint = (event) => {
        const rect = canvas2.getBoundingClientRect();
        const scaleX = width2 / rect.width;
        const scaleY = height2 / rect.height;
        return {
          id: event.pointerId,
          x: (event.clientX - rect.left) * scaleX,
          y: (event.clientY - rect.top) * scaleY,
          radius: 180,
          strength: 1.3,
          ttl: 8
        };
      };
      const upsertInteraction = (event) => {
        interactionPoints.set(event.pointerId, toCanvasPoint(event));
      };
      const releaseInteraction = (event) => {
        interactionPoints.delete(event.pointerId);
      };
      canvas2.addEventListener("pointerdown", (event) => {
        if (!supportsTouchLike(event)) {
          return;
        }
        canvas2.setPointerCapture(event.pointerId);
        upsertInteraction(event);
      });
      canvas2.addEventListener("pointermove", (event) => {
        if (!supportsTouchLike(event)) {
          return;
        }
        if (interactionPoints.has(event.pointerId) || event.buttons !== 0) {
          upsertInteraction(event);
        }
      });
      canvas2.addEventListener("pointerup", releaseInteraction);
      canvas2.addEventListener("pointercancel", releaseInteraction);
      canvas2.addEventListener("pointerleave", releaseInteraction);
    };
    const seedAmbient = (count) => {
      for (let index = 0; index < count; index += 1) {
        const color = AMBIENT_COLS[index % AMBIENT_COLS.length];
        const particle = new Particle(Math.random() * width2, Math.random() * height2, color, null);
        if (index < 3) {
          particle.sizeClass = "blob";
          particle.size = 14 + Math.random() * 18;
          particle.alphaTarget = Math.random() * 0.08 + 0.04;
          particle.sprites = getDotSprite(color);
        } else {
          particle.sizeClass = "dot";
          particle.size = Math.random() * 4 + 1.5;
          particle.alphaTarget = Math.random() * 0.15 + 0.05;
        }
        particles.push(particle);
      }
    };
    const spawnMbti = (mbti, color) => {
      const particlesForType = mbtiParticles[mbti];
      const side = Math.floor(Math.random() * 4);
      let originX = 0;
      let originY = 0;
      switch (side) {
        case 0:
          originX = Math.random() * width2;
          originY = -20;
          break;
        case 1:
          originX = width2 + 20;
          originY = Math.random() * height2;
          break;
        case 2:
          originX = Math.random() * width2;
          originY = height2 + 20;
          break;
        default:
          originX = -20;
          originY = Math.random() * height2;
          break;
      }
      for (let index = 0; index < 18; index += 1) {
        const particle = new Particle(
          originX + (Math.random() - 0.5) * 60,
          originY + (Math.random() - 0.5) * 60,
          color,
          mbti
        );
        particles.push(particle);
        particlesForType.push(particle);
      }
      pruneAllTypes();
    };
    const setCounts = (counts) => {
      for (const mbti of MBTI_ORDER) {
        delete mbtiCounts2[mbti];
      }
      for (const mbti of MBTI_ORDER) {
        const value = counts[mbti];
        if (typeof value === "number") {
          mbtiCounts2[mbti] = value;
        }
      }
      pruneAllTypes();
    };
    const reset = () => {
      particles.length = 0;
      for (const mbti of MBTI_ORDER) {
        mbtiParticles[mbti].length = 0;
        delete mbtiCounts2[mbti];
      }
      interactionPoints.clear();
    };
    const update = (faces2) => {
      decayInteractions();
      for (const particle of particles) {
        particle.update(faces2);
      }
    };
    const draw = (renderCtx) => {
      renderCtx.globalCompositeOperation = "screen";
      for (const particle of particles) {
        particle.draw(renderCtx);
      }
      renderCtx.globalCompositeOperation = "source-over";
    };
    return {
      bindPointer,
      resize(nextWidth, nextHeight) {
        width2 = nextWidth;
        height2 = nextHeight;
      },
      reset,
      setCounts,
      seedAmbient,
      spawnMbti,
      update,
      draw,
      hasParticles: () => particles.length > 0
    };
  }

  // src/display/faceMesh.ts
  function startFaceTracking(video2, options) {
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false }).then((stream) => {
      video2.srcObject = stream;
      video2.onloadedmetadata = () => {
        void video2.play();
        video2.classList.add("ready");
        options.onReady?.();
        void tryMediaPipe(video2, options);
      };
    }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Camera unavailable:", message);
      options.onUnavailable?.(message);
    });
  }
  async function tryMediaPipe(video2, options) {
    if (typeof FaceMesh === "undefined") {
      console.warn("MediaPipe FaceMesh not loaded");
      options.onUnavailable?.("MediaPipe FaceMesh not loaded");
      return;
    }
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
    });
    faceMesh.setOptions({
      maxNumFaces: 6,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    faceMesh.onResults((results) => {
      const faces2 = [];
      let smileCount = 0;
      if (results.multiFaceLandmarks) {
        const width2 = window.innerWidth;
        const height2 = window.innerHeight;
        for (const landmarks of results.multiFaceLandmarks) {
          const x = (1 - landmarks[168].x) * width2;
          const y = landmarks[168].y * height2;
          const mouthWidth = Math.abs(landmarks[291].x - landmarks[61].x);
          const eyeWidth = Math.abs(landmarks[263].x - landmarks[33].x);
          const smile = eyeWidth > 0 && mouthWidth / eyeWidth > 0.57;
          if (smile) {
            smileCount += 1;
          }
          faces2.push({ x, y, smile });
        }
      }
      const emotion2 = smileCount > faces2.length * 0.5 && faces2.length > 0 ? "smile" : "neutral";
      options.onFaces(faces2, emotion2);
    });
    if (typeof Camera === "undefined") {
      console.warn("MediaPipe Camera utils not loaded");
      options.onUnavailable?.("MediaPipe Camera utils not loaded");
      return;
    }
    const camera = new Camera(video2, {
      onFrame: async () => {
        await faceMesh.send({ image: video2 });
      },
      width: 1280,
      height: 720
    });
    camera.start().catch((error) => {
      console.warn("Camera utils error:", error);
    });
  }

  // src/display/main.ts
  var canvas = element("canvas");
  var ctx = getCanvasContext(canvas);
  var joinBlock = element("join-block");
  var legendRoot = element("legend-rows");
  var totalNum = element("total-num");
  var waiting = element("waiting");
  var emotionBadge = element("emotion-badge");
  var sessionPanel = element("session-panel");
  var sessionName = element("session-name");
  var sessionHistoryList = element("sp-history-list");
  var sessionInput = element("sp-name-input");
  var ui = element("ui");
  var video = element("video-bg");
  var particleSystem = createParticleSystem();
  var socket = io();
  canvas.style.touchAction = "none";
  var width = 0;
  var height = 0;
  var faces = [];
  var emotion = "neutral";
  var mbtiCounts = {};
  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particleSystem.resize(width, height);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  particleSystem.bindPointer(canvas);
  function totalMbtiCounts() {
    return Object.values(mbtiCounts).reduce((total, value) => total + (value ?? 0), 0);
  }
  function buildLegend() {
    legendRoot.innerHTML = "";
    for (const mbti of MBTI_ORDER) {
      const color = MBTI_COLORS[mbti];
      legendRoot.insertAdjacentHTML(
        "beforeend",
        `
      <div class="row" id="r-${mbti}">
        <div class="dot" style="background:${color};--c:${color}"></div>
        <span class="lbl">${mbti}</span>
        <div class="track"><div class="fill" id="f-${mbti}" style="background:${color}"></div></div>
        <span class="cnt" id="c-${mbti}">0</span>
      </div>`
      );
    }
  }
  function renderLegend() {
    const total = totalMbtiCounts();
    totalNum.textContent = String(total);
    for (const mbti of MBTI_ORDER) {
      const count = mbtiCounts[mbti] ?? 0;
      const percentage = total > 0 ? count / total * 100 : 0;
      element(`r-${mbti}`).classList.toggle("on", count > 0);
      element(`f-${mbti}`).style.width = `${percentage}%`;
      element(`c-${mbti}`).textContent = String(count);
    }
  }
  function setJoinUrl() {
    joinBlock.innerHTML = `<b>SCAN TO JOIN</b><br>${window.location.origin}/join`;
  }
  function setSessionName(name) {
    sessionName.textContent = name ? `\u2014 ${name} \u2014` : "";
  }
  function updateEmotionBadge() {
    if (!faces.length) {
      emotionBadge.className = "";
      emotionBadge.textContent = "\u25CF FACE TRACKING";
      return;
    }
    if (emotion === "smile") {
      emotionBadge.className = "smile";
      emotionBadge.textContent = "\u2726 SMILE DETECTED";
      return;
    }
    emotionBadge.className = "";
    emotionBadge.textContent = `\u25CF ${faces.length} FACE${faces.length > 1 ? "S" : ""} DETECTED`;
  }
  function showToast(message, color) {
    ui.querySelectorAll(".toast-wrap").forEach((toast) => toast.remove());
    const toastWrap = document.createElement("div");
    toastWrap.className = "toast-wrap";
    toastWrap.innerHTML = `<div class="toast-pill" style="border-color:${color}55;text-shadow:0 0 18px ${color}">${message}</div>`;
    ui.appendChild(toastWrap);
    window.setTimeout(() => toastWrap.remove(), 3e3);
  }
  function openSessionPanel() {
    sessionPanel.classList.add("open");
    loadSessionHistory();
  }
  function closeSessionPanel() {
    sessionPanel.classList.remove("open");
  }
  function createNewSession() {
    const name = sessionInput.value.trim();
    if (!window.confirm(`\u5F00\u59CB\u65B0\u573A\u6B21"${name || "\u65B0\u6D3B\u52A8"}"\uFF1F\u5F53\u524D\u6570\u636E\u5C06\u5B58\u5165\u5386\u53F2\u8BB0\u5F55\u3002`)) {
      return;
    }
    fetch("/api/sessions/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    }).then((response) => response.json()).then((payload) => {
      if (payload.ok) {
        sessionInput.value = "";
        closeSessionPanel();
      }
    }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      window.alert(`\u8BF7\u6C42\u5931\u8D25: ${message}`);
    });
  }
  function loadSessionHistory() {
    fetch("/api/sessions").then((response) => response.json()).then((data) => {
      if (data.active) {
        setSessionName(data.active.name);
      }
      if (!data.history || data.history.length === 0) {
        sessionHistoryList.innerHTML = '<div style="color:rgba(255,255,255,0.2);font-size:12px;padding:16px 0">\u6682\u65E0\u5386\u53F2\u8BB0\u5F55</div>';
        return;
      }
      sessionHistoryList.innerHTML = data.history.map((session) => {
        const created = new Date(session.createdAt);
        const dateText = `${created.getMonth() + 1}/${created.getDate()} ${created.getHours().toString().padStart(2, "0")}:${created.getMinutes().toString().padStart(2, "0")}`;
        return `
            <div class="sp-row">
              <div class="sp-row-info">
                <div class="sp-row-name">${escapeHtml(session.name)}</div>
                <div class="sp-row-meta">${dateText} \xB7 ${session.total} \u4EBA\u53C2\u4E0E</div>
              </div>
              <button class="sp-btn" onclick="viewSession('${session.id}')">\u67E5\u770B</button>
              <button class="sp-btn danger" onclick="deleteSession('${session.id}', this)">\u5220\u9664</button>
            </div>`;
      }).join("");
    }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Failed to load sessions:", message);
    });
  }
  function viewSession(id) {
    fetch(`/api/sessions/${id}`).then((response) => response.json()).then((session) => {
      const lines = Object.entries(session.counts ?? {}).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0)).map(([mbti, count]) => `${mbti}: ${count ?? 0}\u4EBA`).join("\n");
      window.alert(`${session.name}
\u521B\u5EFA: ${new Date(session.createdAt).toLocaleString()}
\u603B\u4EBA\u6570: ${session.total}

${lines || "\u65E0\u6570\u636E"}`);
    });
  }
  function deleteSession(id, button) {
    if (!window.confirm("\u786E\u8BA4\u5220\u9664\u6B64\u5386\u53F2\u8BB0\u5F55\uFF1F")) {
      return;
    }
    fetch(`/api/sessions/${id}`, { method: "DELETE" }).then((response) => response.json()).then((payload) => {
      if (payload.ok) {
        button.closest(".sp-row")?.remove();
      }
    });
  }
  function loop() {
    window.requestAnimationFrame(loop);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#05050f";
    ctx.fillRect(0, 0, width, height);
    if (video.readyState >= 2) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.globalAlpha = 0.38;
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    particleSystem.update(faces);
    particleSystem.draw(ctx);
  }
  function bootstrap() {
    buildLegend();
    setJoinUrl();
    particleSystem.seedAmbient(25);
    updateEmotionBadge();
    renderLegend();
    startFaceTracking(video, {
      onFaces(nextFaces, nextEmotion) {
        faces = nextFaces;
        emotion = nextEmotion;
        updateEmotionBadge();
      },
      onReady() {
        video.classList.add("ready");
      },
      onUnavailable(message) {
        console.warn("Camera unavailable:", message);
        emotionBadge.textContent = "\u25CF NO CAMERA";
      }
    });
    loop();
  }
  socket.on("state", (data) => {
    Object.assign(mbtiCounts, data.counts ?? {});
    particleSystem.setCounts(data.counts ?? {});
    renderLegend();
    if (data.session) {
      setSessionName(data.session.name);
    }
    setJoinUrl();
  });
  socket.on("spawn_particles", (data) => {
    const { mbti, color, counts, total, nickname } = data;
    Object.assign(mbtiCounts, counts ?? {});
    particleSystem.setCounts(counts ?? {});
    particleSystem.spawnMbti(mbti, color);
    renderLegend();
    totalNum.textContent = String(total || totalMbtiCounts());
    showToast(`\u2726 ${mbti} ${nickname} joined`, color);
    waiting.style.display = particleSystem.hasParticles() ? "none" : "";
  });
  socket.on("session_reset", (data) => {
    for (const mbti of Object.keys(mbtiCounts)) {
      delete mbtiCounts[mbti];
    }
    particleSystem.reset();
    particleSystem.seedAmbient(25);
    renderLegend();
    totalNum.textContent = "0";
    waiting.style.display = "";
    if (data.session) {
      setSessionName(data.session.name);
    }
    showToast("\u2726 \u65B0\u573A\u6B21\u5DF2\u5F00\u59CB", "#ffffff");
  });
  socket.on("connect", () => {
    setJoinUrl();
  });
  sessionPanel.addEventListener("click", (event) => {
    if (event.target === sessionPanel) {
      closeSessionPanel();
    }
  });
  Object.assign(window, {
    openSessionPanel,
    closeSessionPanel,
    createNewSession,
    viewSession,
    deleteSession
  });
  bootstrap();
})();
//# sourceMappingURL=display.js.map
