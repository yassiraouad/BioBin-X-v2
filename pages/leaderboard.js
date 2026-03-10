// pages/leaderboard.js
import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { getStudentLeaderboard, getClassLeaderboard } from '../firebase/db';
import { useAuth } from '../hooks/useAuth';
import { Trophy, Users, Crown, Medal, Star } from 'lucide-react';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const RANK_CLASSES = ['rank-1', 'rank-2', 'rank-3'];

export default function Leaderboard() {
  const { user, userData } = useAuth();
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudentLeaderboard(), getClassLeaderboard()]).then(([s, c]) => {
      setStudents(s);
      setClasses(c);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display font-700 text-white text-2xl lg:text-3xl mb-1 flex items-center gap-3">
            <Trophy size={28} className="text-earth-400" />
            Rangering
          </h1>
          <p className="text-slate-400 font-body">Hvem er skolens grønneste?</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 p-1 bg-white/4 rounded-xl w-fit">
          {[
            { id: 'students', label: 'Elever', icon: Star },
            { id: 'classes', label: 'Klasser', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-500 transition-all ${
                tab === id
                  ? 'bg-bio-600 text-white shadow-bio'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {(tab === 'students' ? students : classes).map((item, i) => {
              const isMe = tab === 'students' && item.id === user?.uid;
              const rankClass = i < 3 ? RANK_CLASSES[i] : '';

              return (
                <div
                  key={item.id}
                  className={`bio-card p-4 flex items-center gap-4 transition-all ${rankClass} ${isMe ? 'ring-1 ring-bio-500/40' : ''}`}
                >
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-700 text-lg ${
                    i === 0 ? 'text-earth-300' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-300' : 'text-slate-500 text-sm'
                  }`}>
                    {i < 3 ? RANK_MEDALS[i] : i + 1}
                  </div>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-700 text-sm ${
                    isMe ? 'bg-bio-600 text-white' : 'bg-gradient-to-br from-bio-800 to-moss-900 text-bio-300'
                  }`}>
                    {tab === 'students'
                      ? (item.name?.[0]?.toUpperCase() || '?')
                      : (item.name?.[0]?.toUpperCase() || '?')
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-body font-600 text-sm truncate ${isMe ? 'text-bio-300' : 'text-white'}`}>
                      {item.name} {isMe && <span className="text-bio-500 text-xs">(deg)</span>}
                    </div>
                    <div className="text-slate-500 text-xs font-body">
                      {tab === 'students'
                        ? `${(item.totalWaste || 0).toFixed(1)} kg avfall`
                        : `${(item.totalWaste || 0).toFixed(1)} kg · ${item.totalPoints || 0} poeng totalt`
                      }
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <div className={`font-mono font-700 text-base ${i === 0 ? 'gradient-text-gold' : 'text-bio-400'}`}>
                      {((tab === 'students' ? item.points : item.totalPoints) || 0).toLocaleString('no-NO')}
                    </div>
                    <div className="text-slate-600 text-xs font-body">poeng</div>
                  </div>
                </div>
              );
            })}

            {(tab === 'students' ? students : classes).length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-body">Ingen data ennå. Vær den første! 🌱</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
