import "../../../../chunks/index-server.js";
import { D as get, E as derived, H as escape_html, V as attr, a as ensure_array_like, c as store_get, k as writable, l as unsubscribe_stores, n as attr_class, o as head, r as attr_style } from "../../../../chunks/dev.js";
import "../../../../chunks/index-server2.js";
import "../../../../chunks/socket-client.js";
//#region src/lib/features/mobile/utils.ts
function roundRect(context, x, y, width, height, radius) {
	context.beginPath();
	context.moveTo(x + radius, y);
	context.arcTo(x + width, y, x + width, y + height, radius);
	context.arcTo(x + width, y + height, x, y + height, radius);
	context.arcTo(x, y + height, x, y, radius);
	context.arcTo(x, y, x + width, y, radius);
	context.closePath();
}
function hexToRgb(hexValue) {
	let hex = hexValue.replace("#", "");
	if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
	return {
		r: parseInt(hex.slice(0, 2), 16),
		g: parseInt(hex.slice(2, 4), 16),
		b: parseInt(hex.slice(4, 6), 16)
	};
}
function mix(a, b, ratio) {
	const left = hexToRgb(a);
	const right = hexToRgb(b);
	return `rgb(${Math.round(left.r * (1 - ratio) + right.r * ratio)},${Math.round(left.g * (1 - ratio) + right.g * ratio)},${Math.round(left.b * (1 - ratio) + right.b * ratio)})`;
}
function lighten(hex, ratio) {
	const source = hexToRgb(hex);
	return `rgb(${Math.min(255, source.r + Math.round((255 - source.r) * ratio))},${Math.min(255, source.g + Math.round((255 - source.g) * ratio))},${Math.min(255, source.b + Math.round((255 - source.b) * ratio))})`;
}
//#endregion
//#region src/lib/features/mobile/card.ts
function computeCardGradient(selectionState, mbti, source) {
	if (mbti) {
		const main = source.mbti.colors[mbti];
		return {
			c0: lighten(main, .55),
			c1: lighten(main, .25),
			c2: mix(main, source.mbti.letterColors[mbti[2]], .25),
			c3: main
		};
	}
	if (selectionState.some(Boolean)) {
		const picks = selectionState.map((item) => item ? source.mbti.letterColors[item] : null);
		return {
			c0: picks[0] ? lighten(picks[0], .6) : "#eceef5",
			c1: picks[1] ? lighten(picks[1], .35) : picks[0] ? lighten(picks[0], .4) : "#dcdee7",
			c2: picks[2] ? lighten(picks[2], .1) : picks[1] ? lighten(picks[1], .15) : "#cfd2de",
			c3: picks[3] || picks[2] || picks[1] || picks[0] || "#cfd2de"
		};
	}
	return {
		c0: "#eceef5",
		c1: "#dcdee7",
		c2: "#cfd2de",
		c3: "#bec2d2"
	};
}
function renderMobileHoloCard(incoming, source) {
	if (typeof document === "undefined") return null;
	const mbti = incoming.mbti;
	const color = incoming.color || source.mbti.colors[mbti];
	const nickname = incoming.nickname || source.mbti.names[mbti];
	const phrase = incoming.luckyPhrase || source.copy.resultTagline;
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	if (!context) return null;
	const width = 1080;
	const height = 1920;
	canvas.width = width;
	canvas.height = height;
	const cardWidth = width - 120;
	const cardHeight = height - 220;
	const cardX = (width - cardWidth) / 2;
	const cardY = (height - cardHeight) / 2 - 20;
	const radius = 56;
	const pageBg = context.createRadialGradient(width * .5, 0, 0, width * .5, height * .3, width);
	pageBg.addColorStop(0, "#ffffff");
	pageBg.addColorStop(1, "#f4f5f8");
	context.fillStyle = pageBg;
	context.fillRect(0, 0, width, height);
	context.save();
	context.shadowColor = "rgba(40,50,80,0.22)";
	context.shadowBlur = 80;
	context.shadowOffsetY = 30;
	context.fillStyle = "#fff";
	roundRect(context, cardX, cardY, cardWidth, cardHeight, radius);
	context.fill();
	context.restore();
	context.save();
	roundRect(context, cardX, cardY, cardWidth, cardHeight, radius);
	context.clip();
	const top = lighten(color, .55);
	const upper = lighten(color, .25);
	const mid = color;
	const gradient = context.createLinearGradient(0, cardY, 0, cardY + cardHeight);
	gradient.addColorStop(0, top);
	gradient.addColorStop(.35, upper);
	gradient.addColorStop(.75, mid);
	gradient.addColorStop(1, mid);
	context.fillStyle = gradient;
	context.fillRect(cardX, cardY, cardWidth, cardHeight);
	const highlight = context.createLinearGradient(0, cardY, 0, cardY + cardHeight * .4);
	highlight.addColorStop(0, "rgba(255,255,255,0.28)");
	highlight.addColorStop(1, "rgba(255,255,255,0)");
	context.fillStyle = highlight;
	context.fillRect(cardX, cardY, cardWidth, cardHeight * .4);
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillStyle = "rgba(255,255,255,0.95)";
	context.font = "600 26px Inter, sans-serif";
	context.fillText("COLORFIELD", cardX + 60, cardY + 60);
	context.fillStyle = "rgba(255,255,255,0.75)";
	context.font = "300 22px Inter, sans-serif";
	context.fillText("MBTI · PARTICLE ART", cardX + 60, cardY + 96);
	const now = /* @__PURE__ */ new Date();
	const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
	context.textAlign = "right";
	context.fillStyle = "rgba(255,255,255,0.75)";
	context.font = "300 22px Inter, sans-serif";
	context.fillText(timestamp, cardX + cardWidth - 60, cardY + 96);
	context.fillStyle = "rgba(255,255,255,0.95)";
	context.font = "600 26px Inter, sans-serif";
	context.fillText("Sixteen Personalities", cardX + cardWidth - 60, cardY + 60);
	context.textAlign = "center";
	context.textBaseline = "middle";
	const centerY = cardY + cardHeight * .42;
	context.fillStyle = "rgba(0,0,0,0.18)";
	context.font = "900 360px Inter, Arial Black, sans-serif";
	context.fillText(mbti, width / 2 + 6, centerY + 8);
	context.fillStyle = "#ffffff";
	context.fillText(mbti, width / 2, centerY);
	if (nickname) {
		context.fillStyle = "rgba(255,255,255,0.98)";
		context.font = "500 72px \"PingFang SC\", \"Hiragino Sans GB\", sans-serif";
		context.fillText(nickname, width / 2, cardY + cardHeight * .7);
	}
	if (phrase) {
		context.fillStyle = "rgba(255,255,255,0.8)";
		context.font = "300 44px \"PingFang SC\", \"Hiragino Sans GB\", serif";
		context.fillText(phrase, width / 2, cardY + cardHeight * .76);
	}
	context.textBaseline = "bottom";
	context.textAlign = "left";
	context.fillStyle = "rgba(255,255,255,0.65)";
	context.font = "300 18px Inter, sans-serif";
	context.fillText(source.copy.resultTagline, cardX + 60, cardY + cardHeight - 95);
	context.fillStyle = "rgba(255,255,255,0.9)";
	context.font = "600 28px Inter, sans-serif";
	context.fillText(mbti, cardX + 60, cardY + cardHeight - 60);
	context.textAlign = "right";
	context.fillStyle = "rgba(255,255,255,0.6)";
	context.font = "300 18px Inter, sans-serif";
	context.fillText(source.copy.resultSite, cardX + cardWidth - 60, cardY + cardHeight - 95);
	context.fillStyle = "rgba(255,255,255,0.95)";
	context.font = "500 28px Inter, sans-serif";
	context.fillText(source.copy.resultHandle, cardX + cardWidth - 60, cardY + cardHeight - 60);
	context.restore();
	context.save();
	roundRect(context, cardX, cardY, cardWidth, cardHeight, radius);
	context.clip();
	context.globalAlpha = .06;
	for (let index = 0; index < 3e3; index += 1) {
		context.fillStyle = Math.random() > .5 ? "#fff" : "#000";
		context.fillRect(cardX + Math.random() * cardWidth, cardY + Math.random() * cardHeight, 1.5, 1.5);
	}
	context.restore();
	return canvas.toDataURL("image/jpeg", .92);
}
//#endregion
//#region src/lib/features/mobile/state.ts
var emptySelection = [
	null,
	null,
	null,
	null
];
var state = writable({
	payload: null,
	screen: "welcome",
	selection: emptySelection,
	submitLoading: false,
	resultImage: "",
	showSaveHint: false,
	socketConnected: false,
	error: ""
});
var mobileState = {
	subscribe: state.subscribe,
	hydrate(payload) {
		state.update((current) => ({
			...current,
			payload
		}));
	},
	goTo(screen) {
		state.update((current) => ({
			...current,
			screen
		}));
	},
	pick(dimension, value) {
		state.update((current) => ({
			...current,
			selection: current.selection.map((entry, index) => index === dimension ? value : entry)
		}));
	},
	startSubmit() {
		state.update((current) => ({
			...current,
			submitLoading: true,
			error: ""
		}));
	},
	finishSubmit(resultImage) {
		state.update((current) => ({
			...current,
			submitLoading: false,
			resultImage,
			showSaveHint: true,
			screen: "result"
		}));
	},
	failSubmit(message) {
		state.update((current) => ({
			...current,
			submitLoading: false,
			error: message
		}));
	},
	setSocketConnected(socketConnected) {
		state.update((current) => ({
			...current,
			socketConnected
		}));
	},
	reset() {
		state.set({
			payload: null,
			screen: "welcome",
			selection: emptySelection,
			submitLoading: false,
			resultImage: "",
			showSaveHint: false,
			socketConnected: false,
			error: ""
		});
	}
};
var mobilePayload = derived(mobileState, ($state) => $state.payload);
var mobileScreen = derived(mobileState, ($state) => $state.screen);
var mobileSelection = derived(mobileState, ($state) => $state.selection);
var mobileSubmitLoading = derived(mobileState, ($state) => $state.submitLoading);
var mobileResultImage = derived(mobileState, ($state) => $state.resultImage);
var mobileShowSaveHint = derived(mobileState, ($state) => $state.showSaveHint);
var mobileError = derived(mobileState, ($state) => $state.error);
var mobileSelectedMbti = derived(mobileState, ($state) => $state.selection.every(Boolean) ? $state.selection.join("") : null);
var mobileSelectionCount = derived(mobileState, ($state) => $state.selection.filter(Boolean).length);
var mobileSelectionCode = derived(mobileState, ($state) => $state.selection.filter(Boolean).join(""));
var mobileSubmitDisabled = derived([mobileSelectedMbti, mobileSubmitLoading], ([$mobileSelectedMbti, $mobileSubmitLoading]) => !$mobileSelectedMbti || $mobileSubmitLoading);
var mobileSubmitLabel = derived([mobilePayload, mobileSubmitLoading], ([$mobilePayload, $mobileSubmitLoading]) => {
	if (!$mobilePayload) return "";
	return $mobileSubmitLoading ? $mobilePayload.copy.submitLoading : $mobilePayload.copy.submitIdle;
});
var mobileCardMetaName = derived([
	mobilePayload,
	mobileSelectedMbti,
	mobileSelectionCode
], ([$mobilePayload, $mobileSelectedMbti, $mobileSelectionCode]) => {
	if (!$mobilePayload) return "";
	return $mobileSelectedMbti ? $mobilePayload.mbti.names[$mobileSelectedMbti] : $mobileSelectionCode || $mobilePayload.copy.resultDefaultName;
});
var mobileCardMetaSub = derived([
	mobilePayload,
	mobileSelectedMbti,
	mobileSelectionCount
], ([$mobilePayload, $mobileSelectedMbti, $mobileSelectionCount]) => {
	if (!$mobilePayload) return "";
	return $mobileSelectedMbti ? $mobileSelectedMbti : $mobileSelectionCount > 0 ? `${$mobileSelectionCount}/4` : $mobilePayload.copy.resultDefaultSubtitle;
});
var mobileCardMetaNum = derived([
	mobilePayload,
	mobileSelectedMbti,
	mobileSelectionCode
], ([$mobilePayload, $mobileSelectedMbti, $mobileSelectionCode]) => {
	if (!$mobilePayload) return "";
	return $mobileSelectedMbti || $mobileSelectionCode || $mobilePayload.copy.resultDefaultName;
});
var mobileCardGradient = derived([
	mobilePayload,
	mobileSelection,
	mobileSelectedMbti
], ([$mobilePayload, $mobileSelection, $mobileSelectedMbti]) => $mobilePayload ? computeCardGradient($mobileSelection, $mobileSelectedMbti, $mobilePayload) : {
	c0: "#eceef5",
	c1: "#dcdee7",
	c2: "#cfd2de",
	c3: "#bec2d2"
});
//#endregion
//#region src/lib/features/mobile/realtime.ts
var socket = null;
function resolveLuckyColor(payload) {
	const source = get(mobilePayload);
	if (!source) {
		mobileState.failSubmit("Missing mobile payload");
		return;
	}
	const image = renderMobileHoloCard(payload, source);
	if (!image) {
		mobileState.failSubmit("Failed to render result card");
		return;
	}
	mobileState.finishSubmit(image);
}
function submitCurrentMbti() {
	const mbti = get(mobileSelectedMbti);
	const source = get(mobilePayload);
	if (!mbti || !source) return;
	mobileState.startSubmit();
	if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(50);
	if (socket?.connected) {
		window.setTimeout(() => {
			socket?.emit("submit_mbti", { mbti });
		}, 1500);
		return;
	}
	window.setTimeout(() => {
		resolveLuckyColor({
			mbti,
			color: source.mbti.colors[mbti],
			nickname: source.mbti.names[mbti],
			luckyPhrase: source.copy.resultTagline,
			count: 1
		});
	}, 900);
}
//#endregion
//#region src/lib/features/mobile/constants.ts
var placeholders = [
	"M",
	"B",
	"T",
	"I"
];
var dimensions = [
	{
		dimension: 0,
		options: [{
			value: "E",
			label: "Extrovert"
		}, {
			value: "I",
			label: "Introvert"
		}]
	},
	{
		dimension: 1,
		options: [{
			value: "N",
			label: "Intuitive"
		}, {
			value: "S",
			label: "Sensing"
		}]
	},
	{
		dimension: 2,
		options: [{
			value: "T",
			label: "Thinking"
		}, {
			value: "F",
			label: "Feeling"
		}]
	},
	{
		dimension: 3,
		options: [{
			value: "J",
			label: "Judging"
		}, {
			value: "P",
			label: "Perceiving"
		}]
	}
];
//#endregion
//#region src/lib/components/mobile/MbtiCard.svelte
function MbtiCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { cardKicker, cardKickerSub, selection, cardGradient, cardMetaName, cardMetaSub, cardMetaNum } = $$props;
		$$renderer.push(`<div class="mbti-card svelte-179yfkp"${attr_style(`--cc0:${cardGradient.c0};--cc1:${cardGradient.c1};--cc2:${cardGradient.c2};--cc3:${cardGradient.c3}`)}><div class="card-inner svelte-179yfkp"><div class="card-top svelte-179yfkp"><div class="card-kicker svelte-179yfkp">${escape_html(cardKicker)} <span class="sm svelte-179yfkp">${escape_html(cardKickerSub)}</span></div> <div class="card-badge svelte-179yfkp"></div></div> <div class="card-letters svelte-179yfkp"><div class="preview svelte-179yfkp" id="preview"><!--[-->`);
		const each_array = ensure_array_like([
			0,
			1,
			2,
			3
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let index = each_array[$$index];
			$$renderer.push(`<div${attr_class("preview-letter svelte-179yfkp", void 0, { "placeholder": !selection[index] })}>${escape_html(selection[index] ?? placeholders[index])}</div>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card-bottom svelte-179yfkp"><div><div class="card-name-cn svelte-179yfkp">${escape_html(cardMetaName)}</div> <div class="card-name-en svelte-179yfkp">${escape_html(cardMetaSub)}</div></div> <div class="card-num svelte-179yfkp">${escape_html(cardMetaNum)}</div></div></div></div>`);
	});
}
//#endregion
//#region src/lib/components/mobile/MbtiScreen.svelte
function MbtiScreen($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { hidden, hTitle, hSub, cardKicker, cardKickerSub, selection, cardGradient, cardMetaName, cardMetaSub, cardMetaNum, submitDisabled, submitLabel, onPick, onSubmit } = $$props;
		$$renderer.push(`<div id="s-mbti"${attr_class("screen svelte-133g89f", void 0, { "hidden": hidden })}><div class="h-title svelte-133g89f">${escape_html(hTitle)}</div> <div class="h-sub svelte-133g89f">${escape_html(hSub)}</div> `);
		MbtiCard($$renderer, {
			cardKicker,
			cardKickerSub,
			selection,
			cardGradient,
			cardMetaName,
			cardMetaSub,
			cardMetaNum
		});
		$$renderer.push(`<!----> <!--[-->`);
		const each_array = ensure_array_like(dimensions);
		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let row = each_array[$$index_1];
			$$renderer.push(`<div class="dim-row svelte-133g89f"><!--[-->`);
			const each_array_1 = ensure_array_like(row.options);
			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let option = each_array_1[$$index];
				$$renderer.push(`<button${attr_class("dim-btn svelte-133g89f", void 0, { "sel": selection[row.dimension] === option.value })} type="button"><span class="big svelte-133g89f">${escape_html(option.value)}</span> <span class="hint svelte-133g89f">${escape_html(option.label)}</span></button>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--> <div class="submit-row svelte-133g89f"><button class="btn accent svelte-133g89f" id="submit-btn" type="button"${attr("disabled", submitDisabled, true)}>${escape_html(submitLabel)}</button></div></div>`);
	});
}
//#endregion
//#region src/lib/components/mobile/ResultScreen.svelte
function ResultScreen($$renderer, $$props) {
	let { hidden, resultImage, saveHint } = $$props;
	$$renderer.push(`<div id="s-result"${attr_class("screen svelte-n0q65y", void 0, { "hidden": hidden })}>`);
	if (resultImage) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<img id="holo-card" alt="Colorfield MBTI Card"${attr("src", resultImage)} class="svelte-n0q65y"/>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> `);
	if (saveHint) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<p id="save-hint" class="svelte-n0q65y">${escape_html(saveHint)}</p>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
//#region src/lib/components/mobile/WelcomeScreen.svelte
function WelcomeScreen($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { hidden, title, subtitle, descriptionLines, startButton, onStart } = $$props;
		$$renderer.push(`<div id="s-welcome"${attr_class("screen svelte-sb8hbz", void 0, { "hidden": hidden })}><div class="title svelte-sb8hbz">${escape_html(title)}</div> <div class="subtitle svelte-sb8hbz">${escape_html(subtitle)}</div> <div class="desc svelte-sb8hbz">${escape_html(descriptionLines[0])}<br/> ${escape_html(descriptionLines[1])}</div> <button class="btn accent svelte-sb8hbz" type="button">${escape_html(startButton)}</button></div>`);
	});
}
//#endregion
//#region src/lib/components/mobile/JoinExperience.svelte
function JoinExperience($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { payload } = $$props;
		let bootPhase = 1;
		$$renderer.push(`<div class="mobile-stage"><div class="noise-overlay"></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="startup-overlay svelte-7tsnkf"><div class="startup-card svelte-7tsnkf"><div class="startup-label svelte-7tsnkf">正在啟動</div> <div class="startup-flow svelte-7tsnkf" aria-label="startup progress 1 2 3"><span${attr_class("svelte-7tsnkf", void 0, { "active": bootPhase >= 1 })}>1</span> <span class="startup-arrow svelte-7tsnkf">></span> <span${attr_class("svelte-7tsnkf", void 0, { "active": bootPhase >= 2 })}>2</span> <span class="startup-arrow svelte-7tsnkf">></span> <span${attr_class("svelte-7tsnkf", void 0, { "active": bootPhase >= 3 })}>3</span></div></div></div>`);
		$$renderer.push(`<!--]--> `);
		if (store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload)) {
			$$renderer.push("<!--[0-->");
			WelcomeScreen($$renderer, {
				hidden: store_get($$store_subs ??= {}, "$mobileScreen", mobileScreen) !== "welcome",
				title: store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload).copy.title,
				subtitle: store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload).copy.subtitle,
				descriptionLines: store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload).copy.descriptionLines,
				startButton: store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload).copy.startButton,
				onStart: () => mobileState.goTo("mbti")
			});
			$$renderer.push(`<!----> `);
			MbtiScreen($$renderer, {
				hidden: store_get($$store_subs ??= {}, "$mobileScreen", mobileScreen) !== "mbti",
				hTitle: store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload).copy.hTitle,
				hSub: store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload).copy.hSub,
				cardKicker: store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload).copy.cardKicker,
				cardKickerSub: store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload).copy.cardKickerSub,
				selection: store_get($$store_subs ??= {}, "$mobileSelection", mobileSelection),
				cardGradient: store_get($$store_subs ??= {}, "$mobileCardGradient", mobileCardGradient),
				cardMetaName: store_get($$store_subs ??= {}, "$mobileCardMetaName", mobileCardMetaName),
				cardMetaSub: store_get($$store_subs ??= {}, "$mobileCardMetaSub", mobileCardMetaSub),
				cardMetaNum: store_get($$store_subs ??= {}, "$mobileCardMetaNum", mobileCardMetaNum),
				submitDisabled: store_get($$store_subs ??= {}, "$mobileSubmitDisabled", mobileSubmitDisabled),
				submitLabel: store_get($$store_subs ??= {}, "$mobileSubmitLabel", mobileSubmitLabel),
				onPick: (dimension, value) => mobileState.pick(dimension, value),
				onSubmit: submitCurrentMbti
			});
			$$renderer.push(`<!----> `);
			ResultScreen($$renderer, {
				hidden: store_get($$store_subs ??= {}, "$mobileScreen", mobileScreen) !== "result",
				resultImage: store_get($$store_subs ??= {}, "$mobileResultImage", mobileResultImage),
				saveHint: store_get($$store_subs ??= {}, "$mobileShowSaveHint", mobileShowSaveHint) ? store_get($$store_subs ??= {}, "$mobilePayload", mobilePayload).copy.saveHint : ""
			});
			$$renderer.push(`<!---->`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (store_get($$store_subs ??= {}, "$mobileError", mobileError)) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mobile-error svelte-7tsnkf">${escape_html(store_get($$store_subs ??= {}, "$mobileError", mobileError))}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/routes/(app)/mobile/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		head("1rxcssy", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Colorfield Mobile</title>`);
			});
		});
		JoinExperience($$renderer, { payload: data.payload });
	});
}
//#endregion
export { _page as default };
