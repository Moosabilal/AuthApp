import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Fingerprint, X, Camera, Save, Loader2, AlertCircle, Mail, AlertTriangle, Settings, Activity, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import api from '@/api/axios';
import { User as UserType } from '@/types/auth.types';

// ─── 3D Core Indicator ────────────────────────────────────────────────────────
const CoreIndicator: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.5, 0.4, 256, 64]} />
        <MeshDistortMaterial
          color="#818cf8"
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.2}
          distort={0.4}
          speed={3}
        />
      </mesh>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#6366f1" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#22d3ee" />
    </Float>
  );
};

// ─── Dashboard Component ──────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  
  // UI State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if user context updates from another tab/component
  useEffect(() => {
    if (user && !isSettingsOpen) {
      setName(user.name);
      setEmail(user.email);
      setAvatarPreview(null);
      setAvatarFile(null);
      setShowOtpInput(false);
      setOtp('');
    }
  }, [user, isSettingsOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Client-side validation: Limit to 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB.');
        return;
      }

      setError(null);
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Frontend Validation
    if (name.trim().length < 2) {
      return setError('Name must be at least 2 characters long.');
    }
    if (email !== user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError('Please enter a valid email address.');
    }

    setIsLoading(true);
    setError(null);
    let didUpdate = false;
    let emailChanged = false;

    try {
      // 1. Profile Update (Name / Avatar)
      if (name !== user.name || avatarFile) {
        const formData = new FormData();
        if (name !== user.name) formData.append('name', name);
        if (avatarFile) formData.append('avatar', avatarFile);

        const { data } = await api.patch<{ data: { user: UserType } }>('/profile', formData);
        updateUser(data.data.user);
        didUpdate = true;
      }

      // 2. Email Change Request
      if (email !== user.email && email.trim() !== '') {
        await api.post('/profile/request-email-change', { newEmail: email });
        
        // Refetch user to get the pendingEmail attached
        const { data: meData } = await api.get<{ data: { user: UserType } }>('/auth/me');
        updateUser(meData.data.user);
        didUpdate = true;
        emailChanged = true;
      }

      if (didUpdate) {
        if (emailChanged) {
          setShowOtpInput(true);
        } else {
          setIsSettingsOpen(false);
        }
      } else {
        // Nothing changed
        setIsSettingsOpen(false);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as any).response?.data?.message
          : 'Failed to update profile.';
      setError(msg ?? 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/profile/verify-email', { otp });
      await logout();
      window.location.href = '/login'; // explicitly navigate to login
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
          ? (err as any).response?.data?.message
          : 'Invalid OTP.';
      setError(msg ?? 'Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setError(null);
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarFile(null);
      setAvatarPreview(null);
      setShowOtpInput(false);
      setOtp('');
    }
  };

  // Close dropdown when clicking outside (simple implementation)
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const displayAvatarUrl = avatarPreview || user?.avatarUrl;

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col font-sans">
      
      {/* ─── 3D Background ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
         <Canvas camera={{ position: [0, 0, 10] }}>
            <CoreIndicator />
         </Canvas>
      </div>

      {/* ─── Header ─── */}
      <header className="relative z-20 backdrop-blur-md bg-[#0f1729]/60 border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Hexagon className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="font-display font-bold text-xl text-slate-100 tracking-wide">Auth<span className="text-indigo-400">Flow</span></span>
        </div>

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:bg-[#1e293b]/50 p-1.5 pr-3 rounded-full border border-transparent hover:border-slate-700/50 transition-all duration-200"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow-sm" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
            )}
            <span className="text-sm font-medium text-slate-200 hidden sm:block">{user?.name}</span>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-56 backdrop-blur-xl bg-[#0f1729]/90 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden py-1"
              >
                <div className="px-4 py-3 border-b border-slate-700/50 mb-1">
                  <p className="text-sm font-medium text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                </div>
                
                <button 
                  onClick={() => { setDropdownOpen(false); setIsSettingsOpen(true); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors flex items-center gap-3"
                >
                  <Settings className="w-4 h-4" />
                  Profile Settings
                </button>
                <button 
                  onClick={() => { setDropdownOpen(false); setShowLogoutConfirm(true); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 flex-1 flex flex-col max-w-6xl w-full mx-auto p-6 lg:p-12 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-slate-100 mb-3">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-400 text-lg">Your secure authentication session is active.</p>
          
          {user?.pendingEmail && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]"
             >
               <AlertTriangle className="w-4 h-4 text-amber-400" />
               <span className="text-sm text-amber-400 font-medium">
                 Verification Pending for: {user.pendingEmail}
               </span>
             </motion.div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center w-full mt-auto mb-auto"
        >
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-[0_0_50px_-12px_rgba(99,102,241,0.4)]">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#0f1729]/60 backdrop-blur-md flex flex-col items-center justify-center">
                <User className="w-20 h-20 md:w-24 md:h-24 text-indigo-400/50 mb-2" />
                <span className="text-sm text-indigo-400/70 font-medium">No Avatar</span>
              </div>
            )}
          </div>
          <p className="mt-8 text-slate-400 text-sm text-center max-w-md">
            Update your profile picture and account settings from the menu in the top right corner.
          </p>
        </motion.div>
      </main>

      {/* ─── Profile Settings Modal ─── */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSettings}
              className="absolute inset-0 bg-[#030712]/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0f1729] border border-indigo-500/30 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]"
            >
              <button 
                onClick={closeSettings}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-display text-2xl font-bold text-slate-100 mb-6">Profile Settings</h2>

              {showOtpInput ? (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* Error Banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 flex items-start gap-2 overflow-hidden"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Enter OTP</label>
                    <p className="text-xs text-slate-400 mb-2">We sent a 6-digit code to {email}</p>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hexagon className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        className="w-full bg-[#030712]/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm tracking-widest"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="w-full bg-emerald-600 disabled:bg-emerald-600/50 hover:bg-emerald-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors duration-200 flex justify-center items-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Verify & Re-Login
                    </motion.button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSave} className="space-y-6">
                  
                  {/* Error Banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 flex items-start gap-2 overflow-hidden"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center justify-center mb-2">
                    <div 
                      className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/50 cursor-pointer group shadow-lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {displayAvatarUrl ? (
                        <img src={displayAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center">
                          <User className="w-10 h-10 text-indigo-400" />
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-[#030712]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <p className="text-xs text-slate-400 mt-3 font-medium">Click to update avatar</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full bg-[#030712]/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-[#030712]/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                        />
                      </div>
                      {email !== user?.email && (
                        <p className="text-xs text-amber-400/80 mt-1 pl-1">
                          Changing your email will require verification.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || (name === user?.name && email === user?.email && !avatarFile)}
                      className="w-full bg-indigo-600 disabled:bg-indigo-600/50 hover:bg-indigo-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors duration-200 flex justify-center items-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                    </motion.button>
                  </div>

                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Logout Confirmation Modal ─── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-[#030712]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#0f1729] border border-red-500/30 rounded-3xl p-6 shadow-[0_0_50px_-12px_rgba(239,68,68,0.2)] text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="font-display text-xl font-bold text-slate-100 mb-2">Sign out of AuthFlow?</h2>
              <p className="text-slate-400 text-sm mb-6">
                You will need to enter your credentials again to access your dashboard.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    void logout();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors font-medium text-sm shadow-lg shadow-red-500/20"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DashboardPage;
