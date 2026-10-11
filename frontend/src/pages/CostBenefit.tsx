import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Percent,
  Sparkles,
  Award,
} from 'lucide-react';
import { fetchCostBenefit, CostBenefitData, ScenarioPlan } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const CostBenefit: React.FC = () => {
  const [data, setData] = useState<CostBenefitData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('Moderate');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchCostBenefit();
        setData(res);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Cost-Benefit analysis from server.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={3} />
        </div>
        <LoadingSkeleton className="h-96" variant="chart" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-8 text-center max-w-xl mx-auto my-12 shadow-xl">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Financial Projections</h3>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: Scenario Comparison Cards */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Investment Scenarios & ROI Matrix</h2>
          <p className="text-xs text-slate-400">
            Compare financial feasibility across capital deployment intensities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.scenarios.map((scenario: ScenarioPlan, idx: number) => {
            const isRec = scenario.is_recommended || scenario.name.toLowerCase().includes('moderate');
            return (
              <div
                key={idx}
                onClick={() => setSelectedScenario(scenario.name)}
                className={`relative bg-slate-800/90 rounded-xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isRec
                    ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 -translate-y-1 bg-gradient-to-b from-slate-800 to-slate-800/95'
                    : 'border border-slate-700/80 hover:border-slate-600 shadow-lg'
                }`}
              >
                {/* Recommended Badge */}
                {isRec && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Recommended Strategy</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-extrabold text-white">{scenario.name}</h3>
                    <span className="text-xs text-slate-400 font-medium">10-Year Horizon</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed min-h-[36px]">
                    {scenario.description}
                  </p>

                  {/* Financial Stats */}
                  <div className="space-y-3 border-y border-slate-700/60 py-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Capex Investment</span>
                      <span className="font-extrabold text-white font-mono text-sm">
                        ₹{scenario.investment_cr} Cr
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Annual Revenue</span>
                      <span className="font-extrabold text-emerald-400 font-mono text-sm">
                        ₹{scenario.annual_revenue_cr} Cr / yr
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Payback Period</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {scenario.payback_years} Years
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Net Present Value (NPV)</span>
                      <span className="font-bold text-sky-400 font-mono">
                        +₹{scenario.npv_cr} Cr
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Internal Rate of Return (IRR)</span>
                      <span className="font-extrabold text-emerald-400 font-mono">
                        {scenario.irr_pct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center text-cyan-400">
                    <Leaf className="w-3.5 h-3.5 mr-1" />
                    -{scenario.co2_reduction_tons.toLocaleString()} t CO₂
                  </span>
                  <span className="font-semibold text-slate-300">+{scenario.jobs_created} Jobs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 10-Year Financial Projection Chart */}
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              10-Year Financial Proforma Cash Flows & Break-Even
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Annual operating revenue vs expenditure with cumulative cash flow trajectory
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center text-emerald-400">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1.5"></span> Revenue
            </span>
            <span className="flex items-center text-slate-400">
              <span className="w-3 h-3 bg-slate-600 rounded-sm mr-1.5"></span> Operating Cost
            </span>
            <span className="flex items-center text-cyan-400">
              <span className="w-3 h-0.5 bg-cyan-400 mr-1.5"></span> Net Cumulative Cash Flow
            </span>
          </div>
        </div>

        <div className="h-84 w-full">
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart
              data={data.projections_10yr}
              margin={{ top: 15, right: 10, left: -5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="year"
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
                tickFormatter={(v) => `₹${v}Cr`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#475569',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                }}
                formatter={(val: any) => [`₹${val} Cr`]}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
              <Bar
                dataKey="revenue_cr"
                name="Revenue"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="operating_cost_cr"
                name="OpEx"
                fill="#475569"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Line
                type="monotone"
                dataKey="cumulative_cash_flow_cr"
                name="Cumulative Cash Flow"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ fill: '#38bdf8', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: Environmental & Sustainability Impact */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight mb-4 flex items-center">
          <Leaf className="w-5 h-5 text-emerald-400 mr-2" />
          Quantified Environmental Dividends
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: CO2 Reduction */}
          <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Emissions Mitigation
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white font-mono mb-1">
              {data.environmental_impact.co2_reduction_tons_yr.toLocaleString()}
              <span className="text-sm font-normal text-slate-400 ml-1.5">Tons / yr</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Equivalent to taking ~32,000 internal combustion passenger vehicles off the road
            </p>
            <div className="w-full bg-slate-700/60 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full w-[84%]"></div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>National Target Progress</span>
              <span className="text-emerald-400 font-bold">84%</span>
            </div>
          </div>

          {/* Card 2: Landfill Diversion */}
          <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Landfill Diversion Rate
              </span>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white font-mono mb-1">
              {data.environmental_impact.landfill_diversion_pct}%
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Total reduction of legacy dump yard burdens across Ghazipur and Bhalswa landfills
            </p>
            <div className="w-full bg-slate-700/60 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                style={{ width: `${data.environmental_impact.landfill_diversion_pct}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>Zero-Waste City Trajectory</span>
              <span className="text-cyan-400 font-bold">{data.environmental_impact.landfill_diversion_pct}%</span>
            </div>
          </div>

          {/* Card 3: Energy from Waste */}
          <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Clean Grid Penetration
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white font-mono mb-1">
              {data.environmental_impact.energy_from_waste_pct}%
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Displacing fossil fuels by replacing {data.environmental_impact.coal_offset_tons.toLocaleString()} tons of coal combustion
            </p>
            <div className="w-full bg-slate-700/60 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-400 h-2 rounded-full"
                style={{ width: `${data.environmental_impact.energy_from_waste_pct * 3.5}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>Grid Energy Contribution</span>
              <span className="text-amber-400 font-bold">{data.environmental_impact.energy_from_waste_pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
