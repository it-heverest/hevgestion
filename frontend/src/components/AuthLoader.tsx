import React from 'react';
import { Loader2 } from 'lucide-react';

export function AuthLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Content */}
      <div className="text-center relative z-10">
        {/* Simple logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-white/90 rounded-xl flex items-center justify-center shadow-lg mx-auto">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg"></div>
          </div>
        </div>

        {/* Simple loader */}
        <div className="mb-6">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
        </div>

        {/* Clean text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">HevGestion DSF</h2>
          <p className="text-sm text-orange-100">
            Chargement en cours...
          </p>
        </div>
      </div>
    </div>
  );
}