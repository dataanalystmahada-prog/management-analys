import React, { useMemo } from 'react';
import { useFilter } from '../../../lib/analytics/FilterContext';
import { groupAlhamdulillahByInvoiceField } from '../../../lib/analytics/engine';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts';

import { exportToCSV } from '../../../lib/analytics/export';
import { Download } from 'lucide-react';

export default function SalesPerformanceAlhamdulillah() {
  const { alhamdulillahData, loading } = useFilter();

  const performanceByPic = useMemo(() => {
    const grouped = groupAlhamdulillahByInvoiceField(alhamdulillahData, 'pic_sales');
    // Calculate AOV
    return grouped.map(g => ({
      ...g,
      aov: g.invoiceCount > 0 ? g.sales / g.invoiceCount : 0
    }));
  }, [alhamdulillahData]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Sales Performance (Alhamdulillah)</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Sales & Invoices by PIC</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceByPic} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(value: number, name: string) => name === 'sales' ? `Rp ${value.toLocaleString()}` : value.toLocaleString()} />
                <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="invoiceCount" name="Invoices" stroke="#f59e0b" strokeWidth={2} dot={{r:4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Avg Order Value by PIC</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceByPic} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Bar dataKey="aov" name="Avg Order Value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Detail per Sales</h3>
          <button 
            onClick={() => exportToCSV(performanceByPic, 'alhamdulillah_sales_performance.csv')}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Download size={16} className="mr-1" /> Export CSV
          </button>
        </div>
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Sales PIC</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Invoices</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Total Sales</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Avg Order Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performanceByPic.map((row) => (
              <tr key={row.name} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                <td className="px-4 py-3 text-right">{row.invoiceCount}</td>
                <td className="px-4 py-3 text-right text-gray-600">Rp {row.sales.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-600">Rp {row.aov.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}