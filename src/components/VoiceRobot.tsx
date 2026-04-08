import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, Sphere, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});
// A simple 3D Robot Head component
const RobotHead = ({ 
  isSpeaking, 
  isListening, 
  isThinking,
  emotion = 'neutral'
}: { 
  isSpeaking: boolean; 
  isListening: boolean; 
  isThinking: boolean;
  emotion?: string;
}) => {
  const headRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const eyebrowsRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const blinkRef = useRef(0);
  const nextBlinkRef = useRef(Math.random() * 3 + 2);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Blinking logic
    if (t > nextBlinkRef.current) {
      blinkRef.current = 1;
      nextBlinkRef.current = t + Math.random() * 4 + 2;
    }
    if (blinkRef.current > 0) {
      blinkRef.current -= 0.15;
      if (blinkRef.current < 0) blinkRef.current = 0;
    }

    if (headRef.current) {
      // More dynamic movement when thinking or speaking
      const speed = isThinking ? 1.2 : (isSpeaking ? 2.5 : 0.5);
      const range = isThinking ? 0.08 : (isSpeaking ? 0.2 : 0.1);
      
      headRef.current.rotation.y = Math.sin(t * speed) * range;
      headRef.current.position.y = Math.sin(t * 1.5) * 0.05;
      
      if (isThinking) {
        // Pondering head tilt - more deliberate and "human-like"
        headRef.current.rotation.z = Math.sin(t * 1.5) * 0.15;
        headRef.current.rotation.x = Math.cos(t * 0.8) * 0.12;
        // Subtle "nodding" while thinking
        headRef.current.position.y += Math.sin(t * 3) * 0.02;
      } else if (isSpeaking) {
        // Speech emphasis movements
        const emphasis = Math.sin(t * 12) * 0.05;
        headRef.current.rotation.x = emphasis;
        
        if (emotion === 'happy') {
          headRef.current.rotation.z = Math.sin(t * 8) * 0.08;
          headRef.current.position.y += Math.abs(Math.sin(t * 10)) * 0.05; // Energetic bounce
        } else if (emotion === 'sad' || emotion === 'stressed') {
          headRef.current.rotation.x += 0.1; // Looking slightly down
          headRef.current.rotation.z = Math.sin(t * 2) * 0.03;
        }
      } else if (emotion === 'happy') {
        headRef.current.rotation.z = Math.sin(t * 4) * 0.05;
      } else {
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.1);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.1);
      }
    }
    
    if (eyesRef.current) {
      const scaleY = blinkRef.current > 0.5 ? 0.1 : (isListening ? 1.2 + Math.sin(t * 10) * 0.1 : 
                    isThinking ? 1.1 : 1);
      const scaleX = isListening ? 1.2 : 1;
      eyesRef.current.scale.set(scaleX, scaleY, scaleX);
      
      if (isThinking) {
        // Eyes "darting" while thinking - more rapid, scanning movements
        eyesRef.current.position.x = Math.sin(t * 5) * 0.08;
        eyesRef.current.position.y = 0.2 + Math.cos(t * 4) * 0.03;
      } else if (isSpeaking) {
        // Eyes widen slightly during speech for focus
        const focus = 1 + Math.sin(t * 15) * 0.05;
        eyesRef.current.scale.multiplyScalar(focus);
      } else {
        eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, 0, 0.1);
        eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, 0.2, 0.1);
      }
    }

    if (eyebrowsRef.current) {
      let targetY = 0.4;
      let targetRotation = 0;

      if (isThinking) {
        targetY = 0.45;
        targetRotation = 0.2;
      } else if (isSpeaking) {
        // Eyebrows move with speech emphasis
        targetY = 0.42 + Math.sin(t * 15) * 0.03;
        if (emotion === 'happy') targetY += 0.05;
      } else if (emotion === 'happy') {
        targetY = 0.48;
        targetRotation = -0.1;
      } else if (emotion === 'sad' || emotion === 'stressed') {
        targetY = 0.38;
        targetRotation = 0.15;
      }

      eyebrowsRef.current.position.y = THREE.MathUtils.lerp(eyebrowsRef.current.position.y, targetY, 0.1);
      eyebrowsRef.current.children.forEach((brow, i) => {
        const side = i === 0 ? -1 : 1;
        brow.rotation.z = THREE.MathUtils.lerp(brow.rotation.z, targetRotation * side, 0.1);
      });
    }

    if (mouthRef.current) {
      if (isSpeaking) {
        // Exaggerated waves for happy, dampened for sad/stressed
        const intensity = emotion === 'happy' ? 1.8 : (emotion === 'sad' || emotion === 'stressed' ? 0.25 : 1);
        const fastWave = Math.sin(t * 40) * 0.35 * intensity;
        const midWave = Math.sin(t * 20) * 0.25 * intensity;
        const slowWave = Math.sin(t * 8) * 0.15 * intensity;
        
        // Base openness varies with waves
        const openness = 0.4 + fastWave + midWave + slowWave;
        
        // Vowel-like transitions: 
        // Sometimes wide (A/E), sometimes narrow (O/U)
        const widthWave = Math.cos(t * 15) * 0.2 * intensity;
        
        mouthRef.current.scale.y = THREE.MathUtils.clamp(openness, 0.05, 1.4);
        mouthRef.current.scale.x = (0.5 + widthWave) * (emotion === 'happy' ? 1.6 : (emotion === 'sad' || emotion === 'stressed' ? 0.7 : 1));
        
        // Curve simulation using rotation.z on the torus segment
        // Math.PI = smile (bottom arc), 0 = frown (top arc)
        let targetRotationZ = Math.PI; // Default friendly smile
        if (emotion === 'sad' || emotion === 'stressed') {
          targetRotationZ = 0.3; // Slight frown (not full 0)
        } else if (emotion === 'happy') {
          // Exaggerated smile curve with dynamic bounce
          targetRotationZ = Math.PI + Math.sin(t * 12) * 0.3; 
        }
        
        mouthRef.current.rotation.z = THREE.MathUtils.lerp(mouthRef.current.rotation.z, targetRotationZ, 0.15);
        
        // Subtle vertical offset while speaking
        mouthRef.current.position.y = -0.3 + (openness * 0.06);
      } else if (isThinking) {
        // Thinking mouth "pursed lips" with a slight twitch
        mouthRef.current.scale.y = 0.02;
        mouthRef.current.scale.x = 0.2 + Math.sin(t * 12) * 0.03;
        mouthRef.current.position.x = Math.sin(t * 8) * 0.01;
        mouthRef.current.position.y = -0.3;
        mouthRef.current.rotation.z = Math.PI;
      } else if (emotion === 'happy') {
        mouthRef.current.scale.y = 0.12;
        mouthRef.current.scale.x = 0.9;
        mouthRef.current.position.y = -0.28;
        mouthRef.current.rotation.z = Math.PI;
      } else if (emotion === 'sad' || emotion === 'stressed') {
        mouthRef.current.scale.y = 0.04;
        mouthRef.current.scale.x = 0.35;
        mouthRef.current.position.y = -0.32;
        mouthRef.current.rotation.z = 0.2; // Slight downturn
      } else {
        mouthRef.current.scale.y = 0.05;
        mouthRef.current.scale.x = 0.5;
        mouthRef.current.position.x = 0;
        mouthRef.current.position.y = -0.3;
        mouthRef.current.rotation.z = Math.PI;
      }
    }

    if (glowRef.current) {
      const glowScale = isListening ? 1.5 + Math.sin(t * 5) * 0.2 : 
                         isSpeaking ? 1.3 + Math.sin(t * 10) * 0.1 :
                         isThinking ? 1.2 + Math.sin(t * 2) * 0.05 : 1.1;
      glowRef.current.scale.set(glowScale, glowScale, glowScale);
      glowRef.current.rotation.z = t * 0.2;
    }
  });

  return (
    <group ref={headRef}>
      {/* State Glow Aura */}
      <mesh ref={glowRef} position={[0, 0, -0.2]}>
        <torusGeometry args={[1.1, 0.02, 16, 100]} />
        <meshBasicMaterial 
          color={isListening ? "#22c55e" : isSpeaking ? "#ec4899" : isThinking ? "#f59e0b" : "#3b82f6"} 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* Main Head Shell */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.05} metalness={0.9} />
      </mesh>

      {/* Face Plate */}
      <mesh position={[0, 0, 0.8]} scale={[0.8, 0.7, 0.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.6} />
      </mesh>

      {/* Eyebrows */}
      <group ref={eyebrowsRef} position={[0, 0.4, 0.95]}>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.02]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.02]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* Eyes */}
      <group ref={eyesRef} position={[0, 0.2, 0.95]}>
        <mesh position={[-0.3, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color={isListening ? "#22c55e" : isThinking ? "#f59e0b" : "#3b82f6"} 
            emissive={isListening ? "#22c55e" : isThinking ? "#f59e0b" : "#3b82f6"} 
            emissiveIntensity={isThinking ? 1 + Math.sin(Date.now() * 0.005) * 0.5 : 2} 
          />
        </mesh>
        <mesh position={[0.3, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color={isListening ? "#22c55e" : isThinking ? "#f59e0b" : "#3b82f6"} 
            emissive={isListening ? "#22c55e" : isThinking ? "#f59e0b" : "#3b82f6"} 
            emissiveIntensity={isThinking ? 1 + Math.sin(Date.now() * 0.005) * 0.5 : 2} 
          />
        </mesh>
      </group>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.3, 0.95]} scale={[0.5, 0.1, 0.05]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.3, 0.05, 12, 32, Math.PI]} />
        <meshStandardMaterial 
          color={isSpeaking ? "#ec4899" : "#3b82f6"} 
          emissive={isSpeaking ? "#ec4899" : "#3b82f6"} 
          emissiveIntensity={isSpeaking ? 2 : 0.5} 
        />
      </mesh>

      {/* Antennas */}
      <mesh position={[0, 1.1, 0]} scale={[0.05, 0.3, 0.05]}>
        <cylinderGeometry />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={isListening ? "#22c55e" : isThinking ? "#f59e0b" : "#3b82f6"} 
          emissive={isListening ? "#22c55e" : isThinking ? "#f59e0b" : "#3b82f6"} 
          emissiveIntensity={isListening ? 1 : isThinking ? 0.5 : 0} 
        />
      </mesh>
    </group>
  );
};

interface VoiceRobotProps {
  theme?: 'default' | 'calm' | 'vibrant' | 'dark';
}

interface ErrorDetail {
  message: string;
  recovery?: string;
  type?: 'recognition' | 'synthesis' | 'api';
}

const VoiceRobot: React.FC<VoiceRobotProps> = ({ theme = 'default' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [emotion, setEmotion] = useState<string>('neutral');
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<ErrorDetail | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'te-IN'>('en-US');
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language; 

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        console.log("Speech recognized:", text);
        setTranscript(text);
        handleInteraction(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        let errorDetail: ErrorDetail = { message: "Something went wrong", type: 'recognition' };

        switch (event.error) {
          case 'no-speech':
            errorDetail = { 
              message: "I didn't hear anything.", 
              recovery: "Try speaking a bit louder or check your mic sensitivity.",
              type: 'recognition'
            };
            break;
          case 'not-allowed':
            errorDetail = { 
              message: "Microphone access denied.", 
              recovery: "Please click the lock icon in your browser address bar and allow microphone access.",
              type: 'recognition'
            };
            break;
          case 'network':
            errorDetail = { 
              message: "Network error.", 
              recovery: "Please check your internet connection and try again.",
              type: 'recognition'
            };
            break;
          case 'audio-capture':
            errorDetail = { 
              message: "Audio capture failed.", 
              recovery: "Make sure your microphone is plugged in and working.",
              type: 'recognition'
            };
            break;
          default:
            errorDetail = { 
              message: `Speech error: ${event.error}`, 
              recovery: "Try refreshing the page or checking your browser settings.",
              type: 'recognition'
            };
        }
        setError(errorDetail);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };
    } else {
      setError({
        message: "Browser not supported.",
        recovery: "Speech recognition is not supported in this browser. Please try Chrome or Edge.",
        type: 'recognition'
      });
    }

    // Handle voices loading
    const handleVoicesChanged = () => {
      console.log("Voices loaded:", window.speechSynthesis.getVoices().length);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioSourceRef.current) audioSourceRef.current.stop();
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleListening = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      setTranscript("");
      setResponse("");
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setError({
          message: "Microphone unavailable.",
          recovery: "Your microphone might be in use by another app or not connected.",
          type: 'recognition'
        });
        setIsListening(false);
      }
    }
  };

  const handleInteraction = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      setIsThinking(true);
      setResponse(""); // Clear previous response
      setError(null);
      
      // 1. Get analysis from backend (sentiment, intent, logging)
      // const analysisResponse = await fetch('http://localhost:3000/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: text }),
      // });
       const analysisResponse = await fetch('https://mindguard.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      
      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${analysisResponse.status}`);
      }
      
      const analysis = await analysisResponse.json();

      // 2. Generate intelligent response using Gemini
      
      const model = "gemini-3-flash-preview";
      
      const systemInstruction = `
        You are Aria, an empathetic and professional 3D Voice Assistant. 
        Your goal is to help users manage stress, anxiety, and emotional challenges.
        
        Context from analysis:
        - Detected Intent: ${analysis.tag}
        - Sentiment Score: ${analysis.sentiment}
        - Suggested Stress Level: ${analysis.stressLevel}
        - Key Terms Identified: ${analysis.keywords.join(', ')}
        - Recent Emotion History (from webcam): ${analysis.history.map((h: any) => h.emotion).join(', ')}
        
        Conversational Guidelines:
        - **Be Concise**: Since you are a voice assistant, keep your responses short and natural (1-3 sentences).
        - **Empathetic Affirmations**: Acknowledge the user's feelings warmly.
        - **Supportive Tone**: Maintain a warm, encouraging, and non-judgmental presence.
        - **No Markdown**: Do NOT use markdown symbols like asterisks or hashtags, as they sound strange when spoken. Use plain text.
        - **Crisis Protocol**: If the user is in crisis, suggest professional help.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "I'm here for you. Could you tell me more about that?";
      const detectedEmotion = analysis.emotion || "neutral";
      
      setEmotion(detectedEmotion);
      setIsThinking(false);
      setResponse(responseText);

      // Use local Speech Synthesis with emotion
      speakLocal(responseText, detectedEmotion);
    } catch (err) {
      console.error("Interaction error:", err);
      setError({
        message: "Aria is having trouble thinking.",
        recovery: "This might be a temporary connection issue. Please try asking again in a moment.",
        type: 'api'
      });
      setIsThinking(false);
      setIsSpeaking(false);
    }
  };

  const speakLocal = (text: string, emotion: string = "neutral") => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const startSpeaking = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Set language based on recognition language
      const currentLang = recognitionRef.current?.lang || 'en-US';
      utterance.lang = currentLang;

      // Better voice selection logic
      const preferredVoices = voices.filter(v => v.lang.startsWith(currentLang.split('-')[0]));
      const femaleVoice = preferredVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') || 
        v.name.toLowerCase().includes('aria') || 
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('google uk english female') ||
        v.name.toLowerCase().includes('microsoft zira')
      ) || preferredVoices[0] || voices[0];

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      // Emotion-based voice behavior
      // happy → slightly faster, energetic (higher pitch)
      // sad → slower, soft (lower pitch)
      // stressed → calm and gentle (normal pitch, slightly slower)
      // neutral → normal
      
      switch (emotion) {
        case 'happy':
          utterance.pitch = 1.3;
          utterance.rate = 1.1;
          break;
        case 'sad':
          utterance.pitch = 0.9;
          utterance.rate = 0.8;
          break;
        case 'stressed':
          utterance.pitch = 1.0;
          utterance.rate = 0.85;
          break;
        default:
          utterance.pitch = 1.15; 
          utterance.rate = 0.95;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e: any) => {
        console.error("Speech synthesis error:", e);
        setIsSpeaking(false);
        
        let recovery = "Try refreshing the page.";
        if (e.error === 'network') recovery = "Check your internet connection.";
        if (e.error === 'not-allowed') recovery = "Speech synthesis might be restricted by your browser.";
        
        setError({
          message: `Voice error: ${e.error || 'Unknown'}`,
          recovery: recovery,
          type: 'synthesis'
        });
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 300);
    };

    // If voices are not loaded yet, wait a bit
    if (window.speechSynthesis.getVoices().length === 0) {
      console.log("Waiting for voices to load...");
      const checkVoices = setInterval(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          clearInterval(checkVoices);
          startSpeaking();
        }
      }, 100);
      // Timeout after 3 seconds
      setTimeout(() => clearInterval(checkVoices), 3000);
    } else {
      startSpeaking();
    }
  };

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-slate-50/30 dark:bg-transparent border border-slate-200 dark:border-white/10 shadow-2xl">
      {/* 3D Scene Container */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={null}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <RobotHead 
                isSpeaking={isSpeaking} 
                isListening={isListening} 
                isThinking={isThinking}
                emotion={emotion}
              />
            </Float>
          </Suspense>
          
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
        {/* Top Section: Robot Info & Emotion */}
        <div className="p-8 flex flex-col items-center gap-2">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">ARIA</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Neural Assistant</p>
            </div>
          </motion.div>

          {/* Emotion Indicator */}
          <AnimatePresence>
            {emotion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="mt-4 px-4 py-1.5 bg-slate-100/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full flex items-center gap-2 shadow-2xl"
              >
                <span className="text-lg">
                  {emotion === 'happy' ? '😊' : emotion === 'sad' ? '😢' : emotion === 'stressed' ? '😌' : '😌'}
                </span>
                <span className="text-[10px] font-black text-slate-600 dark:text-white/70 uppercase tracking-widest">
                  {emotion}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center Section: Thinking & Error Area */}
        <div className="flex-1 flex flex-col justify-center p-8 gap-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {isThinking && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="self-start flex items-center gap-3 p-4 bg-slate-100/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl rounded-tl-none border border-slate-200 dark:border-white/10"
              >
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                </div>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Thinking...</span>
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="self-center w-full max-w-xs p-5 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-3xl flex flex-col gap-3 shadow-2xl"
              >
                <div className="flex items-center gap-3 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{error.message}</span>
                </div>
                {error.recovery && (
                  <p className="text-xs text-red-600 leading-relaxed font-medium">
                    {error.recovery}
                  </p>
                )}
                <button 
                  onClick={() => {
                    setError(null);
                    if (error.type === 'recognition') toggleListening();
                  }}
                  className="mt-2 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-[10px] font-black text-red-600 uppercase tracking-widest transition-all pointer-events-auto"
                >
                  Retry Connection
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Section: Controls */}
        <div className="p-10 flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-8 pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setTranscript("");
                setResponse("");
                setError(null);
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setIsThinking(false);
                setIsListening(false);
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {}
                }
              }}
              className="p-4 bg-slate-100 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/50 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-lg shadow-black/5"
              title="Reset Aria"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.3)] ${
                isSpeaking
                  ? 'bg-pink-600 shadow-pink-500/40'
                  : isListening 
                    ? 'bg-red-600 shadow-red-500/40' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/40'
              }`}
            >
              {/* Pulse Animation */}
              {(isListening || isSpeaking) && (
                <motion.div 
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`absolute inset-0 rounded-full ${isSpeaking ? 'bg-pink-500' : 'bg-red-500'}`}
                />
              )}
              
              <div className="relative z-10">
                {isSpeaking ? (
                  <VolumeX className="w-10 h-10 text-white" />
                ) : isListening ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const newLang = language === 'en-US' ? 'te-IN' : 'en-US';
                setLanguage(newLang);
                setError({
                  message: `Language: ${newLang === 'en-US' ? 'English' : 'Telugu'}`,
                  recovery: "Aria will now listen and speak in this language.",
                  type: 'api'
                });
                setTimeout(() => setError(null), 3000);
              }}
              className={`p-4 rounded-2xl border transition-all shadow-lg shadow-black/5 flex flex-col items-center gap-1 min-w-[64px] ${
                language === 'en-US' 
                  ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400' 
                  : 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400'
              }`}
              title="Toggle Language"
            >
              <Languages className="w-5 h-5" />
              <span className="text-[10px] font-black tracking-tighter">
                {language === 'en-US' ? 'ENGLISH' : 'TELUGU'}
              </span>
            </motion.button>
          </div>
          
          <p className="text-[10px] font-black text-slate-600 dark:text-white/20 uppercase tracking-[0.4em]">
            {isListening ? 'Listening for input...' : isSpeaking ? 'Aria is speaking...' : isThinking ? 'Processing request...' : 'System Standby'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceRobot;









