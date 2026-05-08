import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Truck, Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Activity, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(v) {
  if (!v.trim()) return 'Email is required.';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address.';
  return '';
}

function validatePassword(v) {
  if (!v) return 'Password is required.';
  if (v.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

export default function LoginPage() {
  const { login, isAuthed, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && isAuthed) {
    return <Navigate to={from} replace />;
  }

  const setFieldError = (field, value) =>
    setErrors((prev) => ({ ...prev, [field]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setErrors({ email: emailErr, password: passwordErr });
    if (emailErr || passwordErr) return;

    setError('');
    setSubmitting(true);
    try {
      const u = await login(email, password);
      if (u.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const safeTo = from === '/login' || from === '/signup' ? '/' : from;
        navigate(safeTo, { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.statusText || 'Login failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Local animations - scoped to this page */}
      <style>{`
        @keyframes login-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes login-blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(20px,-30px) scale(1.05); }
          66%      { transform: translate(-15px,15px) scale(0.97); }
        }
        @keyframes login-drive {
          0%   { transform: translateX(-30%); }
          100% { transform: translateX(130%); }
        }
        @keyframes login-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes login-pulse-dot {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%      { transform: scale(1.6); opacity: 0.5; }
        }
        .login-fade-up      { animation: login-fade-up 0.55s ease-out both; }
        .login-fade-up-2    { animation: login-fade-up 0.55s ease-out 0.10s both; }
        .login-fade-up-3    { animation: login-fade-up 0.55s ease-out 0.20s both; }
        .login-fade-up-4    { animation: login-fade-up 0.55s ease-out 0.30s both; }
        .login-blob         { animation: login-blob 14s ease-in-out infinite; }
        .login-blob-slow    { animation: login-blob 22s ease-in-out infinite; }
        .login-drive        { animation: login-drive 7s linear infinite; }
        .login-spin-slow    { animation: login-spin-slow 4s linear infinite; transform-origin: center; }
        .login-pulse-dot    { animation: login-pulse-dot 1.6s ease-in-out infinite; }
      `}</style>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* ── LEFT: form ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="login-fade-up flex items-center gap-3 mb-8">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                Vehicle Telemetry
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Connected fleet console
              </div>
            </div>
          </div>

          <div className="login-fade-up-2 mb-7">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Sign in to monitor your fleet in real time.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="login-fade-up-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-300/30 dark:shadow-black/30 p-6 space-y-4"
          >
            <Field
              label="Email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(v) => {
                setEmail(v);
                if (errors.email) setFieldError('email', validateEmail(v));
              }}
              onBlur={() => setFieldError('email', validateEmail(email))}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />

            <Field
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              value={password}
              onChange={(v) => {
                setPassword(v);
                if (errors.password) setFieldError('password', validatePassword(v));
              }}
              onBlur={() => setFieldError('password', validatePassword(password))}
              autoComplete="current-password"
              error={errors.password}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {error && (
              <div className="text-xs px-3 py-2 rounded-md bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 group"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-1">
              Contact your administrator to request access.
            </p>
          </form>

          <div className="login-fade-up-4 mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat icon={Activity} label="Live telemetry" />
            <Stat icon={MapPin} label="Real-time GPS" />
            <Stat icon={ShieldCheck} label="Secure access" />
          </div>
        </div>
      </div>

      {/* ── RIGHT: illustration / banner ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-gradient-to-br from-[#4facfe] via-[#3b82f6] to-[#00f2fe]">
        {/* Soft floating blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/20 blur-3xl login-blob" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl login-blob-slow" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-cyan-200/30 blur-2xl login-blob" />

        {/* Decorative grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Main illustration */}
        <div className="relative z-10 w-full max-w-lg px-10 text-white">
          <BannerIllustration />

          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight drop-shadow">
              Drive smarter with data
            </h2>
            <p className="mt-2 text-sm text-white/90 max-w-sm mx-auto leading-relaxed">
              Track speed, engine health, and location for every vehicle in your
              fleet — all in one connected console.
            </p>
          </div>

          {/* Live indicator chip */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/30 text-xs font-medium">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 login-pulse-dot" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Live data streaming
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, onBlur, placeholder, autoComplete, error, icon: Icon, trailing }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} ${trailing ? 'pr-10' : 'pr-3'} py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-md focus:outline-none focus:ring-2 text-slate-900 dark:text-slate-100 transition-all duration-200 ${
            error
              ? 'border border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500'
              : 'border border-slate-200 dark:border-slate-700 focus:ring-brand-500/30 focus:border-brand-500'
          }`}
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {trailing}
          </div>
        )}
      </div>
      {error && (
        <span className="block text-[11px] text-red-500 dark:text-red-400 mt-1">{error}</span>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800">
      <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
}

/**
 * Inline SVG banner — stylised connected-vehicle scene.
 * No external image dependency, lightweight, and theme-aware.
 */
function BannerIllustration() {
  return (
    <svg
      viewBox="0 0 520 320"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto drop-shadow-xl"
      role="img"
      aria-label="Illustration of a connected vehicle on a network"
    >
      <defs>
        <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#e0f2fe" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0f172a" stopOpacity="0.0" />
          <stop offset="0.2" stopColor="#0f172a" stopOpacity="0.45" />
          <stop offset="0.8" stopColor="#0f172a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Floating dashboard card */}
      <g transform="translate(50,30)">
        <rect width="280" height="170" rx="14" fill="url(#screen)" stroke="white" strokeOpacity="0.6" />
        {/* Title bar */}
        <circle cx="18" cy="18" r="4" fill="#f43f5e" />
        <circle cx="32" cy="18" r="4" fill="#f59e0b" />
        <circle cx="46" cy="18" r="4" fill="#10b981" />
        <rect x="70" y="13" width="120" height="10" rx="3" fill="#cbd5e1" />

        {/* Speed gauge */}
        <g transform="translate(36,52)">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <path
            d="M 40 40 m -34 0 a 34 34 0 0 1 60 -22"
            fill="none"
            stroke="#2563eb"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
            72
          </text>
          <text x="40" y="58" textAnchor="middle" fontSize="8" fill="#64748b">
            km/h
          </text>
        </g>

        {/* Mini chart */}
        <g transform="translate(140,52)">
          <rect width="120" height="80" rx="6" fill="#f8fafc" />
          <polyline
            points="6,60 22,52 38,58 54,40 70,46 86,28 102,34 116,18"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="6,60 22,52 38,58 54,40 70,46 86,28 102,34 116,18 116,76 6,76"
            fill="#2563eb"
            fillOpacity="0.12"
            stroke="none"
          />
        </g>

        {/* Status pills */}
        <g transform="translate(20,148)">
          <rect width="78" height="14" rx="7" fill="#dcfce7" />
          <circle cx="9" cy="7" r="3" fill="#10b981" />
          <text x="18" y="10" fontSize="8" fill="#065f46" fontWeight="600">
            ENGINE OK
          </text>
        </g>
        <g transform="translate(106,148)">
          <rect width="68" height="14" rx="7" fill="#dbeafe" />
          <circle cx="9" cy="7" r="3" fill="#2563eb" />
          <text x="18" y="10" fontSize="8" fill="#1e3a8a" fontWeight="600">
            GPS LOCK
          </text>
        </g>
        <g transform="translate(182,148)">
          <rect width="78" height="14" rx="7" fill="#fef3c7" />
          <circle cx="9" cy="7" r="3" fill="#f59e0b" />
          <text x="18" y="10" fontSize="8" fill="#78350f" fontWeight="600">
            FUEL 64%
          </text>
        </g>
      </g>

      {/* Wireless waves from dashboard to truck */}
      <g stroke="white" strokeOpacity="0.85" fill="none" strokeWidth="2">
        <path d="M 350 80 Q 380 60 410 80" />
        <path d="M 355 100 Q 390 75 425 100" strokeOpacity="0.6" />
        <path d="M 360 120 Q 395 90 430 120" strokeOpacity="0.4" />
      </g>

      {/* Road */}
      <rect x="0" y="248" width="520" height="44" fill="url(#road)" />
      <g stroke="white" strokeWidth="3" strokeDasharray="14 14" opacity="0.85">
        <line x1="0" y1="270" x2="520" y2="270" />
      </g>

      {/* Truck (animated drive) */}
      <g className="login-drive" transform="translate(0,210)">
        <g transform="translate(60,0)">
          {/* Cab */}
          <rect x="0" y="14" width="36" height="30" rx="4" fill="#ffffff" />
          <rect x="4" y="18" width="22" height="12" rx="2" fill="#93c5fd" />
          {/* Trailer */}
          <rect x="34" y="4" width="86" height="40" rx="4" fill="#ffffff" />
          <rect x="40" y="10" width="74" height="28" rx="2" fill="#dbeafe" />
          {/* Logo stripe */}
          <rect x="40" y="22" width="74" height="6" fill="#2563eb" />
          {/* Wheels */}
          <g>
            <circle cx="14" cy="48" r="7" fill="#0f172a" />
            <circle cx="14" cy="48" r="3" fill="#94a3b8" className="login-spin-slow" />
          </g>
          <g>
            <circle cx="50" cy="48" r="7" fill="#0f172a" />
            <circle cx="50" cy="48" r="3" fill="#94a3b8" className="login-spin-slow" />
          </g>
          <g>
            <circle cx="104" cy="48" r="7" fill="#0f172a" />
            <circle cx="104" cy="48" r="3" fill="#94a3b8" className="login-spin-slow" />
          </g>
        </g>
      </g>

      {/* Map pin floating top-right */}
      <g transform="translate(420,40)">
        <circle cx="22" cy="22" r="22" fill="white" fillOpacity="0.18" />
        <path
          d="M 22 8 C 16 8 12 13 12 18 C 12 25 22 36 22 36 C 22 36 32 25 32 18 C 32 13 28 8 22 8 Z"
          fill="white"
        />
        <circle cx="22" cy="18" r="4" fill="#2563eb" />
      </g>
    </svg>
  );
}
