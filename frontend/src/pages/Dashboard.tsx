import React, { useEffect, useState } from 'react';
import {
  Trash2,
  Zap,
  MapPin,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchDashboardStats, DashboardStats } from '../services/api';
import { StatCard } from '../components/StatCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await fetchDashboardStats();
      setData(stats);
    } catch (err: any) {
      console.error(err);
      setError(
        'Unable to connect to the backend server (http://localhost:8000). Please make sure the FastAPI server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton variant="card" count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <LoadingSkeleton className="lg:col-span-7 h-96" variant="chart" />
          <LoadingSkeleton className="lg:col-span-5 h-96" variant="chart" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-80" variant="chart" />
          <LoadingSkeleton className="h-80" variant="chart" />
        </div>
        <LoadingSkeleton variant="table" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-8 text-center max-w-2xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Backend Connection Issue</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </button>
      </div>
    );
  }

  // Calculate total waste composition for donut center
  const totalComp = data.waste_composition.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ROW 1: 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Waste Processed"
          value={`${data.total_waste_processed.toLocaleString()} T`}
          icon={Trash2}
          color="emerald"
          trend="up"
          trendValue={data.waste_trend || '+12.4%'}
          subtitle="vs last quarter"
        />
        <StatCard
          title="Energy Demand"
          value={`${data.total_energy_demand.toLocaleString()} MWh`}
          icon={Zap}
          color="amber"
          trend="up"
          trendValue="+8.1%"
          subtitle="city wide load"
        />
        <StatCard
          title="Active Monitoring Zones"
          value={data.active_zones_count}
          icon={MapPin}
          color="blue"
          trend="neutral"
          trendValue="100% Online"
          subtitle="smart sensor nodes"
        />
        <StatCard
          title="AI Prediction Accuracy"
          value={`${data.prediction_accuracy}%`}
          icon={Sparkles}
          color="purple"
          trend="up"
          trendValue="+2.1%"
          subtitle="XGBoost & Prophet"
        />
      </div>

      {/* ROW 2: Monthly Trends & Waste Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 60%: Area Chart */}
        <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Monthly Waste & Energy Trends
              </h2>
              <p className="text-xs text-slate-400">
                Correlation between municipal solid waste and energy output
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50">
              Dual Y-Axis
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.monthly_trends}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                  yAxisId="left"
                  stroke="#10b981"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ fontSize: '13px' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '15px' }}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-slate-300">
                      {value === 'waste_tonnes' ? 'Waste (Tonnes)' : 'Energy Demand (MWh)'}
                    </span>
                  )}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="waste_tonnes"
                  name="waste_tonnes"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#wasteGradient)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="energy_mwh"
                  name="energy_mwh"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 40%: Waste Composition Donut */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Waste Composition</h2>
            <p className="text-xs text-slate-400">Distribution by organic and recyclable fractions</p>
          </div>

          <div className="relative h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.waste_composition}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.waste_composition.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${val} %`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{totalComp}%</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">Categorized</span>
            </div>
          </div>

          {/* Legend chips */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
            {data.waste_composition.map((c, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.color || PIE_COLORS[i % PIE_COLORS.length] }}
                ></span>
                <span className="text-slate-300 truncate">{c.name}</span>
                <span className="text-slate-500 ml-auto font-medium">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: Waste by Zone & YoY Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Waste by Zone */}
        <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Waste Volume by Zone</h2>
              <p className="text-xs text-slate-400">Total tonnage processed in the current cycle</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data.waste_by_zone}
                margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
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
                  formatter={(val: any) => [`${val.toLocaleString()} Tonnes`, 'Waste']}
                />
                <Bar dataKey="waste_tonnes" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: YoY Comparison */}
        <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Year-over-Year Shift</h2>
              <p className="text-xs text-slate-400">Comparison across waste treatment verticals</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.yoy_comparison}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="category"
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(val) => (
                    <span className="text-xs text-slate-300 font-medium">
                      {val === 'last_year' ? 'Previous Year' : 'Current Year'}
                    </span>
                  )}
                />
                <Bar
                  dataKey="last_year"
                  name="last_year"
                  fill="#64748b"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="current_year"
                  name="current_year"
                  fill="#38bdf8"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 4: Zone Summary Table */}
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/70 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Zone Level Metrics</h2>
            <p className="text-xs text-slate-400">Detailed overview of waste output and per-capita intensity</p>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
            Live Telemetry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-850/80 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700">
                <th className="py-3.5 px-6">Zone</th>
                <th className="py-3.5 px-6">Population</th>
                <th className="py-3.5 px-6">Waste (Tonnes)</th>
                <th className="py-3.5 px-6">Energy (MWh)</th>
                <th className="py-3.5 px-6">Waste / Capita (kg/day)</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm font-medium">
              {data.zones_summary.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-700/40 transition-colors duration-150 odd:bg-slate-800/40"
                >
                  <td className="py-4 px-6 text-white font-semibold flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{row.zone}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {row.population.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-emerald-400 font-mono">
                    {row.waste_tonnes.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-amber-400 font-mono">
                    {row.energy_mwh.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-mono">
                    {row.waste_per_capita.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Optimal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
