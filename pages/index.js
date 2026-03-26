// pages/index.js
import Link from 'next/link';
import { Leaf, Zap, Wind, Trophy, ArrowRight, Recycle, Globe, Users, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString('no-NO')}{suffix}</span>;
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-bio-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-moss-500/4 rounded-full blur-[100px]" />
        <div className="dot-pattern absolute inset-0 opacity-30" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/90 backdrop-blur-xl border-b border-bio-border' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-display font-800 text-white text-xl">BioBin X</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors text-sm font-body px-4 py-2">
              Logg inn
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm">
              Kom i gang →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-bio-500/10 border border-bio-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-bio-400 animate-pulse"></span>
            <span className="text-bio-400 text-sm font-body font-500">Reduser matavfall. Produser energi.</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-800 text-white leading-tight mb-6 animate-slide-up">
            Smart avfall.<br />
            <span className="gradient-text">Grønn fremtid.</span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 font-body leading-relaxed animate-slide-up" style={{animationDelay:'0.1s'}}>
            BioBin X gamifiserer matavfallshåndtering på skolen. Elever registrerer matavfall, produserer biogass og konkurrerer om å redde planeten.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{animationDelay:'0.2s'}}>
            <Link href="/auth/signup" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Start nå – gratis
              <ArrowRight size={18} />
            </Link>
            <Link href="/auth/login" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-base font-body px-4 py-4">
              Har du konto? Logg inn
            </Link>
          </div>
        </div>

        {/* Floating phone mockup / visual */}
        <div className="max-w-4xl mx-auto mt-20 animate-fade-in" style={{animationDelay:'0.4s'}}>
          <div className="relative rounded-2xl overflow-hidden border border-bio-border bg-dark-800/60 backdrop-blur-xl p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Recycle, label: 'Matavfall registrert', value: '2,847', suffix: ' kg', color: 'bio' },
                { icon: Zap, label: 'Energi produsert', value: '1,423', suffix: ' kWh', color: 'moss' },
                { icon: Wind, label: 'CO₂ spart', value: '2,278', suffix: ' kg', color: 'earth' },
                { icon: Users, label: 'Aktive elever', value: '386', suffix: '', color: 'bio' },
              ].map(({ icon: Icon, label, value, suffix, color }) => (
                <div key={label} className="bio-card p-5 text-center">
                  <div className={`w-10 h-10 rounded-xl bg-${color}-500/15 flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={20} className={`text-${color}-400`} />
                  </div>
                  <div className="font-display font-700 text-2xl text-white">
                    <AnimatedCounter target={parseInt(value.replace(',', ''))} suffix={suffix} />
                  </div>
                  <div className="text-slate-500 text-xs mt-1 font-body">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-700 text-white mb-4">Hvordan det fungerer</h2>
            <p className="text-slate-400 text-lg font-body max-w-xl mx-auto">En enkel løype fra matavfall til energi – med poeng og konkurranse hele veien.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '📸',
                title: 'Ta bilde og vei',
                desc: 'Åpne kameraet, ta bilde av matavfallet og skriv inn vekten. Enkelt og raskt.',
                color: 'bio',
              },
              {
                step: '02',
                icon: '⚡',
                title: 'Få poeng og energi',
                desc: 'Appen beregner automatisk energi produsert og CO₂ spart. Du tjener poeng for hvert kast.',
                color: 'moss',
              },
              {
                step: '03',
                icon: '🏆',
                title: 'Konkurrer og vinn',
                desc: 'Se rangeringen, utfordre klassen din og lås opp badges. Hvem er skolens grønneste?',
                color: 'earth',
              },
              {
                step: '04',
                icon: '🧠',
                title: 'Lær med quiz',
                desc: 'Test kunnskapen din om biogass, matavfall og klima. Lær mens du konkurrer.',
                color: 'bio',
              },
              {
                step: '05',
                icon: '📊',
                title: 'Detaljert statistikk',
                desc: 'Se grafer over din og klassens fremgang. Lærere får full oversikt over klassen.',
                color: 'moss',
              },
              {
                step: '06',
                icon: '🌍',
                title: 'Gjør en forskjell',
                desc: 'Hvert kilo matavfall du registrerer bidrar til å redde planeten. Ekte impact.',
                color: 'earth',
              },
            ].map(({ step, icon, title, desc, color }) => (
              <div key={step} className="bio-card p-6 relative group">
                <div className={`absolute top-4 right-4 text-${color}-500/20 font-display font-800 text-4xl leading-none select-none`}>
                  {step}
                </div>
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-display font-700 text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bio-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
            <Globe size={48} className="text-bio-400 mx-auto mb-6 animate-spin-slow" />
            <h2 className="font-display text-4xl font-800 text-white mb-4">
              Klar til å gjøre<br /><span className="gradient-text">en forskjell?</span>
            </h2>
            <p className="text-slate-400 mb-8 font-body text-lg">Bli med tusenvis av elever som allerede bruker BioBin X.</p>
            <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
              Registrer deg nå
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bio-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-body">
            <Leaf size={16} className="text-bio-500" />
            BioBin X © 2025 — Grønnere skoler
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-slate-500 hover:text-white text-sm font-body transition-colors">Om oss</Link>
            <Link href="/auth/login" className="text-slate-500 hover:text-white text-sm font-body transition-colors">Logg inn</Link>
            <Link href="/auth/login" className="text-slate-500 hover:text-red-400 text-sm font-body transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
