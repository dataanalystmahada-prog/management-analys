import React, { useMemo } from 'react';
import { useFilter } from '../../../lib/analytics/FilterContext';
import { 
  calculateAlhamdulillahMetrics,
  groupAlhamdulillahByInvoiceField
} from '../../../lib/analytics/engine';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function SalesAnalysis() {
  const { alhamdulillahData, loading } = useFilter();

  const metrics = useMemo(() => calculateAlhamdulillahMetrics(alhamdulillahData), [alhamdulillahData]);

  const trendSales = useMemo(() => {
    const grouped = alhamdulillahData.reduce((acc, r) => {
      const month = r.bulan || 'Unknown';
      if (!acc[month]) acc[month] = 0;
      acc[month] += (Number(r.penjualan) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped).map(([month, Sales]) => ({ month, Sales })).sort((a,b) => a.month.localeCompare(b.month));
  }, [alhamdulillahData]);

  const salesByBrand = useMemo(() => groupAlhamdulillahByInvoiceField(alhamdulillahData, 'brand'), [alhamdulillahData]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Sales Analysis</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Unique Invoice" value={metrics.uniqueInvoiceCount} />
        <KpiCard title="Total Sales" value={`Rp ${metrics.totalSales.toLocaleString()}`} />
        <KpiCard title="Total Qty" value={metrics.totalQty.toLocaleString()} />
        <KpiCard title="Avg Order Value" value={`Rp ${metrics.averageOrderValue.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Sales Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Sales by Brand</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByBrand} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} width={80} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}