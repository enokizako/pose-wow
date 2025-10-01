import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { Loader2 } from 'lucide-react';

const PoseDetector = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showWow, setShowWow] = useState(false);

  useEffect(() => {
    let landmarker: PoseLandmarker | undefined;
    let stream: MediaStream | undefined;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        );

        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!videoRef.current) return;

        const video = videoRef.current;
        video.srcObject = stream;

        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => {
            video.play().then(() => {
              resolve();
            }).catch((err) => {
              console.error('Play error:', err);
            });
          };
        });

        setIsLoading(false);

        const canvas = canvasRef.current!;
        const ctx2d = canvas.getContext('2d')!;
        const drawer = new DrawingUtils(ctx2d);

        const detect = () => {
          if (!video || !landmarker || video.readyState < 2) {
            requestAnimationFrame(detect);
            return;
          }

          const ts = performance.now();
          const res = landmarker.detectForVideo(video, ts);

          ctx2d.clearRect(0, 0, canvas.width, canvas.height);
          ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (res.landmarks.length) {
            const lm = res.landmarks[0];

            drawer.drawLandmarks(lm, {
              color: '#FF00FF',
              lineWidth: 2,
            });
            drawer.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, {
              color: '#00FFFF',
              lineWidth: 3,
            });

            const handsRaised = checkBothHandsRaised(lm);
            setShowWow(handsRaised);
          }

          requestAnimationFrame(detect);
        };
        detect();
      } catch (err) {
        console.error('Error initializing pose detection:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to initialize: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    const checkBothHandsRaised = (landmarks: any[]): boolean => {
      const LEFT_WRIST = 15;
      const RIGHT_WRIST = 16;
      const LEFT_SHOULDER = 11;
      const RIGHT_SHOULDER = 12;
      const NOSE = 0;

      if (!landmarks[LEFT_WRIST] || !landmarks[RIGHT_WRIST] ||
          !landmarks[LEFT_SHOULDER] || !landmarks[RIGHT_SHOULDER] ||
          !landmarks[NOSE]) {
        return false;
      }

      const leftWrist = landmarks[LEFT_WRIST];
      const rightWrist = landmarks[RIGHT_WRIST];
      const leftShoulder = landmarks[LEFT_SHOULDER];
      const rightShoulder = landmarks[RIGHT_SHOULDER];
      const nose = landmarks[NOSE];

      const leftHandRaised = leftWrist.y < leftShoulder.y && leftWrist.y < nose.y + 0.1;
      const rightHandRaised = rightWrist.y < rightShoulder.y && rightWrist.y < nose.y + 0.1;

      return leftHandRaised && rightHandRaised;
    };

    init();

    return () => {
      landmarker?.close();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-2xl backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            <p className="text-white text-lg">Loading pose detector...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-4 max-w-2xl">
          <p className="text-red-300 text-sm break-words">{error}</p>
          <p className="text-red-400 text-xs mt-3">
            Possible causes: Camera permission denied, not using HTTPS, or network error. Check browser console for details.
          </p>
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
        <video
          ref={videoRef}
          width={640}
          height={480}
          autoPlay
          playsInline
          muted
          style={{ display: 'none' }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="max-w-full h-auto"
          style={{ transform: 'scaleX(-1)' }}
        />

        {showWow && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="relative">
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white text-6xl font-black px-12 py-6 rounded-full shadow-2xl border-4 border-white transform rotate-[-5deg]">
                WOW!
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[25px] border-t-white"></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-slate-400 text-sm">
          {showWow ? (
            <span className="text-green-400 font-semibold text-lg">Great pose! Keep it up!</span>
          ) : (
            <span>Raise both hands above your head to trigger the effect</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default PoseDetector;
