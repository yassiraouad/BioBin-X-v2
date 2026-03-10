// pages/dashboard/classes.js
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout/Layout';
import { getTeacherClasses, createClass, getClassStudents } from '../../firebase/db';
import { useRouter } from 'next/router';
import { Users, Plus, Copy, Hash, X, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClassesPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [classStudents, setClassStudents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && userData?.role !== 'teacher') router.push('/auth/login');
  }, [loading, userData]);

  useEffect(() => {
    if (user && userData?.role === 'teacher') {
      getTeacherClasses(user.uid).then(setClasses);
    }
  }, [user, userData]);

  const toggleExpand = async (classId) => {
    if (expanded === classId) { setExpanded(null); return; }
    setExpanded(classId);
    if (!classStudents[classId]) {
      const students = await getClassStudents(classId);
      setClassStudents(prev => ({ ...prev, [classId]: students }));
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error('Skriv inn klassenavn');
    setCreating(true);
    try {
      await createClass({ name: newName, teacherId: user.uid });
      toast.success('Klasse opprettet!');
      const cls = await getTeacherClasses(user.uid);
      setClasses(cls);
      setShowModal(false);
      setNewName('');
    } catch { toast.error('Feil ved oppretting'); }
    finally { setCreating(false); }
  };

  if (loading || !userData) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-700 text-white text-2xl mb-1">Mine klasser</h1>
            <p className="text-slate-400 font-body">{classes.length} klasse{classes.length !== 1 ? 'r' : ''}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Ny klasse
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="bio-card p-16 text-center">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 font-body mb-4">Ingen klasser ennå.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto flex items-center gap-2">
              <Plus size={15} /> Opprett første klasse
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map(cls => (
              <div key={cls.id} className="bio-card overflow-hidden">
                <button
                  onClick={() => toggleExpand(cls.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-bio-500/15 flex items-center justify-center text-bio-400">
                    <Users size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-display font-700">{cls.name}</div>
                    <div className="text-slate-500 text-xs font-body mt-0.5">
                      {(cls.totalWaste || 0).toFixed(1)} kg · {cls.totalPoints || 0} poeng
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-bio-400 text-sm bg-bio-500/10 border border-bio-500/20 px-3 py-1 rounded-lg">
                      {cls.code}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(cls.code); toast.success('Kode kopiert!'); }}
                      className="text-slate-500 hover:text-bio-400 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                    {expanded === cls.id ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
                  </div>
                </button>

                {expanded === cls.id && (
                  <div className="px-5 pb-5 border-t border-bio-border">
                    <div className="pt-4 space-y-2">
                      <h3 className="text-slate-400 text-xs font-body font-500 uppercase tracking-wider mb-3">Elever</h3>
                      {(classStudents[cls.id] || []).length === 0 ? (
                        <p className="text-slate-500 text-sm font-body py-4 text-center">
                          Ingen elever ennå. Del koden <span className="font-mono text-bio-400">{cls.code}</span>
                        </p>
                      ) : (
                        (classStudents[cls.id] || []).sort((a, b) => (b.points || 0) - (a.points || 0)).map((s, i) => (
                          <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/2">
                            <span className="text-slate-600 text-xs font-mono w-5">{i + 1}</span>
                            <div className="w-7 h-7 rounded-lg bg-bio-800 flex items-center justify-center text-bio-300 font-display font-700 text-xs">
                              {s.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 text-white text-sm font-body">{s.name}</div>
                            <div className="text-bio-400 font-mono text-xs">{(s.points || 0)}p</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bio-card p-8 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-white text-xl">Ny klasse</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="F.eks. 9B – Solberg Skole"
                className="bio-input"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <button onClick={handleCreate} disabled={creating} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Opprett</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
