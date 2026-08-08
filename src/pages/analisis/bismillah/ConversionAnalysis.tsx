import React, { useMemo } from 'react';
import { useFilter } from '../../../lib/analytics/FilterContext';
import { 
  calculateBismillahMetrics,
  groupBismillahByField,
} from '../../../lib/analytics/engine';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts';

export default function ConversionAnalysis() {
  const { bismillahData, loading } = useFilter();

  const metrics = useMemo(() => calculateBismillahMetrics(bismillahData), [bismillahData]);

  // Helper to calculate conversion grouped by a field
  const getConversionByField = (field: string, top = 10) => {
    const groupedAll = groupBismillahByField(bismillahData, field);
    const closings = bismillahData.filter(r => (r.status_order && String(r.status_order).toLowerCase().includes('closing')) || (r.status && String(r.status).toLowerCase().includes('closing')));
    const groupedClosing = groupBismillahByField(closings, field);
    
    return groupedAll.slice(0, top).map(g => {
      const closingCount = groupedClosing.find(c => c.name === g.name)?.count || 0;
      return {
        name: g.name,
        Leads: g.count,
        Closing: closingCount,
        'Conversion Rate': g.count > 0 ? Number(((closingCount / g.count) * 100).toFixed(1)) : 0
      };
    }).sort((a,b) => b.Closing - a.Closing);
  };

  const convByBrand = useMemo(() => getConversionByField('brand'), [bismillahData]);
  const convBySales = useMemo(() => getConversionByField('pic'), [bismillahData]);
  const convBySource = useMemo(() => getConversionByField('sumber_klien'), [bismillahData]);
  const convByProduct = useMemo(() => getConversionByField('produk_tanya'), [bismillahData]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Conversion Analysis</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Leads" value={metrics.totalLeads} />
        <KpiCard title="Total Closing" value={metrics.closing} />
        <KpiCard title="Total Batal" value={metrics.batal} />
        <KpiCard title="Conversion Rate" value={`${metrics.conversionRate.toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionChart title="Conversion by Brand" data={convByBrand} />
        <ConversionChart title="Conversion by Sales" data={convBySales} />
        <ConversionChart title="Conversion by Source" data={convBySource} />
        <ConversionChart title="Conversion by Product" data={convByProduct} />
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

function ConversionChart({ title, data }: { title: string, data: any[] }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={val => `${val}%`} />
            <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
            <Bar yAxisId="left" dataKey="Leads" fill="#9ca3af" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar yAxisId="left" dataKey="Closing" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
            <Line yAxisId="right" type="monotone" dataKey="Conversion Rate" stroke="#10b981" strokeWidth={2} dot={{r:4}} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}