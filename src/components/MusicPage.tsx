import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, ListMusic, Heart, Share2, 
  ExternalLink, RefreshCw, Info, ArrowLeft,
  Disc, Mic2, Radio
} from 'lucide-react';

interface Track {
  id: string;
  type?: string;
  name: string;
  artist: string;
  albumCover: string;
  previewUrl: string | null;
  externalUrl: string;
}

interface MusicPageProps {
  onBack: () => void;
  currentEmotion: string;
  theme?: 'default' | 'calm' | 'vibrant' | 'dark';
}

const MusicPage: React.FC<MusicPageProps> = ({ onBack, currentEmotion, theme = 'default' }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  useEffect(() => {
    const fetchMusic = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const emo = currentEmotion || 'neutral';
        const response = await fetch(`/api/recommend-music?emotion=${encodeURIComponent(emo)}`);
        
        if (!response.ok) throw new Error(`Server returned ${response.status}`);

        const data = await response.json();
        setTracks(data.tracks || []);
        setIsFallback(!!data.isFallback);
        
        if (data.tracks?.length > 0) {
          setCurrentTrackIndex(0);
        }
      } catch (err) {
        console.error('Music fetch error:', err);
        setError('Music service unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusic();
  }, [currentEmotion]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIndex = currentTrackIndex !== null ? (currentTrackIndex + 1) % tracks.length : 0;
    setCurrentTrackIndex(nextIndex);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    const prevIndex = currentTrackIndex !== null ? (currentTrackIndex - 1 + tracks.length) % tracks.length : 0;
    setCurrentTrackIndex(prevIndex);
  };

  const changeTrack = (index: number) => {
    setCurrentTrackIndex(index);
  };

  return (
    <div className={`min-h-full flex flex-col transition-colors duration-500 ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`p-2 rounded-xl transition-all ${
              theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800 text-slate-400' : 'bg-white hover:bg-gray-50 text-gray-400 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Wellness Player</h2>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Curated for your {currentEmotion} mood</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
            theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-black/5 shadow-sm'
          }`}>
            <Disc className={`w-4 h-4 text-primary animate-spin-slow`} />
            <span className="text-xs font-bold uppercase tracking-wider">{tracks.length} Tracks</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left: Player View */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className={`relative aspect-square rounded-[40px] overflow-hidden shadow-2xl group ${
            theme === 'dark' ? 'bg-slate-900' : 'bg-white'
          }`}>
            {currentTrack ? (
              <div className="w-full h-full">
                <iframe
                  src={`https://open.spotify.com/embed/${currentTrack.type || 'track'}/${currentTrack.id}?utm_source=generator&theme=0`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-[40px]"
                ></iframe>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                <Music className="w-24 h-24 mb-4" />
                <p className="text-xl font-bold">No track selected</p>
              </div>
            )}
          </div>

          {/* Player Info & Quick Actions */}
          {currentTrack && (
            <div className={`p-8 rounded-[32px] border ${
              theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-black/5 shadow-xl shadow-black/5'
            }`}>
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-black truncate mb-1">{currentTrack.name}</h3>
                  <p className="text-lg font-medium text-gray-500 truncate">{currentTrack.artist}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className={`p-4 rounded-2xl transition-all ${
                    theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`} onClick={handlePrev}>
                    <SkipBack className="w-6 h-6 fill-current" />
                  </button>
                  <button className={`p-4 rounded-2xl transition-all ${
                    theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`} onClick={handleNext}>
                    <SkipForward className="w-6 h-6 fill-current" />
                  </button>
                  <button 
                    onClick={() => window.open(currentTrack.externalUrl, '_blank')}
                    className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                  >
                    <ExternalLink className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Playlist View */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className={`flex-1 rounded-[32px] border overflow-hidden flex flex-col ${
            theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-black/5 shadow-xl shadow-black/5'
          }`}>
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ListMusic className="w-5 h-5 text-primary" />
                <h3 className="font-black uppercase tracking-widest text-sm">Up Next</h3>
              </div>
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isFallback && (
                <div className={`flex items-center gap-3 p-3 rounded-2xl mb-4 ${
                  theme === 'dark' ? 'bg-amber-950/20 border border-amber-900/30' : 'bg-amber-50 border border-amber-100'
                }`}>
                  <Info className="w-4 h-4 text-amber-600" />
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Using curated wellness tracks</p>
                </div>
              )}

              {tracks.map((track, idx) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => changeTrack(idx)}
                  className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                    currentTrackIndex === idx 
                      ? 'bg-primary/10 border border-primary/20' 
                      : (theme === 'dark' ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-gray-50 border border-transparent')
                  }`}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={track.albumCover} alt={track.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {currentTrackIndex === idx && (
                      <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                        <Volume2 className="w-6 h-6 text-white animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${currentTrackIndex === idx ? 'text-primary' : ''}`}>{track.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                  </div>
                  <div className="text-[10px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    0:30
                  </div>
                </motion.div>
              ))}

              {tracks.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full py-20 opacity-20">
                  <Music className="w-12 h-12 mb-4" />
                  <p className="font-bold uppercase tracking-widest text-xs">No tracks found</p>
                </div>
              )}
            </div>
          </div>

          {/* Mood Selector (Quick Switch) */}
          <div className={`p-6 rounded-[32px] border ${
            theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-black/5 shadow-xl shadow-black/5'
          }`}>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Switch Mood</h4>
            <div className="flex flex-wrap gap-2">
              {['Happy', 'Calm', 'Stressed', 'Sad', 'Neutral'].map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    // This will trigger the useEffect to fetch new music
                    // In a real app we'd probably call a prop function
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    currentEmotion.toLowerCase() === mood.toLowerCase()
                      ? 'bg-primary text-white'
                      : (theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-gray-50 text-gray-500 hover:bg-gray-100')
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 bg-gray-900 text-white rounded-2xl shadow-2xl z-[100] flex items-center gap-3 border border-white/10 min-w-[300px]"
          >
            <Info className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicPage;
