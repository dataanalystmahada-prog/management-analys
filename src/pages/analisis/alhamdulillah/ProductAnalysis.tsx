import React, { useMemo } from 'react';
import { useFilter } from '../../../lib/analytics/FilterContext';
import { groupAlhamdulillahByProductField } from '../../../lib/analytics/engine';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts';

export default function ProductAnalysis() {
  const { alhamdulillahData, loading } = useFilter();

  const salesByProduct = useMemo(() => groupAlhamdulillahByProductField(alhamdulillahData, 'produk').slice(0, 15), [alhamdulillahData]);
  const salesBySubProduct = useMemo(() => groupAlhamdulillahByProductField(alhamdulillahData, 'sub_produk').slice(0, 15), [alhamdulillahData]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Product Analysis (Sales)</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Sales & Qty by Product</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesByProduct} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(value: number, name: string) => name === 'sales' ? `Rp ${value.toLocaleString()}` : value.toLocaleString()} />
                <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="qty" stroke="#10b981" strokeWidth={2} dot={{r:4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Sales by Sub Product</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesBySubProduct} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}