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
    return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading overview...</div>;
  }

  const cardClasses = "bg-white dark:bg-white/5 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-white/10 relative overflow-hidden group transition-colors duration-300";
  const titleClasses = "font-semibold text-gray-900 dark:text-slate-200 mb-4 flex items-center gap-2";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-emerald-400 dark:to-cyan-400 dark:bg-clip-text">Dashboard Overview</h1>

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
        <div className={cardClasses}>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all duration-500" />
          <h3 className={titleClasses}><span className="w-2 h-2 rounded-full bg-emerald-400"></span>Trend Leads</h3>
          <div className="h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendLeads}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#064e3b', color: '#f8fafc', borderRadius: '0.5rem'}} />
                <Line type="monotone" dataKey="Leads" stroke="#34d399" strokeWidth={3} dot={{r: 4, fill: '#0f172a', stroke: '#34d399', strokeWidth: 2}} activeDot={{r: 6, fill: '#34d399'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] group-hover:bg-cyan-500/20 transition-all duration-500" />
          <h3 className={titleClasses}><span className="w-2 h-2 rounded-full bg-cyan-400"></span>Trend Sales</h3>
          <div className="h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}M`} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#064e3b', color: '#f8fafc', borderRadius: '0.5rem'}} formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="Sales" stroke="#22d3ee" strokeWidth={3} dot={{r: 4, fill: '#0f172a', stroke: '#22d3ee', strokeWidth: 2}} activeDot={{r: 6, fill: '#22d3ee'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cardClasses}>
          <h3 className={titleClasses}>Top Leads by Source</h3>
          <div className="h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsBySource} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={100} />
                <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#064e3b', color: '#f8fafc', borderRadius: '0.5rem'}} />
                <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardClasses}>
          <h3 className={titleClasses}>Top Sales by Brand</h3>
          <div className="h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByBrand} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={100} />
                <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#064e3b', color: '#f8fafc', borderRadius: '0.5rem'}} formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Bar dataKey="sales" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className={cardClasses}>
          <h3 className={titleClasses}>Top Closing by PIC</h3>
          <div className="h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={closingByPic} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={100} />
                <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#064e3b', color: '#f8fafc', borderRadius: '0.5rem'}} />
                <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
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
    <div className="bg-white dark:bg-white/5 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-white/10 relative overflow-hidden group hover:border-blue-300 dark:hover:border-white/20 transition-all duration-300">
      <div className="hidden dark:block absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-[20px] group-hover:bg-emerald-500/20 transition-all duration-300" />
      <p className="text-xs font-semibold text-gray-500 dark:text-emerald-500/70 uppercase tracking-widest mb-2 truncate relative z-10" title={title}>{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 truncate relative z-10 drop-shadow-sm">{value}</p>
    </div>
  );
}
