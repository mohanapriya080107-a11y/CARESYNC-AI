import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff, Activity, Shield, Zap } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password.trim()) { setError('Password is required'); return; }
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/role-selection');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleDemoLogin = () => {
    demoLogin('doctor');
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-clinical-bg flex relative overflow-hidden">
      {/* Left: Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-medical-dark via-slate-900 to-clinical-bg" />
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-medical-primary/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-clinical-accent/10 rounded-full blur-[80px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-medical-primary to-medical-accent flex items-center justify-center mx-auto mb-6 shadow-glow-green animate-heartbeat">
            <Heart className="w-10 h-10 text-white" fill="white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-wider mb-3">
            CARESYNC <span className="text-medical-accent">AI PRO</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed mb-8">
            AI-Powered Critical Patient Monitoring, Digital Twin Prediction & Hospital Intelligence Platform
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[
              { icon: Activity, label: 'Real-Time Monitoring', color: 'text-medical-accent' },
              { icon: Shield, label: 'Predictive AI', color: 'text-clinical-accent' },
              { icon: Zap, label: 'Emergency Response', color: 'text-clinical-warning' },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto mb-2">
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-medical-primary to-medical-accent flex items-center justify-center mx-auto mb-3 shadow-glow-green">
              <Heart className="w-7 h-7 text-white" fill="white" />
            </div>
            <h2 className="text-xl font-black text-white tracking-wider">
              CARESYNC <span className="text-medical-accent">AI</span>
            </h2>
          </div>

          <div className="glass-panel p-8">
            <h3 className="text-2xl font-bold text-white mb-1">Welcome Back</h3>
            <p className="text-sm text-slate-400 mb-6">Sign in to access the Hospital Command Center</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="glass-input w-full pl-10"
                    placeholder="doctor@caresync.ai"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="glass-input w-full pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-medical-primary focus:ring-medical-primary"
                  />
                  <span className="text-xs text-slate-400">Remember me</span>
                </label>
                <button type="button" className="text-xs text-medical-accent hover:text-medical-secondary transition-colors">
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-medical-primary to-medical-secondary text-white font-bold rounded-xl hover:from-medical-secondary hover:to-medical-primary transition-all duration-300 shadow-glow-green disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-700/50" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-slate-700/50" />
            </div>

            {/* Demo Login */}
            <button
              id="demo-login"
              onClick={handleDemoLogin}
              className="w-full py-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold rounded-xl border border-clinical-border transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-clinical-warning" />
              Quick Demo Access
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
              Don't have an account?{' '}
              <button className="text-medical-accent hover:text-medical-secondary transition-colors font-semibold">
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
