import React from 'react';
import { motion } from 'motion/react';
import { Brain, Heart, Shield, Zap, Target, Users, ArrowLeft, Sparkles } from 'lucide-react';

interface AboutProps {
  onBack: () => void;
  theme?: 'default' | 'calm' | 'vibrant' | 'dark';
}

const About: React.FC<AboutProps> = ({ onBack, theme = 'default' }) => {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "Emotion Recognition",
      description: "Advanced computer vision models detect facial expressions in real-time to understand your current mood."
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-600" />,
      title: "Stress Analysis",
      description: "Intelligent algorithms analyze emotion patterns and sentiment to calculate your current stress levels."
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-600" />,
      title: "Empathetic Chat",
      description: "Our AI assistant uses Gemini's advanced reasoning to provide supportive, human-like conversations."
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Privacy First",
      description: "All processing happens securely, and your personal data is never used for training external models."
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
          }`}>About MindGuard</h2>
          <p className="text-xs font-bold text-primary uppercase tracking-widest">The Future of Mental Wellness</p>
        </div>
      </motion.div>

      <div className="space-y-16">
        {/* Mission Statement */}
        <section className="text-center max-w-2xl mx-auto">
          <div className="inline-flex p-3 bg-primary-light rounded-2xl mb-6 transition-colors duration-500">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className={`text-2xl font-black mb-4 transition-colors duration-500 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Our Mission</h3>
          <p className={`leading-relaxed font-medium transition-colors duration-500 ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            MindGuard was born from a simple idea: technology should support our mental health, not just our productivity. 
            We combine cutting-edge Artificial Intelligence with psychological principles to create a safe space for 
            emotional expression and stress management.
          </p>
        </section>

        {/* Features Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-8 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all duration-500 ${
                  theme === 'dark' ? 'bg-slate-900' : 'bg-white'
                }`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h4 className={`text-lg font-black mb-2 transition-colors duration-500 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{feature.title}</h4>
                <p className={`text-sm leading-relaxed font-medium transition-colors duration-500 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                }`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className={`rounded-[2.5rem] p-10 text-white relative overflow-hidden transition-colors duration-500 ${
          theme === 'dark' ? 'bg-slate-900' : 'bg-gray-900'
        }`}>
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Sparkles className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-8">How It Works</h3>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black shrink-0 transition-colors duration-500">1</div>
                <div>
                  <h5 className="font-bold mb-1">Visual Analysis</h5>
                  <p className="text-sm text-gray-400">Our webcam-based emotion detection model identifies your current state through facial landmarks.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black shrink-0 transition-colors duration-500">2</div>
                <div>
                  <h5 className="font-bold mb-1">Contextual Reasoning</h5>
                  <p className="text-sm text-gray-400">The AI Assistant processes your emotions and chat history to provide tailored stress-relief advice.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black shrink-0 transition-colors duration-500">3</div>
                <div>
                  <h5 className="font-bold mb-1">Personalized Support</h5>
                  <p className="text-sm text-gray-400">Receive music recommendations and wellness tips designed specifically for your current emotional state.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section Link */}
        <section className="text-center pb-12">
          <p className="text-sm text-gray-400 font-medium mb-4">Want to know more about the creators?</p>
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className={`text-sm font-bold transition-colors duration-500 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Developed at RGUKT Basar</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
