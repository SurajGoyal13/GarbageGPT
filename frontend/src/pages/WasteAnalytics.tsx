import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Filter,
  Flame,
  Sun,
  AlertTriangle,
  Lightbulb,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { fetchWasteAnalytics, WasteAnalyticsData } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const WasteAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<WasteAnalyticsData | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('All Zones');
  const [period, setPeriod] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (zone: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWasteAnalytics(zone);
      setAnalyticsData(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load Waste Analytics. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedZone);
  }, [selectedZone]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-16" variant="card" />
        <LoadingSkeleton className="h-96" variant="chart" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-80" variant="chart" />
          <LoadingSkeleton className="h-80" variant="chart" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-8 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Analytics</h3>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <button
          onClick={() => loadData(selectedZone)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Filter Bar */}
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Zone & Aggregation Filters</h2>
            <p className="text-xs text-slate-400">Refine dataset by municipality zone or time period</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-wrap">
          {/* Zone Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-slate-400">Zone:</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="All Zones">All Zones</option>
              {analyticsData.zones?.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
            {(['Monthly', 'Quarterly', 'Yearly'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPeriod(mode)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  period === mode
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 1: Stacked Area Chart (Waste by Type over time) */}
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Waste Generation Trends by Classification
            </h2>
            <p className="text-xs text-slate-400">
              Stacked volumetric trajectories across organic, recyclable, e-waste, and hazardous streams
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Layers className="w-3.5 h-3.5 mr-1" />
            <span>Full Stream Breakdown</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={analyticsData.stacked_trends}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorRecyclable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorEwaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorHazardous" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#475569',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                }}
                formatter={(val: any) => [`${val.toLocaleString()} Tonnes`]}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(val) => (
                  <span className="text-xs text-slate-300 font-medium capitalize">{val}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="organic"
                stackId="1"
                stroke="#10b981"
                fill="url(#colorOrganic)"
              />
              <Area
                type="monotone"
                dataKey="recyclable"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#colorRecyclable)"
              />
              <Area
                type="monotone"
                dataKey="ewaste"
                stackId="1"
                stroke="#f59e0b"
                fill="url(#colorEwaste)"
              />
              <Area
                type="monotone"
                dataKey="hazardous"
                stackId="1"
                stroke="#ef4444"
                fill="url(#colorHazardous)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 2 & 3: Zone Composition + Seasonal Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Stacked Bar per Zone */}
        <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Zone Composition</h2>
            <p className="text-xs text-slate-400">Comparative category breakdown per zone</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={analyticsData.zone_composition}
                margin={{ top: 5, right: 10, left: 25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  type="category"
                  dataKey="zone"
                  stroke="#cbd5e1"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${val.toLocaleString()} Tonnes`]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '8px' }}
                  formatter={(val) => (
                    <span className="text-xs text-slate-300 font-medium capitalize">{val}</span>
                  )}
                />
                <Bar dataKey="organic" stackId="a" fill="#10b981" barSize={16} />
                <Bar dataKey="recyclable" stackId="a" fill="#3b82f6" barSize={16} />
                <Bar dataKey="ewaste" stackId="a" fill="#f59e0b" barSize={16} />
                <Bar dataKey="hazardous" stackId="a" fill="#ef4444" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Patterns Bar Chart */}
        <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Seasonal Patterns</h2>
              <p className="text-xs text-slate-400">Average monthly tonnage variation throughout the year</p>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.seasonal_patterns}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${val.toLocaleString()} Tonnes`, 'Avg Volume']}
                />
                <Bar
                  dataKey="avg_waste"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 4: Strategic Insights Cards */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 text-amber-400 mr-2" />
          Algorithmic Waste Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {analyticsData.insights?.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-5 hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.type === 'positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.type === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {item.type}
                  </span>
                  <Flame className="w-4 h-4 text-slate-500" />
                </div>
                <h4 className="text-base font-bold text-white mb-2 leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-700/50 flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Key Stat</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">{item.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
