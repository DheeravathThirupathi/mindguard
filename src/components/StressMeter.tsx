import React from 'react';
import { motion } from 'motion/react';
import { Activity, AlertTriangle } from 'lucide-react';

interface StressMeterProps {
  emotion: string;
}

const StressMeter: React.FC<StressMeterProps> = ({ emotion }) => {
  const getStressInfo = (emo: string) => {
    const e = emo.toLowerCase();
    if (['angry', 'fear'].includes(e)) return { level: 85, label: 'High', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
    if (['sad', 'disgust'].includes(e)) return { level: 55, label: 'Moderate', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' };
    if (['neutral', 'surprise'].includes(e)) return { level: 25, label: 'Low', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' };
    if (['happy'].includes(e)) return { level: 5, label: 'None', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    return { level: 0, label: 'Detecting...', color: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50' };
  };

  const info = getStressInfo(emotion);

  return (
    <div className={`p-6 rounded-2xl border border-black/5 shadow-sm transition-colors duration-500 ${info.bg}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${info.text}`} />
          <h3 className={`font-bold text-sm uppercase tracking-wider ${info.text}`}>Stress Level</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-black/5">
          <AlertTriangle className={`w-3.5 h-3.5 ${info.text}`} />
          <span className={`text-xs font-bold ${info.text}`}>{info.label}</span>
        </div>
      </div>

      <div className="relative h-4 bg-white/50 rounded-full overflow-hidden border border-black/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${info.level}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          className={`absolute top-0 left-0 h-full rounded-full shadow-lg ${info.color}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {['None', 'Low', 'Moderate', 'High'].map((lvl) => (
          <div key={lvl} className="flex flex-col items-center gap-1">
            <div className={`w-full h-1 rounded-full ${info.label === lvl ? info.color : 'bg-gray-200'}`} />
            <span className={`text-[10px] font-bold uppercase ${info.label === lvl ? info.text : 'text-gray-400'}`}>
              {lvl}
            </span>
          </div>
        ))}
      </div>
      
      <p className={`mt-4 text-xs font-medium leading-relaxed ${info.text} opacity-80`}>
        {info.label === 'High' && "Take a moment to breathe. Your stress levels are elevated."}
        {info.label === 'Moderate' && "You seem a bit tense. Maybe some music could help?"}
        {info.label === 'Low' && "You are doing well. Stay calm and focused."}
        {info.label === 'None' && "Great! You seem to be in a very positive state."}
      </p>
    </div>
  );
};

export default StressMeter;
