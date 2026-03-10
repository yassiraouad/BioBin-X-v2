// pages/scan.js
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import { logWaste } from '../firebase/db';
import { useRouter } from 'next/router';
import { Camera, RotateCcw, Check, Scale, Zap, Wind, Leaf, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScanPage() {
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      toast.error('Kamera ikke tilgjengelig. Sjekk tillatelser.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
    stopCamera();
  };

  const retake = () => {
    setCapturedImage(null);
    setResult(null);
    setWeight('');
    startCamera();
  };

  const handleSave = async () => {
    if (!weight || parseFloat(weight) <= 0) return toast.error('Skriv inn vekt (kg)');
    if (!user) return;

    setSaving(true);
    try {
      const data = await logWaste({
        userId: user.uid,
        weight: parseFloat(weight),
        imageUrl: null, // In production: upload capturedImage to Firebase Storage
        classId: userData?.classId || null,
      });
      setResult(data);
      await refreshUserData();
    } catch (err) {
      toast.error('Klarte ikke lagre. Prøv igjen.');
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <Layout>
        <div className="p-6 max-w-md mx-auto">
          <div className="bio-card p-8 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-bio-500/20 border-2 border-bio-500 flex items-center justify-center mx-auto mb-6 bio-glow">
              <Check size={36} className="text-bio-400" />
            </div>
            <h2 className="font-display font-700 text-white text-2xl mb-2">Registrert! 🎉</h2>
            <p className="text-slate-400 font-body mb-8">Bra jobba! Du bidrar til en grønnere fremtid.</p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Zap, label: 'Poeng', value: `+${result.points}`, color: 'earth' },
                { icon: Leaf, label: 'Energi', value: `${result.energyKwh.toFixed(2)} kWh`, color: 'bio' },
                { icon: Wind, label: 'CO₂ spart', value: `${result.co2Saved.toFixed(2)} kg`, color: 'moss' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`p-4 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                  <Icon size={18} className={`text-${color}-400 mx-auto mb-2`} />
                  <div className={`font-display font-700 text-${color}-300 text-sm`}>{value}</div>
                  <div className="text-slate-500 text-xs font-body mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={retake} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-bio-border text-slate-300 hover:text-white hover:border-bio-500/30 transition-all font-body">
                <Camera size={16} /> Nytt kast
              </button>
              <button onClick={() => router.push('/dashboard/student')} className="btn-primary flex-1">
                Tilbake
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-700 text-white text-2xl mb-1">Skann matavfall 📸</h1>
          <p className="text-slate-400 font-body text-sm">Ta bilde av maten og skriv inn vekt</p>
        </div>

        {/* Camera/preview */}
        <div className="relative rounded-2xl overflow-hidden bg-dark-800 border border-bio-border mb-5 aspect-[4/3]">
          {!capturedImage ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {/* Overlay guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-bio-400/50 rounded-2xl">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-bio-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-bio-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-bio-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-bio-400 rounded-br-lg" />
                </div>
              </div>
              {/* Flip camera */}
              <button
                onClick={() => { stopCamera(); setFacingMode(f => f === 'environment' ? 'user' : 'environment'); }}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all"
              >
                <RotateCcw size={16} />
              </button>
            </>
          ) : (
            <>
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              <button onClick={retake} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all">
                <X size={16} />
              </button>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Capture button */}
        {!capturedImage && (
          <div className="flex justify-center mb-5">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center bio-glow hover:scale-105 transition-transform active:scale-95"
            >
              <Camera size={26} className="text-white" />
            </button>
          </div>
        )}

        {/* Weight input */}
        {capturedImage && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="text-slate-300 text-sm font-body font-500 block mb-2 flex items-center gap-2">
                <Scale size={14} />
                Vekt (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="F.eks. 0.5"
                className="bio-input text-lg"
                autoFocus
              />
              {weight && parseFloat(weight) > 0 && (
                <div className="mt-2 p-3 rounded-xl bg-bio-500/8 border border-bio-500/15 text-xs font-body text-bio-400">
                  ≈ +{Math.round(parseFloat(weight) * 10)} poeng · {(parseFloat(weight) * 0.5).toFixed(2)} kWh · {(parseFloat(weight) * 0.8).toFixed(2)} kg CO₂ spart
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !weight}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Check size={18} /> Lagre registrering</>
              )}
            </button>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-white/3 border border-white/6">
          <p className="text-slate-400 text-sm font-body">
            💡 <strong className="text-slate-300">Tips:</strong> Vei matavfallet på en kjøkkenvekt for nøyaktig registrering. 1 kg gir 10 poeng!
          </p>
        </div>
      </div>
    </Layout>
  );
}
