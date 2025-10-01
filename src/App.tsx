import { useEffect, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import PoseDetector from './components/PoseDetector';

function App() {
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Camera className="w-10 h-10 text-blue-400" />
          <h1 className="text-4xl font-bold text-white">Pose Detector</h1>
        </div>
        <p className="text-slate-300 text-lg">Raise both hands to see the magic!</p>
      </div>

      {!hasCamera ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-3 max-w-md">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <p className="text-red-300">Camera access is required for pose detection</p>
        </div>
      ) : (
        <PoseDetector />
      )}
    </div>
  );
}

export default App;
