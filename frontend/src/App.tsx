import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trash2,
  Zap,
  MapPin,
  TrendingUp,
  Brain,
  Search,
  Bell,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { WasteAnalytics } from './pages/WasteAnalytics';
import { EnergyPredictions } from './pages/EnergyPredictions';
import { PlantPlacement } from './pages/PlantPlacement';
import { CostBenefit } from './pages/CostBenefit';
import { AIInsights } from './pages/AIInsights';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Waste Analytics', path: '/waste-analytics', icon: Trash2 },
  { name: 'Energy Predictions', path: '/energy-predictions', icon: Zap },
  { name: 'Plant Placement', path: '/plant-placement', icon: MapPin },
  { name: 'Cost-Benefit Analysis', path: '/cost-benefit', icon: TrendingUp },
  { name: 'AI Insights', path: '/ai-insights', icon: Brain },
];

export const App: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const active = NAV_ITEMS.find((item) => item.path === location.pathname);
    return active ? active.name : 'GarbageGPT Intelligence';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* FIXED LEFT SIDEBAR (280px) */}
      <aside className="w-[280px] flex-shrink-0 bg-slate-900 border-r border-slate-700/80 flex flex-col justify-between z-20">
        <div>
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-black tracking-tight text-white">Garbage</span>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  GPT
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400/90 tracking-wide block uppercase">
                Waste → Energy Intel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Platform Modules
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Badges */}
        <div className="p-4 m-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Hackathon Edition
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="text-xs text-slate-300 font-medium leading-snug">
            Built for Amazon Hackathon 2026
          </div>
          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center">
              <span className="font-bold text-amber-400 mr-1">AWS</span> Bedrock &amp; SageMaker
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 flex-shrink-0 bg-slate-900/90 backdrop-blur border-b border-slate-700/80 px-8 flex items-center justify-between z-10">
          {/* Dynamic Page Title */}
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{getPageTitle()}</h1>
          </div>

          {/* Right Topbar Controls */}
          <div className="flex items-center space-x-4">
            {/* Decorative Search Bar */}
            <div className="hidden sm:flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 w-64 focus-within:border-emerald-500 transition-colors">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search zones, telemetry, plants..."
                className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
                readOnly
              />
            </div>

            {/* Notification Bell */}
            <div className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>

            {/* Powered by AWS Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 shadow-sm">
              <span className="text-amber-400 font-bold">AWS</span>
              <span className="text-slate-400">Powered</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE ROUTE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/waste-analytics" element={<WasteAnalytics />} />
              <Route path="/energy-predictions" element={<EnergyPredictions />} />
              <Route path="/plant-placement" element={<PlantPlacement />} />
              <Route path="/cost-benefit" element={<CostBenefit />} />
              <Route path="/ai-insights" element={<AIInsights />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
