import React from 'react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Management Analytics</h2>
        <p className="text-gray-600">
          This is the foundation architecture for the Management Analytics web application.
          Navigate through the sidebar to explore the different modules.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-2">Master Bismillah</h3>
          <p className="text-sm text-gray-600 mb-4">Leads and pre-closing process tracking.</p>
          <div className="bg-blue-50 text-blue-700 text-sm py-2 px-3 rounded-lg inline-block font-medium">
            Database Setup Complete
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-2">Master Alhamdulillah</h3>
          <p className="text-sm text-gray-600 mb-4">Transactions and orders tracking post-closing.</p>
          <div className="bg-blue-50 text-blue-700 text-sm py-2 px-3 rounded-lg inline-block font-medium">
            Database Setup Complete
          </div>
        </div>
      </div>
    </div>
  );
}
