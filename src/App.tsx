import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Heart, Sparkles, Github, Info, LayoutDashboard, Menu, X, Palette, Sun, Moon, Leaf, Zap } from 'lucide-react';
import WebcamDetection from './components/WebcamDetection';
import Chatbot from './components/Chatbot';
import MusicRecommendations from './components/MusicRecommendations';
import StressMeter from './components/StressMeter';
import Dashboard from './components/Dashboard';
import Developers from './components/Developers';
import About from './components/About';
import VoiceRobot from './components/VoiceRobot';
import MusicPage from './components/MusicPage';

export default function App() {
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [view, setView] = useState<'app' | 'dashboard' | 'developers' | 'chat' | 'about' | 'voice' | 'music'>('app');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'default' | 'calm' | 'vibrant' | 'dark'>('default');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const lastLogTime = useRef<number>(0);

  const handleEmotionDetect = useCallback((emotion: string) => {
    setCurrentEmotion(emotion);
    
    // Log emotion every 5 seconds to avoid spamming
    const now = Date.now();
    if (now - lastLogTime.current > 5000) {
      lastLogTime.current = now;
      
      const getStressLevel = (emo: string) => {
        const e = emo.toLowerCase();
        if (['angry', 'fear'].includes(e)) return 'High';
        if (['sad', 'disgust'].includes(e)) return 'Moderate';
        if (['neutral', 'surprise'].includes(e)) return 'Low';
        return 'None';
      };

      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emotion, 
          stressLevel: getStressLevel(emotion),
          sentiment: 0 // Default for webcam detection
        }),
      }).catch(err => console.error('Failed to log emotion:', err));
    }
  }, []);

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 font-sans selection:bg-primary-light selection:text-primary-dark ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#F8F9FD] text-gray-900'
      }`}
      data-theme={theme}
    >
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b border-black/5 px-6 py-4 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('app')}>
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20 transition-colors duration-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-black tracking-tight leading-none transition-colors duration-500 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>MindGuard</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 transition-colors duration-500">AI Wellness Hub</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {[
              { id: 'app', label: 'Live Feed' },
              { id: 'voice', label: 'Voice Robot' },
              { id: 'music', label: 'Wellness Player' },
              { id: 'chat', label: 'AI Assistant' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'developers', label: 'Developers' },
              { id: 'about', label: 'About' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`text-sm font-bold transition-colors duration-500 ${
                  view === item.id ? 'text-primary' : 'text-gray-400 hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className={`p-2 transition-colors rounded-lg ${
                  theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-gray-400 hover:text-primary bg-gray-50'
                }`}
                title="Change Theme"
              >
                <Palette className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {isThemeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 p-2 rounded-2xl border shadow-2xl z-[60] min-w-[160px] ${
                      theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'
                    }`}
                  >
                    {[
                      { id: 'default', label: 'Default', icon: <Zap className="w-4 h-4" />, color: 'bg-indigo-600' },
                      { id: 'calm', label: 'Calm', icon: <Leaf className="w-4 h-4" />, color: 'bg-emerald-600' },
                      { id: 'vibrant', label: 'Vibrant', icon: <Sparkles className="w-4 h-4" />, color: 'bg-rose-600' },
                      { id: 'dark', label: 'Dark Mode', icon: <Moon className="w-4 h-4" />, color: 'bg-slate-800' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id as any);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          theme === t.id 
                            ? (theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-primary') 
                            : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-primary')
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg text-white ${t.color}`}>
                          {t.icon}
                        </div>
                        {t.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setView(view === 'app' ? 'dashboard' : 'app')}
              className={`p-2 transition-colors rounded-lg ${
                theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-gray-400 hover:text-primary bg-gray-50'
              }`}
            >
              {view === 'app' ? <LayoutDashboard className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => {
                setView('app');
                setTimeout(() => {
                  document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="hidden sm:block px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 duration-500"
            >
              Get Started
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 transition-colors rounded-lg ${
                theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-gray-600 hover:text-primary bg-gray-50'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-t border-black/5 overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900' : 'bg-white'
              }`}
            >
              <div className="flex flex-col p-4 gap-4">
                {[
                  { id: 'app', label: 'Live Feed' },
                  { id: 'voice', label: 'Voice Robot' },
                  { id: 'music', label: 'Wellness Player' },
                  { id: 'chat', label: 'AI Assistant' },
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'developers', label: 'Developers' },
                  { id: 'about', label: 'About' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id as any);
                      setIsMenuOpen(false);
                    }}
                    className={`text-left px-4 py-3 rounded-xl font-bold transition-colors ${
                      view === item.id 
                        ? (theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-primary-light text-primary') 
                        : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50')
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button 
                  onClick={() => {
                    setView('app');
                    setIsMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="w-full px-5 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all text-center duration-500"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {view === 'app' ? (
            <motion.div
              key="app"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <header className="mb-12 text-center max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Real-time Emotion Analysis</span>
                </motion.div>
                <h2 className={`text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1] transition-colors duration-500 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Understand Your Mind, <span className="text-primary">Find Your Calm.</span>
                </h2>
                <p className={`text-lg font-medium transition-colors duration-500 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Our AI-powered system detects your emotions and provides personalized music and support to help you manage stress.
                </p>
              </header>

              {/* Main Grid */}
              <div id="main-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-24">
                {/* Left Column: Detection & Meter */}
                <div className="lg:col-span-8 space-y-8">
                  <section className={`p-6 rounded-3xl border border-black/5 shadow-sm transition-colors duration-500 ${
                    theme === 'dark' ? 'bg-slate-900' : 'bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-light rounded-lg transition-colors duration-500">
                          <Heart className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className={`font-bold transition-colors duration-500 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>Live Emotion Feed</h3>
                      </div>
                      <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                        Active
                      </div>
                    </div>
                    <WebcamDetection onEmotionDetect={handleEmotionDetect} theme={theme} />
                  </section>

                  <section>
                    <StressMeter emotion={currentEmotion} />
                  </section>
                </div>

                {/* Right Column: Chat & Music */}
                <div className="lg:col-span-4 space-y-8">
                  <section className="h-[500px]">
                    <Chatbot />
                  </section>
                  
                  <section className="h-[400px]">
                    <MusicRecommendations 
                      emotion={currentEmotion} 
                      theme={theme} 
                      onViewFull={() => setView('music')}
                    />
                  </section>
                </div>
              </div>
            </motion.div>
          ) : view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard onBack={() => setView('app')} theme={theme} />
            </motion.div>
          ) : view === 'developers' ? (
            <motion.div
              key="developers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Developers onBack={() => setView('app')} theme={theme} />
            </motion.div>
          ) : view === 'chat' ? (
            <motion.div
              key="chat-page"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className={`text-3xl font-black tracking-tight transition-colors duration-500 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>AI Wellness Assistant</h2>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest transition-colors duration-500">Full Conversation Mode</p>
                </div>
                <button 
                  onClick={() => setView('app')}
                  className={`px-4 py-2 text-sm font-bold transition-all rounded-xl border border-black/5 shadow-sm ${
                    theme === 'dark' ? 'bg-slate-900 text-slate-300 hover:text-white' : 'bg-white text-gray-600 hover:text-primary'
                  }`}
                >
                  Back to Dashboard
                </button>
              </div>
              <div className="h-[700px]">
                <Chatbot />
              </div>
            </motion.div>
          ) : view === 'about' ? (
            <motion.div
              key="about-page"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <About onBack={() => setView('app')} theme={theme} />
            </motion.div>
          ) : view === 'voice' ? (
            <motion.div
              key="voice-page"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto h-[700px]"
            >
              <VoiceRobot theme={theme} />
            </motion.div>
          ) : view === 'music' ? (
            <motion.div
              key="music-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <MusicPage 
                onBack={() => setView('app')} 
                currentEmotion={currentEmotion} 
                theme={theme} 
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className={`mt-20 pt-10 border-t border-black/5 text-center transition-colors duration-500 ${
          theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
        }`}>
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-black transition-colors duration-500 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>98%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Accuracy</span>
            </div>
            <div className="w-px h-8 bg-black/5" />
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-black transition-colors duration-500 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>24/7</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Support</span>
            </div>
            <div className="w-px h-8 bg-black/5" />
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-black transition-colors duration-500 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>100%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Private</span>
            </div>
          </div>
          <p className="text-sm font-medium mb-2">
            &copy; 2026 MindGuard Wellness. Built with advanced NLP and Computer Vision.
          </p>
          <button 
            onClick={() => setView('developers')}
            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-colors duration-500"
          >
            Meet the Developers
          </button>
        </footer>
      </main>
    </div>
  );
}
