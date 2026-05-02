/*
 * src/lib/services/display/camera.ts
 * Purpose: Canonical display-service owner for camera startup, detector loading, and frame processing.
 */
import type { DisplayLegacyWindow } from '$lib/services/display/legacy';
import { mapToCanvas, state, drawFrame, updateEmotionBadge } from '$lib/services/display/core';
import type {
	RuntimeDetector,
	RuntimeHandsResults,
	RuntimeWindowFlags,
	TasksVisionModule
} from '$lib/services/display/types';

type FaceResults = { multiFaceLandmarks?: Array<Array<{ x: number; y: number }>> };

function setNoCameraBadge(): void {
	const badge = document.getElementById('emotion-badge');
	if (badge) badge.textContent = '● NO CAMERA';
}

function setCameraReady(videoEl: HTMLVideoElement | null): void {
	if (!videoEl) return;
	videoEl.classList.add('ready');
}

function logCameraUnavailable(errorMessage: string): void {
	console.warn('Camera unavailable:', errorMessage);
	setNoCameraBadge();
}

function attachFaceMeshHandlers(faceMesh: RuntimeDetector): void {
	faceMesh.onResults?.((results: unknown) => {
		const typedResults = results as FaceResults;
		state.faces = [];
		let smilingCount = 0;
		if (typedResults.multiFaceLandmarks) {
			for (const landmarks of typedResults.multiFaceLandmarks) {
				const facePoint = landmarks[168];
				const mouthWidth = Math.abs(landmarks[291].x - landmarks[61].x);
				const eyeWidth = Math.abs(landmarks[263].x - landmarks[33].x);
				const smile = eyeWidth > 0 && mouthWidth / eyeWidth > 0.57;
				if (smile) smilingCount++;
				const point = mapToCanvas(facePoint.x, facePoint.y);
				state.faces.push({ x: point.x, y: point.y, smile });
			}
		}
		state.emotion = smilingCount > state.faces.length * 0.5 && state.faces.length > 0 ? 'smile' : 'neutral';
		updateEmotionBadge();
	});
}

function attachHandsHandlers(hands: RuntimeDetector): void {
	hands.onResults?.((results: unknown) => {
		const typedResults = results as RuntimeHandsResults;
		state.handsResults = typedResults;
		state.activePinchPoints = [];
		const badge = document.getElementById('hand-badge');
		if (!typedResults?.multiHandLandmarks || typedResults.multiHandLandmarks.length === 0) {
			if (badge) badge.textContent = '✋ NO HAND';
			return;
		}
		const parts = [`✋ ${typedResults.multiHandLandmarks.length}H`];
		for (const landmarks of typedResults.multiHandLandmarks) {
			const indexTip = mapToCanvas(landmarks[8].x, landmarks[8].y);
			const thumbTip = mapToCanvas(landmarks[4].x, landmarks[4].y);
			const pinchDistance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
			const pinched = pinchDistance < 60;
			parts.push(`${Math.round(pinchDistance)}px${pinched ? '🤌' : ''}`);
			if (pinched) {
				state.activePinchPoints.push({
					x: (indexTip.x + thumbTip.x) / 2,
					y: (indexTip.y + thumbTip.y) / 2
				});
			}
		}
		if (badge) badge.textContent = parts.join(' | ');
	});
}

function failSafeAbort(message?: string) {
	const runtimeWindow = window as RuntimeWindowFlags;
	if (runtimeWindow.__display_camera_fatal_shown) return;
	runtimeWindow.__display_camera_fatal_shown = true;
	try { alert('Camera startup failed: ' + (message || 'Unknown error')); } catch (error) { void error; }
	try { logCameraUnavailable(message || 'fatal error'); } catch (error) { void error; }
	state.processing = false;
	state.camOn = false;
	try {
		if (state.video && state.video.srcObject) {
			const mediaStream = state.video.srcObject as MediaStream;
			mediaStream.getTracks().forEach((track) => {
				try { track.stop(); } catch (error) { void error; }
			});
			state.video.srcObject = null;
		}
	} catch (error) {
		void error;
	}
}

async function tryUseTasksVision(): Promise<boolean> {
	try {
		// @ts-expect-error — @mediapipe/tasks-vision is an optional runtime dependency; falls back to CDN
		const tasks = (await import(/* @vite-ignore */ '@mediapipe/tasks-vision')) as TasksVisionModule;
		const FilesetResolver = tasks.FilesetResolver || tasks.filesetResolver;
		const FaceLandmarker = tasks.FaceLandmarker || tasks.faceLandmarker?.FaceLandmarker;
		const HandLandmarker = tasks.HandLandmarker || tasks.handLandmarker?.HandLandmarker;
		if (!FilesetResolver) return false;
		if (!state.canvas) return false;

		const fileset = await FilesetResolver.forVisionTasks('/static/mediapipe');
		const probe = async (path: string) => {
			try {
				const response = await fetch(path, { method: 'HEAD' });
				return response.ok;
			} catch (error) {
				void error;
				return false;
			}
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
				state.faceMesh = await FaceLandmarker.createFromOptions(fileset, {
					baseOptions: { modelAssetPath: 'face_landmarker.task' },
					canvas: state.canvas,
					runningMode: 'VIDEO',
					numFaces: 6
				});
				attachFaceMeshHandlers(state.faceMesh);
				console.debug('[display/runtime/camera] initialized FaceLandmarker from @mediapipe/tasks-vision');
			} catch (error) {
				console.warn('[display/runtime/camera] FaceLandmarker create failed', error);
			}
		}

		if (HandLandmarker && !state.hands && hasHandModel) {
			try {
				state.hands = await HandLandmarker.createFromOptions(fileset, {
					baseOptions: { modelAssetPath: 'hand_landmarker.task' },
					canvas: state.canvas,
					runningMode: 'VIDEO',
					maxNumHands: 2
				});
				attachHandsHandlers(state.hands);
				console.debug('[display/runtime/camera] initialized HandLandmarker from @mediapipe/tasks-vision');
			} catch (error) {
				console.warn('[display/runtime/camera] HandLandmarker create failed', error);
			}
		}

		return !!(state.faceMesh || state.hands);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.debug('[display/runtime/camera] tasks-vision import failed or unsupported in this environment', error);
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
			if (state.faceMesh?.send && state.frameCounter % 2 === 0) {
				await state.faceMesh.send({ image: state.video });
			} else if (state.hands?.send) {
				await state.hands.send({ image: state.video });
			}
		}
	} catch (error) {
		void error;
	}

	try {
		drawFrame();
	} catch (error) {
		void error;
	}
}

export function setupCamera(): void {
	if (!navigator.mediaDevices?.getUserMedia) {
		setNoCameraBadge();
		const runtimeWindow = window as RuntimeWindowFlags;
		if (!runtimeWindow.__display_camera_alert_shown) {
			runtimeWindow.__display_camera_alert_shown = true;
			try { alert('Camera not available in this browser.'); } catch (error) { void error; }
		}
		state.processing = false;
		state.camOn = false;
		return;
	}

	const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = src;
		script.async = true;
		try {
			script.crossOrigin = 'anonymous';
			script.referrerPolicy = 'no-referrer';
		} catch (error) {
			void error;
		}
		script.onload = () => resolve();
		script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
		document.head.appendChild(script);
	});

	console.debug('[display/runtime/camera] setupCamera: requesting camera and preparing MediaPipe load');

	void navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
		.then((stream) => {
			if (!state.video) return;
			state.video.srcObject = stream;
			state.video.onloadedmetadata = async () => {
				await state.video?.play();
				setCameraReady(state.video);

				const legacyWindow = window as DisplayLegacyWindow;
				const runtimeWindow = window as RuntimeWindowFlags & DisplayLegacyWindow;

				if (!legacyWindow.FaceMesh && typeof runtimeWindow.FaceMesh !== 'undefined') {
					legacyWindow.FaceMesh = runtimeWindow.FaceMesh;
				}
				if (!legacyWindow.Hands && typeof runtimeWindow.Hands !== 'undefined') {
					legacyWindow.Hands = runtimeWindow.Hands;
				}

				let usedTasksVision = false;
				try {
					usedTasksVision = await tryUseTasksVision();
				} catch (error) {
					void error;
					usedTasksVision = false;
				}

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
					console.debug('[display/runtime/camera] loading MediaPipe scripts...', tasks.map(() => 'task'));
					if (tasks.length) await Promise.all(tasks);
					console.debug('[display/runtime/camera] MediaPipe scripts loaded (or attempted)');
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					console.warn('[display/runtime/camera] error loading MediaPipe scripts', error);
					failSafeAbort(errorMessage);
					return;
				}

				if (!legacyWindow.FaceMesh || !legacyWindow.Hands) {
					try {
						console.debug('[display/runtime/camera] attempting fallback to /functions/display-camera.js');
						await loadScript('/functions/display-camera.js');
						console.debug('[display/runtime/camera] fallback script loaded');
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						console.warn('[display/runtime/camera] fallback script load failed', error);
						failSafeAbort(errorMessage);
						return;
					}
				}

				if (!legacyWindow.FaceMesh && typeof runtimeWindow.FaceMesh !== 'undefined') {
					legacyWindow.FaceMesh = runtimeWindow.FaceMesh;
				}

				if (legacyWindow.FaceMesh) {
					console.debug('[display/runtime/camera] initializing FaceMesh detector');
					try {
						state.faceMesh = new legacyWindow.FaceMesh({
							locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
						});
						state.faceMesh.setOptions?.({
							maxNumFaces: 6,
							refineLandmarks: false,
							minDetectionConfidence: 0.5,
							minTrackingConfidence: 0.5
						});
						attachFaceMeshHandlers(state.faceMesh);
						if (typeof state.faceMesh.initialize === 'function') await state.faceMesh.initialize();
						console.debug('[display/runtime/camera] FaceMesh initialized');
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						console.warn('[display/runtime/camera] FaceMesh init failed', error);
						failSafeAbort(errorMessage);
						return;
					}
				}

				if (!legacyWindow.Hands && typeof runtimeWindow.Hands !== 'undefined') {
					legacyWindow.Hands = runtimeWindow.Hands;
				}

				if (legacyWindow.Hands) {
					console.debug('[display/runtime/camera] initializing Hands detector');
					try {
						state.hands = new legacyWindow.Hands({
							locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`
						});
						state.hands.setOptions?.({
							maxNumHands: 2,
							minDetectionConfidence: 0.7,
							minTrackingConfidence: 0.6,
							modelComplexity: 1
						});
						attachHandsHandlers(state.hands);
						if (typeof state.hands.initialize === 'function') await state.hands.initialize();
						console.debug('[display/runtime/camera] Hands initialized');
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						console.warn('[display/runtime/camera] Hands init failed', error);
						failSafeAbort(errorMessage);
						return;
					}
				}

				try {
					runtimeWindow.__display_faceMesh = !!state.faceMesh;
					runtimeWindow.__display_hands = !!state.hands;
				} catch (error) {
					void error;
				}

				state.processing = true;
			};
		})
		.catch((error: Error) => {
			const runtimeWindow = window as RuntimeWindowFlags;
			if (!runtimeWindow.__display_camera_alert_shown) {
				runtimeWindow.__display_camera_alert_shown = true;
				try { alert('Failed to access camera: ' + (error?.message || 'Unknown error')); } catch (alertError) { void alertError; }
			}
			logCameraUnavailable(error.message);
			state.processing = false;
			state.camOn = false;
		});
}