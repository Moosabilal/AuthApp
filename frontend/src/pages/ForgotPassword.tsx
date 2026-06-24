import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/api/axios';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError('Please enter a valid email address.');
    }

    setStatus('loading');

    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to request password reset. Please try again.';
      setError(msg ?? 'Failed to request password reset.');
      setStatus('idle');
    }
  };

  return (
    <div className="w-full backdrop-blur-xl bg-[#0f1729]/60 border border-indigo-500/20 rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] overflow-hidden relative min-h-[400px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            className="flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-100">Check your email</h2>
            <p className="text-slate-400 text-sm max-w-[280px]">
              If an account exists for <span className="text-slate-300 font-medium">{email}</span>, we've sent a password reset link.
            </p>
            <Link
              to="/login"
              className="mt-6 w-full bg-[#030712]/50 hover:bg-[#030712]/80 border border-slate-700/50 text-slate-300 font-medium py-3 rounded-xl transition-colors duration-200 block"
            >
              Return to log in
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col w-full h-full justify-center"
          >
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-slate-100 mb-2">Reset password</h1>
              <p className="text-slate-400 text-sm">Enter your email and we'll send you a recovery link.</p>
            </div>

            <AnimateError error={error} />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-[#030712]/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status === 'loading'}
                className="w-full relative group overflow-hidden bg-indigo-600 disabled:bg-indigo-600/50 hover:bg-indigo-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors duration-200 flex justify-center items-center gap-2"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative">
                  {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
                </span>
                {status !== 'loading' && <ArrowRight className="w-4 h-4 relative" />}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnimateError: React.FC<{ error: string | null }> = ({ error }) => {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={false}
        animate={{ height: error ? 'auto' : 0, opacity: error ? 1 : 0, marginBottom: error ? 24 : 0 }}
        className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2"
      >
        <div className="p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
