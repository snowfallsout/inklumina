<script lang="ts">
	import { displayState } from '$lib/display/state';
</script>

<div id="header">
	<h1>{$displayState.header.title}</h1>
	<p>{$displayState.header.subtitle}</p>
</div>

<div id="emotion-badge">{$displayState.header.emotionBadge}</div>
<button
	id="cam-toggle"
	type="button"
	class:on={$displayState.cameraEnabled}
	onclick={() => displayState.toggleCamera()}
>
	{$displayState.cameraEnabled ? $displayState.header.cameraToggleOn : $displayState.header.cameraToggleOff}
</button>
<div id="hand-badge">{$displayState.header.handBadge}</div>

<div id="session-name">{$displayState.sessionName}</div>

<style>
	#header {
		position: absolute;
		top: 28px;
		left: 50%;
		transform: translateX(-50%);
		text-align: center;
		white-space: nowrap;
	}

	#header h1 {
		color: rgba(30,40,60,0.85);
		font-size: 30px;
		font-weight: 100;
		letter-spacing: 18px;
		text-transform: uppercase;
		text-shadow: 0 1px 12px rgba(60,80,140,0.12);
	}

	#header p {
		color: rgba(30,40,60,0.38);
		font-size: 10px;
		letter-spacing: 5px;
		margin-top: 5px;
		text-transform: uppercase;
	}

	#emotion-badge {
		position: absolute;
		top: 28px;
		left: 28px;
		color: rgba(30,40,60,0.28);
		font-size: 10px;
		letter-spacing: 2px;
		text-transform: uppercase;
		transition: color 0.5s;
	}

	:global(#emotion-badge.smile) { color: #B08800; }
	:global(#emotion-badge.sad) { color: #4169E1; }

	#session-name {
		position: absolute;
		top: 28px;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 58px;
		color: rgba(30,40,60,0.28);
		font-size: 9px;
		letter-spacing: 3px;
		text-transform: uppercase;
		text-align: center;
		white-space: nowrap;
	}

	#cam-toggle {
		position: absolute;
		top: 28px;
		right: 22px;
		background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15));
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255,255,255,0.5);
		border-radius: 30px;
		color: rgba(30,40,60,0.5);
		font-size: 10px;
		letter-spacing: 2px;
		padding: 7px 16px;
		cursor: pointer;
		pointer-events: all;
		transition: background .2s, color .2s;
		text-transform: uppercase;
	}

	#cam-toggle:hover { background: rgba(255,255,255,0.6); color: rgba(30,40,60,0.85); }
	:global(#cam-toggle.on) { color: rgba(30,40,60,0.85); border-color: rgba(100,140,255,0.5); }

	#hand-badge {
		position: absolute;
		top: 54px;
		left: 28px;
		color: rgba(30,40,60,0.28);
		font-size: 10px;
		letter-spacing: 2px;
		text-transform: uppercase;
		transition: color 0.3s;
	}
</style>
