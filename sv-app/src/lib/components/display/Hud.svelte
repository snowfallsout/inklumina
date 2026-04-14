<script lang="ts">
	import { displayState, displayWaitingVisible } from '$lib/features/display/state';
	import { loadSessionOverview } from '$lib/features/display/session';
</script>

<div id="interaction-hint">{$displayState.hints.interaction}</div>
<button
	id="session-btn"
	type="button"
	onclick={() => {
		displayState.openSessionPanel();
		void loadSessionOverview();
	}}
>{$displayState.sessionControls.buttonLabel}</button>
{#if $displayWaitingVisible}
	<div id="waiting">{$displayState.hints.waiting}</div>
{/if}

<style>
	#interaction-hint {
		position: absolute;
		bottom: 60px;
		left: 50%;
		transform: translateX(-50%);
		color: rgba(30,40,60,0.72);
		font-size: 11px;
		font-weight: 300;
		letter-spacing: 3px;
		text-align: center;
		pointer-events: none;
		white-space: nowrap;
		text-shadow: 0 1px 4px rgba(255,255,255,0.6), 0 0 16px rgba(255,255,255,0.4);
		animation: breath 4s ease-in-out infinite;
	}

	#waiting {
		position: absolute;
		bottom: 100px;
		left: 50%;
		transform: translateX(-50%);
		color: rgba(30,40,60,0.28);
		font-size: 12px;
		letter-spacing: 3px;
		text-align: center;
		pointer-events: none;
		animation: breath 3s ease-in-out infinite;
	}

	#session-btn {
		position: absolute;
		bottom: 26px;
		left: 50%;
		transform: translateX(-50%);
		background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15));
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255,255,255,0.5);
		border-radius: 30px;
		color: rgba(30,40,60,0.5);
		font-size: 10px;
		letter-spacing: 2px;
		padding: 7px 18px;
		cursor: pointer;
		pointer-events: all;
		transition: background .2s, color .2s;
		text-transform: uppercase;
	}

	#session-btn:hover {
		background: rgba(255,255,255,0.6);
		color: rgba(30,40,60,0.85);
	}

	@keyframes breath {
		0%, 100% { opacity: .18; }
		50% { opacity: .45; }
	}
</style>
