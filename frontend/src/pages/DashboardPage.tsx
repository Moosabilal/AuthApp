import React from 'react';
import { useAuth } from '@/context/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0f1729] border border-indigo-500/20 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold text-slate-100">Dashboard</h1>
          <button
            onClick={() => void logout()}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-500/30"
          >
            Sign out
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-[#030712] rounded-xl p-4 border border-slate-800">
            <p className="text-xs text-slate-500 font-mono mb-1">Authenticated as</p>
            <p className="text-slate-100 font-medium">{user?.name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>

          <div className="bg-[#030712] rounded-xl p-4 border border-slate-800">
            <p className="text-xs text-slate-500 font-mono mb-1">User ID</p>
            <p className="text-slate-300 text-sm font-mono break-all">{user?._id}</p>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4">
            <p className="text-indigo-300 text-sm font-medium">🎉 Session active</p>
            <p className="text-slate-400 text-xs mt-1">
              3D immersive UI is coming in Step 6 — this is the functional skeleton.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
