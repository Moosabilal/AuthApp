import React, { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

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
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
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

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex items-center justify-center p-4">
      
      {/* 3D Background specifically for Dashboard */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
         <Canvas camera={{ position: [0, 0, 8] }}>
            <CoreIndicator />
         </Canvas>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg backdrop-blur-xl bg-[#0f1729]/60 border border-indigo-500/20 rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] z-10"
      >
        <div className="flex items-center justify-between mb-8 border-b border-slate-700/50 pb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Secure Terminal
            </h1>
            <p className="text-slate-400 text-sm mt-1">Authenticated Session</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => void logout()}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors px-4 py-2 rounded-xl border border-slate-700/50 hover:border-red-500/30 hover:bg-red-500/10 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </motion.button>
        </div>

        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#030712]/50 rounded-xl p-4 border border-slate-700/50 flex items-start gap-4"
          >
            <div className="p-3 bg-indigo-500/10 rounded-lg shrink-0">
              <User className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-mono mb-1">Authenticated Identity</p>
              <p className="text-slate-100 font-medium text-lg">{user?.name}</p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#030712]/50 rounded-xl p-4 border border-slate-700/50 flex items-start gap-4"
          >
            <div className="p-3 bg-cyan-500/10 rounded-lg shrink-0">
              <Fingerprint className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 font-mono mb-1">System ID</p>
              <p className="text-slate-300 text-sm font-mono truncate">{user?._id}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
