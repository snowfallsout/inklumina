This folder is intended for MediaPipe integration.

Implementation notes:
- Dynamic import MediaPipe libs in onMount
- Expose initMediaPipe({onFaces, onHands}) to the app
- Keep heavy logic off the main reactive loop; consider worker for heavy processing
