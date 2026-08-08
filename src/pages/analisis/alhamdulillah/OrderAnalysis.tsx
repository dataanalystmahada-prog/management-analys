import React, { useMemo } from 'react';
import { useFilter } from '../../../lib/analytics/FilterContext';
import { groupAlhamdulillahByInvoiceField } from '../../../lib/analytics/engine';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

export default function OrderAnalysis() {
  const { alhamdulillahData, loading } = useFilter();

  const closingDurationGroup = useMemo(() => {
    // group by durasi_closing
    return groupAlhamdulillahByInvoiceField(alhamdulillahData, 'durasi_closing');
  }, [alhamdulillahData]);

  const timeStatusGroup = useMemo(() => {
    // group by waktu_order_selesai
    return groupAlhamdulillahByInvoiceField(alhamdulillahData, 'waktu_order_selesai');
  }, [alhamdulillahData]);
  
  const invTrend = useMemo(() => {
    const grouped = alhamdulillahData.reduce((acc, r) => {
      const month = r.bulan || 'Unknown';
      if (!acc[month]) acc[month] = new Set();
      if (r.inv) acc[month].add(r.inv);
      return acc;
    }, {} as Record<string, Set<string>>);
    return Object.entries(grouped).map(([month, invoices]) => ({ month, Invoices: (invoices as Set<string>).size })).sort((a,b) => a.month.localeCompare(b.month));
  }, [alhamdulillahData]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Order Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Invoice Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={invTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Line type="monotone" dataKey="Invoices" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Closing Duration (Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={closingDurationGroup} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="invoiceCount" name="Invoices" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Waktu Order Selesai (Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeStatusGroup} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="invoiceCount" name="Invoices" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}