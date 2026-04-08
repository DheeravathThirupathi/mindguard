import React, { useState, useEffect } from "react";
import { Music, ExternalLink, RefreshCw, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Track {
  id: string;
  name: string;
  artist: string;
  albumCover: string;
  previewUrl: string | null;
  externalUrl: string;
}

interface MusicRecommendationsProps {
  emotion: string;
}

const MusicRecommendations: React.FC<MusicRecommendationsProps> = ({ emotion }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch music
  useEffect(() => {
    const fetchMusic = async () => {
      if (!emotion) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/recommend-music?emotion=${encodeURIComponent(emotion)}`
        );

        if (!res.ok) throw new Error("Server error");

        const data = await res.json();

        // safer handling
        setTracks(Array.isArray(data.tracks) ? data.tracks : []);

      } catch (err) {
        console.error("Music fetch error:", err);
        setError("Could not load music from Spotify.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusic();
  }, [emotion]);

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-lg overflow-hidden flex flex-col h-full">

      {/* HEADER */}
      <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Music className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-bold text-sm">Mood-Based Music</h3>
            <p className="text-xs text-emerald-100">
              Recommended for your {emotion} mood
            </p>
          </div>
        </div>

        {isLoading && (
          <RefreshCw className="w-4 h-4 animate-spin opacity-60" />
        )}
      </div>

      {/* TRACK LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">

        {error && (
          <div className="text-center text-red-500 text-xs">{error}</div>
        )}

        {tracks.length === 0 && !isLoading && !error && (
          <div className="text-center text-gray-400 text-xs">
            No tracks found
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {tracks.map((track, idx) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}

              // Smart play toggle
              onClick={() => {
                if (selectedTrack?.id === track.id) {
                  setSelectedTrack(null);
                } else {
                  setSelectedTrack(track);
                }
              }}

              className={`group flex items-center gap-3 p-2 bg-white rounded-xl border transition-all cursor-pointer ${
                selectedTrack?.id === track.id
                  ? "border-emerald-500 shadow-md scale-[1.03]"
                  : "border-black/5 hover:border-emerald-200 hover:shadow-md"
              }`}
            >
              {/* COVER */}
              <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                <img
                  src={track.albumCover || "/music-placeholder.png"}
                  alt={track.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {track.name}
                  </h4>

                  {selectedTrack?.id === track.id && (
                    <Volume2 className="w-3 h-3 text-emerald-500 animate-pulse" />
                  )}
                </div>

                <p className="text-[10px] text-gray-500 truncate">
                  {track.artist}
                </p>
              </div>

              {/* OPEN SPOTIFY */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(track.externalUrl, "_blank");
                }}
                className="p-1.5 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PLAYER */}
      <AnimatePresence>
        {selectedTrack && (
          <motion.div
            key={selectedTrack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 border-t bg-white"
          >
            <p className="text-xs font-semibold mb-2">
              Now Playing: {selectedTrack.name} — {selectedTrack.artist}
            </p>

            <iframe
              src={`https://open.spotify.com/embed/track/${selectedTrack.id}?utm_source=generator`}
              width="100%"
              height="80"
              allow="autoplay; clipboard-write; encrypted-media"
              className="rounded-lg"
            ></iframe>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MusicRecommendations;