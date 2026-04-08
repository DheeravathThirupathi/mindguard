import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, PieChart as PieIcon, List, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface Log {
  id: number;
  timestamp: string;
  emotion: string;
  stress_level: string;
  sentiment: number;
}

interface Stat {
  emotion: string;
  count: number;
}

interface DashboardProps {
  onBack: () => void;
  theme?: 'default' | 'calm' | 'vibrant' | 'dark';
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Dashboard: React.FC<DashboardProps> = ({ onBack, theme = 'default' }) => {
  const [data, setData] = useState<{ logs: Log[]; stats: Stat[] }>({ logs: [], stats: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error('Dashboard API error response:', text);
          throw new Error(`Dashboard API failed: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
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
          <h2 className={`text-2xl font-black tracking-tight transition-colors duration-500 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Analytics Dashboard</h2>
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Historical Wellness Data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emotion Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-3xl border border-black/5 shadow-sm transition-colors duration-500 ${
            theme === 'dark' ? 'bg-slate-900' : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-light rounded-lg transition-colors duration-500">
              <PieIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className={`font-bold transition-colors duration-500 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Emotion Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="emotion"
                >
                  {data.stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.stats.map((stat, idx) => (
              <div key={stat.emotion} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.emotion}: {stat.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Emotion Frequency */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-3xl border border-black/5 shadow-sm transition-colors duration-500 ${
            theme === 'dark' ? 'bg-slate-900' : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className={`font-bold transition-colors duration-500 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Frequency Analysis</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f0f0f0'} />
                <XAxis 
                  dataKey="emotion" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#334155' : '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Logs Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`lg:col-span-2 p-6 rounded-3xl border border-black/5 shadow-sm overflow-hidden transition-colors duration-500 ${
            theme === 'dark' ? 'bg-slate-900' : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <List className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className={`font-bold transition-colors duration-500 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Recent Activity Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Emotion</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stress Level</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Sentiment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {data.logs.map((log) => (
                  <tr key={log.id} className={`group transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50/50'
                  }`}>
                    <td className="py-4 text-xs font-medium text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-primary-light text-primary-dark text-[10px] font-bold uppercase rounded-md transition-colors duration-500">
                        {log.emotion}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                        log.stress_level === 'High' ? 'bg-red-50 text-red-700' :
                        log.stress_level === 'Moderate' ? 'bg-orange-50 text-orange-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {log.stress_level}
                      </span>
                    </td>
                    <td className={`py-4 text-right text-xs font-mono font-bold transition-colors ${
                      theme === 'dark' ? 'text-slate-500 group-hover:text-primary' : 'text-gray-400 group-hover:text-primary'
                    }`}>
                      {log.sentiment.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
