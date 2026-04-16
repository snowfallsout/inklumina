import "../../../../chunks/index-server.js";
import { E as derived, H as escape_html, V as attr, a as ensure_array_like, c as store_get, k as writable, l as unsubscribe_stores, n as attr_class, r as attr_style } from "../../../../chunks/dev.js";
import "../../../../chunks/index-server2.js";
import "../../../../chunks/socket-client.js";
import "qrcode";
//#region src/lib/features/display/state.ts
function createDefaultLegendRows() {
	return [
		{
			color: "#4B0082",
			label: "INTJ",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#6495ED",
			label: "INTP",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#FF4500",
			label: "ENTJ",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#FF00FF",
			label: "ENTP",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#00A86B",
			label: "INFJ",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#DA70D6",
			label: "INFP",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#FC913A",
			label: "ENFJ",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#92FE9D",
			label: "ENFP",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#95A5A6",
			label: "ISTJ",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#BDB76B",
			label: "ISFJ",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#4682B4",
			label: "ESTJ",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#FFB6C1",
			label: "ESFJ",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#4A4A4A",
			label: "ISTP",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#00CED1",
			label: "ISFP",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#FF2400",
			label: "ESTP",
			fillPercent: 0,
			count: 0
		},
		{
			color: "#7B68EE",
			label: "ESFP",
			fillPercent: 0,
			count: 0
		}
	];
}
function withLegendCounts(rows, counts, total) {
	return rows.map((row) => {
		const count = counts[row.label] ?? 0;
		return {
			...row,
			count,
			fillPercent: total > 0 ? count / total * 100 : 0
		};
	});
}
var baseLegendRows = createDefaultLegendRows();
var state$1 = writable({
	header: {
		title: "Colorfield",
		subtitle: "MBTI · Emotion · Particle Art",
		emotionBadge: "● FACE TRACKING",
		cameraToggleOff: "◎ 摄像头 OFF",
		cameraToggleOn: "◎ 摄像头 ON",
		handBadge: "✋ HAND TRACKING INIT"
	},
	legend: {
		title: "Present",
		rows: baseLegendRows
	},
	hints: {
		interaction: "Try smiling · Pinch your fingers and move your hands",
		waiting: "Waiting for participants to join..."
	},
	sessionControls: { buttonLabel: "⊕ 新场次 / 历史" },
	footer: {
		participantsLabel: "Participants",
		participantCount: 0,
		scanToJoinLabel: "SCAN TO JOIN",
		qrHintLines: ["在活动管理中", "设置局域网 IP"]
	},
	sessionPanel: {
		open: false,
		loading: false,
		saving: false,
		error: "",
		draftName: "",
		hostInput: "",
		joinUrl: "",
		joinQrDataUrl: "",
		history: [],
		selected: null,
		closeLabel: "关闭场次管理",
		title: "活动场次管理",
		newSessionPlaceholder: "新活动名称（可留空）",
		newSessionButtonLabel: "开始新场次",
		ipPlaceholder: "PC 局域网 IP（如 192.168.0.68）",
		generateQrButtonLabel: "生成二维码",
		qrHint: "SCAN TO JOIN · 手机扫码加入",
		historyTitle: "历史记录",
		emptyHistory: "暂无历史记录"
	},
	cameraEnabled: false,
	sessionName: ""
});
var displayState = {
	subscribe: state$1.subscribe,
	set: state$1.set,
	update: state$1.update,
	patch(patch) {
		state$1.update((current) => ({
			...current,
			header: patch.header ?? current.header,
			legend: patch.legend ?? current.legend,
			hints: patch.hints ?? current.hints,
			sessionControls: patch.sessionControls ?? current.sessionControls,
			footer: patch.footer ?? current.footer,
			sessionName: patch.sessionName ?? current.sessionName,
			sessionPanel: patch.sessionPanel ? {
				...current.sessionPanel,
				...patch.sessionPanel
			} : current.sessionPanel,
			cameraEnabled: current.cameraEnabled
		}));
	},
	toggleCamera() {
		state$1.update((current) => {
			const nextCameraEnabled = !current.cameraEnabled;
			const legacyToggleCamera = window.toggleCamera;
			if (typeof legacyToggleCamera === "function") legacyToggleCamera();
			return {
				...current,
				cameraEnabled: nextCameraEnabled
			};
		});
	},
	openSessionPanel() {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				open: true,
				error: ""
			}
		}));
	},
	closeSessionPanel() {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				open: false,
				selected: null,
				error: ""
			}
		}));
	},
	setSessionName(sessionName) {
		state$1.update((current) => ({
			...current,
			sessionName
		}));
	},
	setLegendRows(rows) {
		state$1.update((current) => ({
			...current,
			legend: {
				...current.legend,
				rows
			}
		}));
	},
	setParticipantCount(participantCount) {
		state$1.update((current) => ({
			...current,
			footer: {
				...current.footer,
				participantCount
			}
		}));
	},
	setSessionDraftName(draftName) {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				draftName
			}
		}));
	},
	setSessionHostInput(hostInput) {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				hostInput
			}
		}));
	},
	setSessionPanelLoading(loading) {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				loading
			}
		}));
	},
	setSessionPanelSaving(saving) {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				saving
			}
		}));
	},
	setSessionPanelError(error) {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				error
			}
		}));
	},
	setSessionHistory(history) {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				history
			}
		}));
	},
	setSelectedSession(selected) {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				selected
			}
		}));
	},
	setJoinQr(joinUrl, joinQrDataUrl) {
		state$1.update((current) => ({
			...current,
			sessionPanel: {
				...current.sessionPanel,
				joinUrl,
				joinQrDataUrl
			}
		}));
	},
	applySocketState(payload) {
		const total = payload.total ?? 0;
		state$1.update((current) => ({
			...current,
			sessionName: payload.session?.name ?? current.sessionName,
			legend: {
				...current.legend,
				rows: withLegendCounts(baseLegendRows, payload.counts ?? {}, total)
			},
			footer: {
				...current.footer,
				participantCount: total
			}
		}));
	},
	applySpawnParticles(payload) {
		const total = payload.total ?? 0;
		state$1.update((current) => ({
			...current,
			sessionName: payload.session?.name ?? current.sessionName,
			legend: {
				...current.legend,
				rows: withLegendCounts(baseLegendRows, payload.counts ?? {}, total)
			},
			footer: {
				...current.footer,
				participantCount: total
			}
		}));
	},
	applySessionReset(payload) {
		state$1.update((current) => ({
			...current,
			sessionName: payload.session.name,
			legend: {
				...current.legend,
				rows: withLegendCounts(baseLegendRows, {}, 0)
			},
			footer: {
				...current.footer,
				participantCount: 0
			},
			sessionPanel: {
				...current.sessionPanel,
				draftName: "",
				selected: null
			}
		}));
	}
};
var displayLegendRows = derived(displayState, ($state) => $state.legend.rows);
var displaySessionPanelOpen = derived(displayState, ($state) => $state.sessionPanel.open);
var displayWaitingVisible = derived(displayState, ($state) => $state.footer.participantCount === 0);
//#endregion
//#region src/lib/components/display/Header.svelte
function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		$$renderer.push(`<div id="header" class="svelte-1nzhw6y"><h1 class="svelte-1nzhw6y">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).header.title)}</h1> <p class="svelte-1nzhw6y">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).header.subtitle)}</p></div> <button id="cam-toggle" type="button"${attr_class("svelte-1nzhw6y", void 0, { "on": store_get($$store_subs ??= {}, "$displayState", displayState).cameraEnabled })}>${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).cameraEnabled ? store_get($$store_subs ??= {}, "$displayState", displayState).header.cameraToggleOn : store_get($$store_subs ??= {}, "$displayState", displayState).header.cameraToggleOff)}</button> <div id="session-name" class="svelte-1nzhw6y">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionName)}</div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/lib/components/display/Legend.svelte
function Legend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { legend = void 0 } = $$props;
		$$renderer.push(`<div id="legend"><h3>${escape_html(legend?.title ?? store_get($$store_subs ??= {}, "$displayState", displayState).legend.title)}</h3> <div id="legend-rows" class="svelte-1jtmhsi"><!--[-->`);
		const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$displayLegendRows", displayLegendRows));
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let row = each_array[$$index];
			$$renderer.push(`<div class="row"><div class="dot"${attr_style(`background:${row.color};--c:${row.color}`)}></div> <span class="lbl">${escape_html(row.label)}</span> <div class="track"><div class="fill"${attr_style(`background:${row.color};width:${row.fillPercent}%`)}></div></div> <span class="cnt">${escape_html(row.count)}</span></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/lib/components/display/Hud.svelte
function Hud($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		$$renderer.push(`<div id="interaction-hint" class="svelte-1q5kzhs">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).hints.interaction)}</div> <button id="session-btn" type="button" class="svelte-1q5kzhs">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionControls.buttonLabel)}</button> `);
		if (store_get($$store_subs ??= {}, "$displayWaitingVisible", displayWaitingVisible)) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div id="waiting" class="svelte-1q5kzhs">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).hints.waiting)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/lib/components/display/Footer.svelte
function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		$$renderer.push(`<div id="footer" class="svelte-d3348"><div id="total-block" class="svelte-d3348">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).footer.participantsLabel)} <strong id="total-num" class="svelte-d3348">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).footer.participantCount)}</strong></div> <div id="join-block" class="svelte-d3348"><b class="svelte-d3348">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).footer.scanToJoinLabel)}</b> <div id="corner-qr-box" class="svelte-d3348">`);
		if (store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.joinQrDataUrl) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<img id="corner-qr" alt="Join QR code"${attr("src", store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.joinQrDataUrl)} class="svelte-d3348"/>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div id="corner-qr-url" class="svelte-d3348">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.joinUrl)}</div> `);
		if (!store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.joinQrDataUrl) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div id="corner-qr-hint" class="svelte-d3348"><!--[-->`);
			const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$displayState", displayState).footer.qrHintLines);
			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let line = each_array[index];
				$$renderer.push(`<!---->${escape_html(line)}`);
				if (index < store_get($$store_subs ??= {}, "$displayState", displayState).footer.qrHintLines.length - 1) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<br/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/lib/components/display/SessionManager.svelte
function SessionManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		function formatSessionDate(value) {
			if (!value) return "Unknown time";
			const date = new Date(value);
			return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
		}
		$$renderer.push(`<div id="session-panel" role="dialog" aria-modal="true" tabindex="-1"${attr_class("svelte-126twis", void 0, { "open": store_get($$store_subs ??= {}, "$displaySessionPanelOpen", displaySessionPanelOpen) })}><button id="sp-close" type="button"${attr("aria-label", store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.closeLabel)} class="svelte-126twis">×</button> <div id="session-box" class="svelte-126twis"><h2 class="svelte-126twis">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.title)}</h2> <div class="sp-new svelte-126twis"><input id="sp-name-input" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.newSessionPlaceholder)} maxlength="30"${attr("value", store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.draftName)} class="svelte-126twis"/> <button id="sp-create-btn" class="sp-btn svelte-126twis" type="button"${attr("disabled", store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.saving, true)}>${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.newSessionButtonLabel)}</button></div> <div class="sp-join-settings svelte-126twis"><div class="sp-join-row svelte-126twis"><input id="sp-ip-input" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.ipPlaceholder)}${attr("value", store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.hostInput)} class="svelte-126twis"/> <button id="sp-generate-qr-btn" class="sp-btn svelte-126twis" type="button">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.generateQrButtonLabel)}</button></div> <div id="sp-qr-wrap"${attr_class("svelte-126twis", void 0, { "open": Boolean(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.joinQrDataUrl) })}>`);
		if (store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.joinQrDataUrl) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<img id="sp-qr" alt="Session join QR code"${attr("src", store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.joinQrDataUrl)} class="svelte-126twis"/>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div id="sp-qr-url" class="svelte-126twis">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.joinUrl)}</div> <div class="sp-qr-hint svelte-126twis">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.qrHint)}</div></div></div> `);
		if (store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="sp-error svelte-126twis">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div id="sp-history-title" class="svelte-126twis">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.historyTitle)}</div> <div id="sp-history-list">`);
		if (store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.loading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="sp-empty svelte-126twis">Loading…</div>`);
		} else if (store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.history.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="sp-empty svelte-126twis">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.emptyHistory)}</div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.history);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let session = each_array[$$index];
				$$renderer.push(`<div class="sp-row"><div class="sp-row-info"><div class="sp-row-name">${escape_html(session.name)}</div> <div class="sp-row-meta">${escape_html(formatSessionDate(session.createdAt))} · ${escape_html(session.total)} 人参与</div></div> <button class="sp-btn svelte-126twis" type="button">查看</button> <button class="sp-btn danger svelte-126twis" type="button">删除</button></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.selected) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="sp-detail svelte-126twis"><div class="sp-detail-title svelte-126twis">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.selected.name)}</div> <div class="sp-detail-meta svelte-126twis">建立: ${escape_html(formatSessionDate(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.selected.createdAt))}</div> <div class="sp-detail-meta svelte-126twis">总人数: ${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.selected.total)}</div> `);
			if (Object.keys(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.selected.counts).length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="sp-detail-list svelte-126twis"><!--[-->`);
				const each_array_1 = ensure_array_like(Object.entries(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.selected.counts).sort((left, right) => right[1] - left[1]));
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let [mbti, count] = each_array_1[$$index_1];
					$$renderer.push(`<div class="sp-detail-item svelte-126twis"><span>${escape_html(mbti)}</span> <strong>${escape_html(count)}</strong></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.selected.participants?.length) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="sp-participants-title svelte-126twis">参与者</div> <div class="sp-participants-list svelte-126twis"><!--[-->`);
				const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$displayState", displayState).sessionPanel.selected.participants);
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let participant = each_array_2[$$index_2];
					$$renderer.push(`<div class="sp-participant-item svelte-126twis"><span>${escape_html(participant.mbti)} · ${escape_html(participant.nickname)}</span> <time class="svelte-126twis">${escape_html(formatSessionDate(participant.createdAt))}</time></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/lib/components/display/Frame.svelte
function Frame($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let bootPhase = 1;
		$$renderer.push(`<div class="display-route"><div class="noise-overlay"></div> <div id="scene-bg"></div> <video id="video-bg" autoplay="" muted="" playsinline=""></video> <canvas id="canvas"></canvas> <div id="ui">`);
		Header($$renderer, {});
		$$renderer.push(`<!----> `);
		Legend($$renderer, { legend: store_get($$store_subs ??= {}, "$displayState", displayState).legend });
		$$renderer.push(`<!----> `);
		Hud($$renderer, {});
		$$renderer.push(`<!----> `);
		Footer($$renderer, {});
		$$renderer.push(`<!----></div> <div id="emotion-badge" class="svelte-1b4y4s0">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).header.emotionBadge)}</div> <div id="hand-badge" class="svelte-1b4y4s0">${escape_html(store_get($$store_subs ??= {}, "$displayState", displayState).header.handBadge)}</div> `);
		SessionManager($$renderer, {});
		$$renderer.push(`<!----> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="startup-overlay svelte-1b4y4s0"><div class="startup-card svelte-1b4y4s0"><div class="startup-label svelte-1b4y4s0">正在啟動</div> <div class="startup-flow svelte-1b4y4s0" aria-label="startup progress 1 2 3"><span${attr_class("svelte-1b4y4s0", void 0, { "active": bootPhase >= 1 })}>1</span> <span class="startup-arrow svelte-1b4y4s0">></span> <span${attr_class("svelte-1b4y4s0", void 0, { "active": bootPhase >= 2 })}>2</span> <span class="startup-arrow svelte-1b4y4s0">></span> <span${attr_class("svelte-1b4y4s0", void 0, { "active": bootPhase >= 3 })}>3</span></div></div></div>`);
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
var HAND_CONNECTIONS = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	[0, 5],
	[5, 6],
	[6, 7],
	[7, 8],
	[5, 9],
	[9, 10],
	[10, 11],
	[11, 12],
	[9, 13],
	[13, 14],
	[14, 15],
	[15, 16],
	[13, 17],
	[17, 18],
	[18, 19],
	[19, 20],
	[0, 17]
];
var SMILE_EMOJIS = [
	"🔴",
	"🟠",
	"🟡",
	"🟢",
	"🔵",
	"🟣",
	"⚫",
	"⚪",
	"🟤",
	"🔶",
	"🔷",
	"🔸",
	"🔹",
	"🔺",
	"🔻",
	"💠",
	"🔘",
	"🔲",
	"🔳",
	"✨",
	"💫",
	"⚡",
	"🔥",
	"💥",
	"🌟",
	"⭐",
	"🌈",
	"☀️",
	"🌤️",
	"⛅",
	"🌥️",
	"☁️",
	"🌦️",
	"🌧️",
	"⛈️",
	"🌩️",
	"🌨️",
	"❄️",
	"☃️",
	"⛄",
	"🌬️",
	"💨",
	"🌀",
	"🌊",
	"💧",
	"💦",
	"☔",
	"⛱️",
	"🌙",
	"🌛",
	"🌜",
	"🌚",
	"🌝",
	"🌞",
	"☄️",
	"🌪️",
	"🌱",
	"🌿",
	"🍀",
	"🍃",
	"🍂",
	"🍁",
	"🌵",
	"🌾",
	"🎋",
	"🎍",
	"🌺",
	"🌸",
	"🌼",
	"🌻",
	"🌹",
	"🥀",
	"🌷",
	"🪷",
	"🪴",
	"🌲",
	"🌳",
	"🌴",
	"🪵",
	"🪨"
];
Math.PI * 2;
Math.PI * 2;
//#endregion
//#region src/lib/features/display/runtime/draw.ts
function mapToCanvas$1(state, normX, normY) {
	if (!state.video || state.video.videoWidth === 0) return {
		x: 0,
		y: 0
	};
	const scale = Math.max(state.W / state.video.videoWidth, state.H / state.video.videoHeight);
	const drawWidth = state.video.videoWidth * scale;
	const drawHeight = state.video.videoHeight * scale;
	const offsetX = (state.W - drawWidth) / 2;
	const offsetY = (state.H - drawHeight) / 2;
	return {
		x: offsetX + (1 - normX) * drawWidth,
		y: offsetY + normY * drawHeight
	};
}
function getRandomSmileEmoji() {
	return SMILE_EMOJIS[Math.floor(Math.random() * SMILE_EMOJIS.length)] ?? "😊";
}
function getOrCreateSmileEmoji(state) {
	if (state.emojiEl) return state.emojiEl;
	const element = document.createElement("div");
	element.className = "smile-emoji-persistent";
	document.getElementById("ui")?.appendChild(element);
	state.emojiEl = element;
	return element;
}
function tickSmileEmoji$1(state) {
	const anySmiling = (state.faces || []).some((face) => face.smile);
	const element = getOrCreateSmileEmoji(state);
	if (anySmiling) {
		const smilingFace = (state.faces || []).find((face) => face.smile);
		if (smilingFace && !state.wasAnySmiling) element.textContent = getRandomSmileEmoji();
		if (smilingFace) {
			element.style.left = `${smilingFace.x}px`;
			element.style.top = `${smilingFace.y - 70}px`;
			element.style.opacity = "1";
			element.style.transform = "scale(1)";
		}
	} else {
		element.style.opacity = "0";
		element.style.transform = "scale(0.5)";
	}
	state.wasAnySmiling = anySmiling;
}
function tickDrawMode$1(state) {
	const drawMode = state.drawMode;
	const nonFieldParticles = (state.particles || []).filter((particle) => particle.sizeClass !== "field");
	const total = nonFieldParticles.length || 1;
	if (state.activePinchPoints && state.activePinchPoints.length > 0) {
		const pinchPoint = state.activePinchPoints[0];
		const ratio = nonFieldParticles.filter((particle) => {
			const dx = particle.x - pinchPoint.x;
			const dy = particle.y - pinchPoint.y;
			return dx * dx + dy * dy < 14400;
		}).length / total;
		if (drawMode.phase === "idle" || drawMode.phase === "gathering") {
			drawMode.phase = "gathering";
			if (ratio >= .55) {
				drawMode.gatherTimer++;
				const pct = Math.round(drawMode.gatherTimer / 40 * 100);
				const badge = document.getElementById("hand-badge");
				if (badge) badge.textContent = `🤌 GATHERING ${pct}% — keep still…`;
			} else drawMode.gatherTimer = Math.max(0, drawMode.gatherTimer - 2);
			if (drawMode.gatherTimer >= 40) {
				drawMode.phase = "drawing";
				drawMode.strokePath = [];
				drawMode.gatherTimer = 0;
				const badge = document.getElementById("hand-badge");
				if (badge) badge.textContent = "✏️ DRAWING MODE — move to paint!";
			}
		}
		if (drawMode.phase === "drawing") {
			drawMode.strokePath.push({
				x: pinchPoint.x,
				y: pinchPoint.y,
				t: Date.now()
			});
			if (drawMode.strokePath.length > 800) drawMode.strokePath.shift();
			if (drawMode.strokePath.length > 2) for (let index = 0; index < nonFieldParticles.length; index++) {
				const particle = nonFieldParticles[index];
				const progress = index / nonFieldParticles.length;
				const pathIndex = Math.floor(progress * (drawMode.strokePath.length - 1));
				const point = drawMode.strokePath[pathIndex];
				const jitter = (particle.size || 4) * 2.5;
				particle._drawTarget = {
					x: point.x + Math.sin(index * 2.399) * jitter,
					y: point.y + Math.cos(index * 2.399) * jitter
				};
			}
		}
	} else {
		if (drawMode.phase === "drawing") {
			drawMode.phase = "dissolving";
			drawMode.dissolveTimer = 0;
			for (const particle of nonFieldParticles) {
				particle._drawTarget = null;
				if (drawMode.strokePath.length > 0) {
					const last = drawMode.strokePath[drawMode.strokePath.length - 1];
					const dx = particle.x - last.x;
					const dy = particle.y - last.y;
					const distance = Math.sqrt(dx * dx + dy * dy) || 1;
					particle.vx += dx / distance * (4 + Math.random() * 6);
					particle.vy += dy / distance * (4 + Math.random() * 6);
				}
			}
			const badge = document.getElementById("hand-badge");
			if (badge) badge.textContent = "💫 DISSOLVING…";
		}
		if (drawMode.phase === "dissolving") {
			drawMode.dissolveTimer++;
			if (drawMode.dissolveTimer >= 90) {
				drawMode.phase = "idle";
				drawMode.strokePath = [];
				const badge = document.getElementById("hand-badge");
				if (badge) badge.textContent = "✋ NO HAND";
			}
		}
		if (drawMode.phase === "gathering") {
			drawMode.phase = "idle";
			drawMode.gatherTimer = 0;
		}
	}
}
function drawStrokeOverlay$1(state) {
	const drawMode = state.drawMode;
	if (drawMode.phase !== "drawing" || drawMode.strokePath.length < 2 || !state.ctx) return;
	const ctx = state.ctx;
	ctx.save();
	ctx.globalCompositeOperation = "source-over";
	for (let index = 1; index < drawMode.strokePath.length; index++) {
		const t = index / drawMode.strokePath.length;
		const age = (Date.now() - drawMode.strokePath[index].t) / 1e3;
		const fade = Math.max(0, 1 - age * .6);
		ctx.beginPath();
		ctx.moveTo(drawMode.strokePath[index - 1].x, drawMode.strokePath[index - 1].y);
		ctx.lineTo(drawMode.strokePath[index].x, drawMode.strokePath[index].y);
		ctx.strokeStyle = `rgba(255,255,255,${t * fade * .25})`;
		ctx.lineWidth = 3 + t * 6;
		ctx.lineCap = "round";
		ctx.stroke();
	}
	for (const pinchPoint of state.activePinchPoints || []) {
		const gradient = ctx.createRadialGradient(pinchPoint.x, pinchPoint.y, 0, pinchPoint.x, pinchPoint.y, 40);
		gradient.addColorStop(0, "rgba(255,255,255,0.5)");
		gradient.addColorStop(.4, "rgba(255,255,255,0.1)");
		gradient.addColorStop(1, "rgba(255,255,255,0)");
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(pinchPoint.x, pinchPoint.y, 40, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
//#endregion
//#region src/lib/features/display/runtime/core.ts
var state = {
	canvas: null,
	ctx: null,
	video: null,
	W: 0,
	H: 0,
	faces: [],
	emotion: "neutral",
	handsResults: null,
	activePinchPoints: [],
	processing: false,
	frameCounter: 0,
	camOn: false,
	emojiEl: null,
	wasAnySmiling: false,
	spriteSetCache: /* @__PURE__ */ new Map(),
	particles: [],
	mbtiParticles: {},
	faceMesh: null,
	hands: null,
	socket: null,
	drawMode: {
		phase: "idle",
		strokePath: [],
		gatherTimer: 0,
		dissolveTimer: 0
	},
	socketBound: false
};
function mapToCanvas(normX, normY) {
	return mapToCanvas$1(state, normX, normY);
}
function tickSmileEmoji() {
	tickSmileEmoji$1(state);
}
function tickDrawMode() {
	tickDrawMode$1(state);
}
function drawStrokeOverlay() {
	drawStrokeOverlay$1(state);
}
function drawFrame() {
	const ctx = state.ctx;
	if (!ctx) return;
	ctx.globalCompositeOperation = "source-over";
	ctx.clearRect(0, 0, state.W, state.H);
	tickDrawMode();
	for (const particle of state.particles) {
		particle.update(state.faces, state.emotion);
		particle.draw(ctx);
	}
	drawStrokeOverlay();
	tickSmileEmoji();
	if (state.handsResults && state.handsResults.multiHandLandmarks) {
		for (const landmarks of state.handsResults.multiHandLandmarks) {
			const points = landmarks.map((point) => mapToCanvas(point.x, point.y));
			ctx.beginPath();
			ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
			ctx.lineWidth = 1.5;
			for (const [from, to] of HAND_CONNECTIONS) {
				ctx.moveTo(points[from].x, points[from].y);
				ctx.lineTo(points[to].x, points[to].y);
			}
			ctx.stroke();
			ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
			for (const point of points) {
				ctx.beginPath();
				ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
				ctx.fill();
			}
			for (const pinchPoint of state.activePinchPoints) {
				ctx.beginPath();
				ctx.arc(pinchPoint.x, pinchPoint.y, 14, 0, Math.PI * 2);
				ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(pinchPoint.x, pinchPoint.y, 4, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
				ctx.fill();
			}
		}
		ctx.globalAlpha = 1;
	}
}
async function processFrame() {
	requestAnimationFrame(() => {
		processFrame();
	});
	state.frameCounter++;
	try {
		if (state.processing && state.video && state.video.readyState >= 2) {
			if (state.faceMesh && state.frameCounter % 2 === 0) await state.faceMesh.send({ image: state.video });
			else if (state.hands) await state.hands.send({ image: state.video });
		}
	} catch (error) {}
	try {
		drawFrame();
	} catch (err) {}
}
//#endregion
//#region src/routes/(app)/display/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		Frame($$renderer, {});
	});
}
//#endregion
export { _page as default };
