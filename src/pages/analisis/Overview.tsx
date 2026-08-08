import React, { useMemo } from 'react';
import { useFilter } from '../../lib/analytics/FilterContext';
import { 
  calculateBismillahMetrics, 
  calculateAlhamdulillahMetrics,
  groupBismillahByField,
  groupAlhamdulillahByInvoiceField
} from '../../lib/analytics/engine';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function Overview() {
  const { bismillahData, alhamdulillahData, loading } = useFilter();

  const bMetrics = useMemo(() => calculateBismillahMetrics(bismillahData), [bismillahData]);
  const aMetrics = useMemo(() => calculateAlhamdulillahMetrics(alhamdulillahData), [alhamdulillahData]);
  
  const leadsBySource = useMemo(() => groupBismillahByField(bismillahData, 'sumber_klien').slice(0, 5), [bismillahData]);
  const salesByBrand = useMemo(() => groupAlhamdulillahByInvoiceField(alhamdulillahData, 'brand').slice(0, 5), [alhamdulillahData]);
  const closingByPic = useMemo(() => {
    const closings = bismillahData.filter(r => (r.status_order && String(r.status_order).toLowerCase().includes('closing')) || (r.status && String(r.status).toLowerCase().includes('closing')));
    return groupBismillahByField(closings, 'pic').slice(0, 5);
  }, [bismillahData]);

  // Monthly trend for leads
  const trendLeads = useMemo(() => {
    const grouped = bismillahData.reduce((acc, r) => {
      const month = r.bulan || 'Unknown';
      if (!acc[month]) acc[month] = 0;
      acc[month]++;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped).map(([month, count]) => ({ month, Leads: count })).sort((a,b) => a.month.localeCompare(b.month));
  }, [bismillahData]);

  // Monthly trend for Sales
  const trendSales = useMemo(() => {
    const grouped = alhamdulillahData.reduce((acc, r) => {
      const month = r.bulan || 'Unknown';
      if (!acc[month]) acc[month] = 0;
      acc[month] += (Number(r.penjualan) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped).map(([month, sales]) => ({ month, Sales: sales })).sort((a,b) => a.month.localeCompare(b.month));
  }, [alhamdulillahData]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading overview...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Leads" value={bMetrics.totalLeads} />
        <KpiCard title="Qualified Leads" value={bMetrics.qualifiedLeads} />
        <KpiCard title="Closing" value={bMetrics.closing} />
        <KpiCard title="Conversion Rate" value={`${bMetrics.conversionRate.toFixed(1)}%`} />
        <KpiCard title="Potential Omzet" value={`Rp ${bMetrics.potentialOmzet.toLocaleString()}`} />
        
        <KpiCard title="Unique Invoice" value={aMetrics.uniqueInvoiceCount} />
        <KpiCard title="Total Sales" value={`Rp ${aMetrics.totalSales.toLocaleString()}`} />
        <KpiCard title="Total Qty" value={aMetrics.totalQty.toLocaleString()} />
        <KpiCard title="Avg Order Value" value={`Rp ${aMetrics.averageOrderValue.toLocaleString()}`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Trend Leads</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendLeads}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Line type="monotone" dataKey="Leads" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Trend Sales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}M`} />
                <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Top Leads by Source</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsBySource} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} width={100} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Top Sales by Brand</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByBrand} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} width={100} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Bar dataKey="sales" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Top Closing by PIC</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={closingByPic} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} width={100} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
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
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 truncate" title={title}>{title}</p>
      <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
    </div>
  );
}
