// pages/dashboard/student.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout/Layout';
import { getUserLogs } from '../../firebase/db';
import { getRank, calculateEnergy, calculateCO2Saved } from '../../utils/calculator';
import { Camera, Trophy, Zap, Wind, Leaf, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { ALL_BADGES } from '../../firebase/db';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-bio-border rounded-xl p-3 text-sm font-body">
        <p className="text-slate-400">{label}</p>
        <p className="text-bio-400 font-600">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export default function StudentDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'student')) {
      router.push('/auth/login');
    }
  }, [user, userData, loading]);

  useEffect(() => {
    if (user) {
      getUserLogs(user.uid).then(userLogs => {
        setLogs(userLogs);
        // Build last 7 days chart data
        const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
        const weekData = days.map((day, i) => {
          const date = new Date();
          date.setDate(date.getDate() - date.getDay() + i + 1);
          const dayLogs = userLogs.filter(l => {
            if (!l.timestamp) return false;
            const d = l.timestamp.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
            return d.toDateString() === date.toDateString();
          });
          return { day, weight: parseFloat(dayLogs.reduce((s, l) => s + l.weight, 0).toFixed(2)) };
        });
        setChartData(weekData);
      });
    }
  }, [user]);

  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalWaste = userData.totalWaste || 0;
  const energy = calculateEnergy(totalWaste);
  const co2 = calculateCO2Saved(totalWaste);
  const rank = getRank(userData.points || 0);
  const earnedBadges = userData.badges || [];

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{rank.icon}</span>
            <h1 className="font-display font-700 text-white text-2xl lg:text-3xl">
              Hei, {userData.name?.split(' ')[0]}! 👋
            </h1>
          </div>
          <p className="text-slate-400 font-body">
            Du er <span style={{ color: rank.color }} className="font-600">{rank.name}</span> med {userData.points || 0} poeng
          </p>
        </div>

        {/* Quick action */}
        <Link href="/scan" className="block mb-6 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-bio-600 to-bio-700 border border-bio-500/30 hover:shadow-bio-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-bio-500/10 group-hover:to-bio-500/20 transition-all" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="font-display font-700 text-white text-xl mb-1">Registrer matavfall</div>
                <div className="text-bio-100/70 text-sm font-body">Åpne kamera og kast → få poeng!</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Camera size={28} className="text-white" />
                </div>
                <ArrowRight size={20} className="text-white/60 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Poeng', value: (userData.points || 0).toLocaleString('no-NO'), icon: Star, color: 'earth', unit: 'pts' },
            { label: 'Matavfall', value: totalWaste.toFixed(1), icon: Leaf, color: 'bio', unit: 'kg' },
            { label: 'Energi', value: energy.toFixed(1), icon: Zap, color: 'moss', unit: 'kWh' },
            { label: 'CO₂ spart', value: co2.toFixed(1), icon: Wind, color: 'bio', unit: 'kg' },
          ].map(({ label, value, icon: Icon, color, unit }) => (
            <div key={label} className="bio-card p-5 animate-fade-in">
              <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-3`}>
                <Icon size={18} className={`text-${color}-400`} />
              </div>
              <div className="font-display font-700 text-white text-2xl leading-tight">{value}</div>
              <div className="text-slate-500 text-xs font-body mt-1">{label} <span className="text-slate-600">({unit})</span></div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bio-card p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-700 text-white text-lg">Ukentlig oversikt</h2>
              <p className="text-slate-500 text-sm font-body">Matavfall registrert denne uken</p>
            </div>
            <TrendingUp size={18} className="text-bio-400" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="weight" stroke="#22c55e" fill="url(#bioGrad)" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Badges */}
        <div className="bio-card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-700 text-white text-lg">Badges</h2>
            <span className="text-bio-400 text-sm font-mono">{earnedBadges.length}/{ALL_BADGES.length}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_BADGES.map(badge => {
              const earned = earnedBadges.includes(badge.id);
              return (
                <div key={badge.id} className={`p-4 rounded-xl text-center transition-all ${earned ? 'badge-earned' : 'badge-locked'}`}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className={`font-display font-700 text-sm ${earned ? 'text-white' : 'text-slate-500'}`}>{badge.name}</div>
                  <div className={`text-xs mt-1 font-body ${earned ? 'text-bio-400' : 'text-slate-600'}`}>{badge.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent logs */}
        <div className="bio-card p-6">
          <h2 className="font-display font-700 text-white text-lg mb-5">Siste registreringer</h2>
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Leaf size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-body">Ingen registreringer ennå.<br />Kast mat og tjen poeng!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-bio-500/10 flex items-center justify-center text-lg">🥬</div>
                    <div>
                      <div className="text-white text-sm font-body font-500">{log.weight} kg matavfall</div>
                      <div className="text-slate-500 text-xs font-body">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString('no-NO') : 'Ukjent dato'}
                      </div>
                    </div>
                  </div>
                  <div className="text-bio-400 font-mono text-sm font-500">+{log.points} p</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
