import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Sparkles, X } from 'lucide-react';

interface WebcamDetectionProps {
  onEmotionDetect: (emotion: string) => void;
  theme?: 'default' | 'calm' | 'vibrant' | 'dark';
}

const WebcamDetection: React.FC<WebcamDetectionProps> = ({ onEmotionDetect, theme = 'default' }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('Neutral');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const loadModels = async () => {
    if (isModelLoaded) return;
    setIsLoading(true);
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    
    // Add a timeout for model loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Model loading timed out')), 15000)
    );

    try {
      await Promise.race([
        Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]),
        timeoutPromise
      ]);
      setIsModelLoaded(true);
      console.log('Face-api models loaded');
    } catch (error) {
      console.error('Error loading face-api models:', error);
      setCameraError('Failed to load AI models. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isModelLoaded && isCameraActive && !cameraError) {
      interval = setInterval(async () => {
        try {
          if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            const { videoWidth, videoHeight } = video;
            
            if (videoWidth === 0 || videoHeight === 0) return;

            const detections = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceExpressions();

            if (detections && detections.length > 0) {
              const expressions = detections[0].expressions;
              const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
              const topEmotion = sorted[0][0];
              setCurrentEmotion(topEmotion);
              onEmotionDetect(topEmotion);

              if (canvasRef.current) {
                const displaySize = { width: videoWidth, height: videoHeight };
                
                if (canvasRef.current.width !== videoWidth || canvasRef.current.height !== videoHeight) {
                  faceapi.matchDimensions(canvasRef.current, displaySize);
                }

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, videoWidth, videoHeight);
                  
                  const validDetections = resizedDetections.filter(d => 
                    d.detection && d.detection.box && 
                    d.detection.box.width > 0 && d.detection.box.height > 0
                  );

                  if (validDetections.length > 0) {
                    faceapi.draw.drawDetections(canvasRef.current, validDetections);
                    faceapi.draw.drawFaceExpressions(canvasRef.current, validDetections);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Detection loop error:", err);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isModelLoaded, isCameraActive, onEmotionDetect, cameraError]);

  const toggleCamera = async () => {
    setCameraError(null);
    if (!isCameraActive) {
      await loadModels();
      setIsCameraActive(true);
    } else {
      setIsCameraActive(false);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const handleManualEmotion = (emotion: string) => {
    setCurrentEmotion(emotion);
    onEmotionDetect(emotion);
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border border-black/10 shadow-2xl group transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-900'
    }`}>
      {(!isCameraActive || isLoading || cameraError) && (
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-500 ${
          theme === 'dark' ? 'bg-slate-950/90' : 'bg-gray-900/90'
        }`}>
          {isLoading ? (
            <div className="flex flex-col items-center">
              <RefreshCw className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-sm font-black text-white uppercase tracking-widest">Initializing AI Models...</p>
            </div>
          ) : cameraError ? (
            <div className="flex flex-col items-center p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-xl font-black text-white mb-2">Camera Unavailable</h4>
              <p className="text-gray-400 text-sm mb-8 max-w-xs">
                {cameraError}
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={toggleCamera}
                  className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all active:scale-95"
                >
                  Try Again
                </button>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-500 bg-transparent px-2">Or Select Manually</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Happy', 'Sad', 'Neutral', 'Angry', 'Surprise', 'Fear'].map((emo) => (
                    <button
                      key={emo}
                      onClick={() => handleManualEmotion(emo)}
                      className="px-2 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-lg border border-white/10 transition-all"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center p-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h4 className="text-xl font-black text-white mb-2">Ready to Analyze?</h4>
              <p className="text-gray-400 text-sm mb-8 max-w-xs">
                Enable your camera to start real-time emotion detection powered by neural networks.
              </p>
              <button
                onClick={toggleCamera}
                className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:opacity-90 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
              >
                Start AI Detection
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="relative aspect-video bg-black">
        {isCameraActive && !cameraError && (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              className="w-full h-full object-cover opacity-80"
              videoConstraints={{ facingMode: 'user' }}
              onUserMediaError={(err) => {
                console.error("Webcam error:", err);
                setCameraError("We couldn't access your camera. Please ensure you've granted permission.");
                setIsCameraActive(false);
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Processing</span>
            </div>
          </>
        )}
      </div>

      <div className={`p-4 border-t border-black/5 flex items-center justify-between transition-colors duration-500 ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-white'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleCamera}
            className={`p-2 rounded-xl transition-all ${
              isCameraActive 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : (theme === 'dark' ? 'bg-slate-800 text-primary hover:bg-slate-700' : 'bg-primary-light text-primary hover:opacity-80')
            }`}
            title={isCameraActive ? "Stop Camera" : "Start Camera"}
          >
            {isCameraActive ? <RefreshCw className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</span>
            <span className={`text-xs font-bold ${isCameraActive ? 'text-green-600' : 'text-gray-500'}`}>
              {isCameraActive ? 'Neural Engine Active' : 'Engine Standby'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none block mb-1">Detected Emotion</span>
            <span className="text-sm font-black text-primary capitalize">
              {isCameraActive ? currentEmotion : '---'}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-primary-light'
          }`}>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamDetection;
