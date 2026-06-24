import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleConstellation from './ParticleConstellation';

interface AuthSceneProps {
  children: ReactNode;
  routeKey: string;
}

const AuthScene: React.FC<AuthSceneProps> = ({ children, routeKey }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#030712] overflow-hidden">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ParticleConstellation />
        </Canvas>
      </div>

      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={routeKey}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthScene;
