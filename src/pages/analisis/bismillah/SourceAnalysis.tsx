import React, { useMemo } from 'react';
import { useFilter } from '../../../lib/analytics/FilterContext';
import { groupBismillahByField } from '../../../lib/analytics/engine';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts';

import { exportToCSV } from '../../../lib/analytics/export';
import { Download } from 'lucide-react';

export default function SourceAnalysis() {
  const { bismillahData, loading } = useFilter();

  const salesData = useMemo(() => {
    const groupedAll = groupBismillahByField(bismillahData, 'sumber_klien');
    const closings = bismillahData.filter(r => (r.status_order && String(r.status_order).toLowerCase().includes('closing')) || (r.status && String(r.status).toLowerCase().includes('closing')));
    const groupedClosing = groupBismillahByField(closings, 'sumber_klien');
    
    return groupedAll.map(g => {
      const closingCount = groupedClosing.find(c => c.name === g.name)?.count || 0;
      return {
        name: g.name,
        Leads: g.count,
        Closing: closingCount,
        'Conversion Rate': g.count > 0 ? Number(((closingCount / g.count) * 100).toFixed(1)) : 0,
        PotentialOmzet: g.potentialOmzet
      };
    }).sort((a,b) => b.Closing - a.Closing);
  }, [bismillahData]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Source Analysis (Leads)</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ... (Charts remain same) ... */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Leads vs Closing per Source</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar yAxisId="left" dataKey="Leads" fill="#9ca3af" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="Closing" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Conversion Rate per Source</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={val => `${val}%`} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="Conversion Rate" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Potential Omzet per Source</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={val => `${(val/1000000).toFixed(0)}M`} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Bar dataKey="PotentialOmzet" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Detail per Source</h3>
          <button 
            onClick={() => exportToCSV(salesData, 'source_analysis.csv')}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Download size={16} className="mr-1" /> Export CSV
          </button>
        </div>
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Source</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Leads</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Closing</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Conversion Rate</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Potential Omzet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {salesData.map((row) => (
              <tr key={row.name} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                <td className="px-4 py-3 text-right">{row.Leads}</td>
                <td className="px-4 py-3 text-right">{row.Closing}</td>
                <td className="px-4 py-3 text-right">{row['Conversion Rate']}%</td>
                <td className="px-4 py-3 text-right text-gray-600">Rp {row.PotentialOmzet.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}