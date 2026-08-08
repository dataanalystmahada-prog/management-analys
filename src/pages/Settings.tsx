import React from 'react';
import { Database } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <Database className="text-gray-500" size={24} />
            <h2 className="text-lg font-medium text-gray-900">Database Configuration</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Aplikasi menggunakan Supabase PostgreSQL. Konfigurasi kredensial dilakukan melalui Environment Variables di host / platform deployment.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VITE_SUPABASE_URL</label>
              <input 
                type="text" 
                value={import.meta.env.VITE_SUPABASE_URL || ''}
                readOnly
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500 font-mono" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VITE_SUPABASE_ANON_KEY</label>
              <input 
                type="password" 
                value={import.meta.env.VITE_SUPABASE_ANON_KEY || ''}
                readOnly
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500 font-mono" 
              />
              <p className="mt-1 text-xs text-gray-500">
                Anon key aman digunakan di frontend dan tunduk pada Row Level Security (RLS) policies.
              </p>
            </div>
          </div>
          
          <div className="pt-4 mt-4 border-t border-gray-200">
             <div className="flex items-center justify-between">
               <span className="text-sm font-medium text-gray-700">Status Koneksi</span>
               {import.meta.env.VITE_SUPABASE_URL ? (
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                   Configured
                 </span>
               ) : (
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                   Missing Environment Variables
                 </span>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
