import type { DisplayLegacyWindow } from './legacy';
import { attachFaceMeshHandlers, attachHandsHandlers } from './mediapipe';
import { setNoCameraBadge, setCameraReady, logCameraUnavailable } from './camera.ui';
import { state, drawFrame } from './core';

// One-time fail-safe: show an alert on first critical failure and abort camera processing
function failSafeAbort(message?: string) {
	if ((window as any).__display_camera_fatal_shown) return;
	(window as any).__display_camera_fatal_shown = true;
 	try { alert('Camera startup failed: ' + (message || 'Unknown error')); } catch (e) { /* noop */ }
 	try { logCameraUnavailable(message || 'fatal error'); } catch (e) { /* noop */ }
 	state.processing = false;
 	state.camOn = false;
 	// stop any active tracks
 	try {
 		if (state.video && state.video.srcObject) {
 			const ms = state.video.srcObject as MediaStream;
 			ms.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
 			state.video.srcObject = null;
 		}
 	} catch (e) { /* noop */ }
}

// Attempt to use the installed @mediapipe/tasks-vision package (preferred)
async function tryUseTasksVision(): Promise<boolean> {
 	try {
		// @ts-expect-error — @mediapipe/tasks-vision is an optional runtime dependency; falls back to CDN
		// Prevent Vite from pre-resolving this optional import during build.
		const tasks = await import(/* @vite-ignore */ '@mediapipe/tasks-vision');
 		const FilesetResolver = (tasks as any).FilesetResolver || (tasks as any).filesetResolver;
 		const FaceLandmarker = (tasks as any).FaceLandmarker || (tasks as any).faceLandmarker?.FaceLandmarker;
 		const HandLandmarker = (tasks as any).HandLandmarker || (tasks as any).handLandmarker?.HandLandmarker;
 		if (!FilesetResolver) return false;
		if (!state.canvas) return false;

		// point to local static mediapipe assets if present
		const fileset = await FilesetResolver.forVisionTasks('/static/mediapipe');

		// Probe whether expected model asset files exist before attempting createFromOptions
		const probe = async (p: string) => {
			try {
				const r = await fetch(p, { method: 'HEAD' });
				return r.ok;
			} catch (e) { return false; }
		};

		const faceModelPath = '/static/mediapipe/face_landmarker.task';
		const handModelPath = '/static/mediapipe/hand_landmarker.task';
		const hasFaceModel = await probe(faceModelPath);
		const hasHandModel = await probe(handModelPath);
		if (!hasFaceModel && !hasHandModel) {
			console.debug('[display/runtime/camera] no local .task model files found under /static/mediapipe; skipping model creation');
		}

		if (FaceLandmarker && !state.faceMesh && hasFaceModel) {
 			try {
				state.faceMesh = await (FaceLandmarker as any).createFromOptions(fileset, {
 					baseOptions: { modelAssetPath: 'face_landmarker.task' },
					canvas: state.canvas,
 					runningMode: 'VIDEO',
 					numFaces: 6,
 				});
 				attachFaceMeshHandlers(state.faceMesh);
 				console.debug('[display/runtime/camera] initialized FaceLandmarker from @mediapipe/tasks-vision');
 			} catch (e) { console.warn('[display/runtime/camera] FaceLandmarker create failed', e); }
 		}

		if (HandLandmarker && !state.hands && hasHandModel) {
 			try {
				state.hands = await (HandLandmarker as any).createFromOptions(fileset, {
 					baseOptions: { modelAssetPath: 'hand_landmarker.task' },
					canvas: state.canvas,
 					runningMode: 'VIDEO',
 					maxNumHands: 2,
 				});
 				attachHandsHandlers(state.hands);
 				console.debug('[display/runtime/camera] initialized HandLandmarker from @mediapipe/tasks-vision');
 			} catch (e) { console.warn('[display/runtime/camera] HandLandmarker create failed', e); }
 		}

 		return !!(state.faceMesh || state.hands);
 	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		console.debug('[display/runtime/camera] tasks-vision import failed or unsupported in this environment', e);
		failSafeAbort(errorMessage);
 		return false;
 	}
}

export async function processFrame(): Promise<void> {
	requestAnimationFrame(() => {
 		void processFrame();
 	});

	state.frameCounter++;
	try {
		if (state.processing && state.video && state.video.readyState >= 2) {
			if (state.faceMesh && state.frameCounter % 2 === 0) {
				await state.faceMesh.send({ image: state.video });
			} else if (state.hands) {
				await state.hands.send({ image: state.video });
			}
		}
	} catch (error) {
		void error;
	}

	// Always draw a frame so particles/animations update even when camera isn't ready
	try {
		drawFrame();
	} catch (err) {
		void err;
	}
}

export function setupCamera(): void {
	if (!navigator.mediaDevices?.getUserMedia) {
		setNoCameraBadge();
		// notify user once and abort further camera attempts
		if (!(window as any).__display_camera_alert_shown) {
			(window as any).__display_camera_alert_shown = true;
			try { alert('Camera not available in this browser.'); } catch (e) { /* noop in non-UI environments */ }
		}
		state.processing = false;
		state.camOn = false;
		return;
	}

	const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
		const s = document.createElement('script');
		s.src = src;
		s.async = true;
		// ensure cross-origin fetch for wasm/resources when loading from CDN
		try {
			// some browsers require crossorigin to be set for WASM and CORS fetches
			(s as HTMLScriptElement).crossOrigin = 'anonymous';
			(s as HTMLScriptElement).referrerPolicy = 'no-referrer';
		} catch (e) { /* silent */ }
		s.onload = () => resolve();
		s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
		document.head.appendChild(s);
	});

	console.debug('[display/runtime/camera] setupCamera: requesting camera and preparing MediaPipe load');

	void navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
		.then((stream) => {
			if (!state.video) return;
			state.video.srcObject = stream;
			state.video.onloadedmetadata = async () => {
				await state.video?.play();
				setCameraReady(state.video);

				const legacyWindow = window as DisplayLegacyWindow & any;

				// Prefer any pre-attached globals (from legacy bootstrap). If missing, try global window objects.
				const globalAny = window as any;
				if (!legacyWindow.FaceMesh && typeof globalAny.FaceMesh !== 'undefined') {
					legacyWindow.FaceMesh = globalAny.FaceMesh;
				}
				if (!legacyWindow.Hands && typeof globalAny.Hands !== 'undefined') {
					legacyWindow.Hands = globalAny.Hands;
				}

				// Prefer using the installed @mediapipe/tasks-vision package first
				let usedTasksVision = false;
				try {
					usedTasksVision = await tryUseTasksVision();
				} catch (e) { usedTasksVision = false; }

				// If npm package didn't provide detectors, attempt to load MediaPipe libraries dynamically.
				const tasks: Promise<void>[] = [];
				if (!usedTasksVision && !legacyWindow.FaceMesh) {
					console.debug('[display/runtime/camera] FaceMesh not found on window; scheduling script load');
					tasks.push(loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js'));
				}
				if (!usedTasksVision && !legacyWindow.Hands) {
					console.debug('[display/runtime/camera] Hands not found on window; scheduling script load');
					tasks.push(loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js'));
				}

				try {
					console.debug('[display/runtime/camera] loading MediaPipe scripts...', tasks.map(t => 'task'));
					if (tasks.length) await Promise.all(tasks);
					console.debug('[display/runtime/camera] MediaPipe scripts loaded (or attempted)');
				} catch (e) {
					// Treat script load failures as fatal for camera startup
					const errorMessage = e instanceof Error ? e.message : String(e);
					console.warn('[display/runtime/camera] error loading MediaPipe scripts', e);
					failSafeAbort(errorMessage);
					return;
				}

				// If still missing, try loading the legacy bundled initializer which registers globals
				if (!legacyWindow.FaceMesh || !legacyWindow.Hands) {
					try {
						console.debug('[display/runtime/camera] attempting fallback to /functions/display-camera.js');
						await loadScript('/functions/display-camera.js');
						console.debug('[display/runtime/camera] fallback script loaded');
					} catch (e) {
						const errorMessage = e instanceof Error ? e.message : String(e);
						console.warn('[display/runtime/camera] fallback script load failed', e);
						failSafeAbort(errorMessage);
						return;
					}
				}

				// Re-check globals after any dynamic loading (reuse earlier `globalAny`)
				if (!legacyWindow.FaceMesh && typeof globalAny.FaceMesh !== 'undefined') {
					legacyWindow.FaceMesh = globalAny.FaceMesh;
				}

				if (legacyWindow.FaceMesh) {
					console.debug('[display/runtime/camera] initializing FaceMesh detector');
					try {
						state.faceMesh = new legacyWindow.FaceMesh({
							locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
						});
						state.faceMesh.setOptions({
							maxNumFaces: 6,
							refineLandmarks: false,
							minDetectionConfidence: 0.5,
							minTrackingConfidence: 0.5
						});
						attachFaceMeshHandlers(state.faceMesh);
						// initialize if available
						if (typeof state.faceMesh.initialize === 'function') await state.faceMesh.initialize();
						console.debug('[display/runtime/camera] FaceMesh initialized');
					} catch (e) {
						const errorMessage = e instanceof Error ? e.message : String(e);
						console.warn('[display/runtime/camera] FaceMesh init failed', e);
						failSafeAbort(errorMessage);
						return;
					}
				}

				if (!legacyWindow.Hands && typeof globalAny.Hands !== 'undefined') {
					legacyWindow.Hands = globalAny.Hands;
				}

				if (legacyWindow.Hands) {
					console.debug('[display/runtime/camera] initializing Hands detector');
					try {
						state.hands = new legacyWindow.Hands({
							locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`
						});
						state.hands.setOptions({
							maxNumHands: 2,
							minDetectionConfidence: 0.7,
							minTrackingConfidence: 0.6,
							modelComplexity: 1
						});
						attachHandsHandlers(state.hands);
						if (typeof state.hands.initialize === 'function') await state.hands.initialize();
						console.debug('[display/runtime/camera] Hands initialized');
					} catch (e) {
						const errorMessage = e instanceof Error ? e.message : String(e);
						console.warn('[display/runtime/camera] Hands init failed', e);
						failSafeAbort(errorMessage);
						return;
					}
				}

				// expose simple debug flags for manual inspection in console
				try {
					(window as any).__display_faceMesh = !!state.faceMesh;
					(window as any).__display_hands = !!state.hands;
				} catch (e) {
					void e;
				}

				state.processing = true;
			};
		})
		.catch((error: Error) => {
			// show a single alert to the user and abort camera processing
			if (!(window as any).__display_camera_alert_shown) {
				(window as any).__display_camera_alert_shown = true;
				try { alert('Failed to access camera: ' + (error?.message || 'Unknown error')); } catch (e) { /* noop */ }
			}
			logCameraUnavailable(error.message);
			state.processing = false;
			state.camOn = false;
		});
}
