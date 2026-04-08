import React from 'react';
import { motion } from 'motion/react';
import { Linkedin, Mail, Github, Code, Brain, ArrowLeft, ExternalLink } from 'lucide-react';

interface DeveloperProps {
  onBack: () => void;
  theme?: 'default' | 'calm' | 'vibrant' | 'dark';
}

const Developers: React.FC<DeveloperProps> = ({ onBack, theme = 'default' }) => {
  const developers = [
    {
      name: "Thirupathi Dheeravath",
      role: "Full Stack Developer",
      image: "Thiru12345.jpg",
      description: "BTech Final Year Electronics and Communication Engineering student at RGUKT Basar with strong interest in Full Stack Development and Artificial Intelligence. Responsible for developing the web application, integrating the chatbot system, emotion detection model, and music recommendation features for the Stress Relief Chatbot System.",
      linkedin: "https://www.linkedin.com/in/thirupathi-dheeravath/",
      email: "thirupathi.dheerathvath.dev@gmail.com",
      icon: <Code className="w-5 h-5" />,
      color: "bg-indigo-500"
    },
    {
      name: "B. Nithin",
      role: "Machine Learning Developer",
      image: "https://picsum.photos/seed/dev2/400/400",
      description: "BTech Final Year Electronics and Communication Engineering student at RGUKT Basar. Responsible for developing and optimizing the facial emotion detection model, performing stress analysis, and supporting AI model integration for the Stress Relief Chatbot System.",
      icon: <Brain className="w-5 h-5" />,
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-12"
      >
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-xl border border-black/5 shadow-sm ${
            theme === 'dark' ? 'bg-slate-900 text-slate-300 hover:text-white' : 'bg-white text-gray-600 hover:text-primary'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </button>
        <div className="text-right">
          <h2 className={`text-3xl font-black tracking-tight transition-colors duration-500 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Meet the Developers</h2>
          <p className="text-xs font-bold text-primary uppercase tracking-widest">The Minds Behind the System</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {developers.map((dev, idx) => (
          <motion.div
            key={dev.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-3xl border border-black/5 shadow-xl overflow-hidden flex flex-col transition-colors duration-500 ${
              theme === 'dark' ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <div className={`h-32 ${dev.color} relative`}>
              <div className="absolute -bottom-10 left-8 flex items-end gap-3">
                <div className={`w-24 h-24 rounded-2xl shadow-xl border-4 overflow-hidden transition-colors duration-500 ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-900' : 'bg-white border-white'
                }`}>
                  <img 
                    src={dev.image} 
                    alt={dev.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className={`p-2.5 rounded-xl shadow-lg border border-black/5 mb-2 transition-colors duration-500 ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-white'
                }`}>
                  <div className="text-primary">
                    {dev.icon}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-14 p-8 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className={`text-xl font-black transition-colors duration-500 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{dev.name}</h3>
                <p className="text-sm font-bold text-primary">{dev.role}</p>
              </div>
              
              <p className={`text-sm leading-relaxed mb-8 flex-1 transition-colors duration-500 ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {dev.description}
              </p>
              
              <div className="flex items-center gap-3 pt-6 border-t border-black/5">
                {dev.linkedin && (
                  <a 
                    href={dev.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`p-2 rounded-xl transition-all ${
                      theme === 'dark' ? 'bg-slate-800 text-slate-500 hover:text-primary' : 'bg-gray-50 hover:bg-primary-light text-gray-400 hover:text-primary'
                    }`}
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {dev.email && (
                  <a 
                    href={`mailto:${dev.email}`}
                    className={`p-2 rounded-xl transition-all ${
                      theme === 'dark' ? 'bg-slate-800 text-slate-500 hover:text-red-400' : 'bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600'
                    }`}
                    title="Send Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                )}
                <div className="ml-auto text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  RGUKT Basar
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 p-8 bg-primary rounded-3xl text-white text-center relative overflow-hidden transition-colors duration-500"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Brain className="w-32 h-32" />
        </div>
        <h3 className="text-xl font-black mb-2">About the Project</h3>
        <p className="text-white/80 text-sm max-w-2xl mx-auto leading-relaxed">
          The Stress Relief Chatbot System is a collaborative effort to combine Machine Learning, 
          Emotion Recognition, and Generative AI to provide a supportive companion for mental wellness.
        </p>
      </motion.div>
    </div>
  );
};

export default Developers;
