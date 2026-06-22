import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Signup failed. Please try again.';
      setError(msg ?? 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full backdrop-blur-xl bg-[#0f1729]/60 border border-indigo-500/20 rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-100 mb-2">Create account</h1>
        <p className="text-slate-400 text-sm">Join the network and secure your sessions.</p>
      </div>

      <AnimateError error={error} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jane Smith"
              className="w-full bg-[#030712]/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
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

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 8 characters"
              className="w-full bg-[#030712]/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full relative group overflow-hidden bg-indigo-600 disabled:bg-indigo-600/50 hover:bg-indigo-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors duration-200 flex justify-center items-center gap-2"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
          </span>
          {!isLoading && <ArrowRight className="w-4 h-4 relative" />}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link 
          to="/login" 
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
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

export default SignupPage;
