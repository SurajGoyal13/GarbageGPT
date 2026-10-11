import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import {
  MapPin,
  TrendingUp,
  DollarSign,
  Leaf,
  Users,
  Factory,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
} from 'lucide-react';
import {
  fetchPlantRecommendations,
  PlantRecommendationsResponse,
  PlantRecommendation,
} from '../services/api';
import { StatCard } from '../components/StatCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const getPlantColor = (type: string) => {
  switch (type) {
    case 'Biogas Plant':
      return { fill: '#10b981', ring: 'rgba(16, 185, 129, 0.3)', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'Material Recovery & Recycling':
      return { fill: '#3b82f6', ring: 'rgba(59, 130, 246, 0.3)', text: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'Solar-Biomass Hybrid':
      return { fill: '#f59e0b', ring: 'rgba(245, 158, 11, 0.3)', text: 'text-amber-400', bg: 'bg-amber-500/10' };
    default:
      return { fill: '#8b5cf6', ring: 'rgba(139, 92, 246, 0.3)', text: 'text-purple-400', bg: 'bg-purple-500/10' };
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  if (score >= 70) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
};

export const PlantPlacement: React.FC = () => {
  const [data, setData] = useState<PlantRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<PlantRecommendation | null>(null);

  useEffect(() => {
    const loadPlants = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPlantRecommendations();
        setData(res);
        if (res.recommendations && res.recommendations.length > 0) {
          setSelectedPlant(res.recommendations[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Plant recommendations from backend.');
      } finally {
        setLoading(false);
      }
    };
    loadPlants();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton variant="card" count={4} />
        </div>
        <LoadingSkeleton className="h-[460px]" variant="chart" />
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
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Recommendations</h3>
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

  // Sort recommendations descending by score
  const sortedRecommendations = [...data.recommendations].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 3: Summary Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Capex Investment"
          value={`₹${data.summary.total_investment_cr} Cr`}
          icon={DollarSign}
          color="emerald"
          trend="up"
          trendValue="Optimized"
          subtitle="allocated capital"
        />
        <StatCard
          title="Daily Plant Capacity"
          value={`${data.summary.total_capacity_tpd.toLocaleString()} TPD`}
          icon={Factory}
          color="blue"
          trend="up"
          trendValue="100% of waste"
          subtitle="tons per day processed"
        />
        <StatCard
          title="CO₂ Emissions Averted"
          value={`${data.summary.total_co2_reduction_tons.toLocaleString()} t/yr`}
          icon={Leaf}
          color="amber"
          trend="up"
          trendValue="Net negative"
          subtitle="carbon mitigation"
        />
        <StatCard
          title="Clean Tech Employment"
          value={`${data.summary.total_jobs.toLocaleString()} Jobs`}
          icon={Users}
          color="purple"
          trend="up"
          trendValue="High Impact"
          subtitle="direct local employment"
        />
      </div>

      {/* SECTION 1: Interactive Map using React-Leaflet */}
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 shadow-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Geospatial Plant Siting & Feasibility Map
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Delhi NCR Grid
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select markers to inspect optimal municipal coordinates, ROI metrics, and feedstocks
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-1.5 ring-2 ring-emerald-500/30"></span> Biogas Plant
            </span>
            <span className="flex items-center text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 mr-1.5 ring-2 ring-blue-500/30"></span> Material Recovery
            </span>
            <span className="flex items-center text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5 ring-2 ring-amber-500/30"></span> Solar-Biomass Hybrid
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-[460px] w-full rounded-xl overflow-hidden border border-slate-700/80 relative z-0 shadow-inner">
          <MapContainer
            center={[28.6139, 77.209]}
            zoom={11}
            scrollWheelZoom={false}
            className="h-full w-full"
            style={{ background: '#0f172a' }}
          >
            {/* Dark Mode CartoDB TileLayer */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {sortedRecommendations.map((plant, index) => {
              const colors = getPlantColor(plant.recommended_plant);
              return (
                <CircleMarker
                  key={index}
                  center={[plant.lat, plant.lng]}
                  radius={12}
                  pathOptions={{
                    fillColor: colors.fill,
                    fillOpacity: 0.9,
                    color: '#ffffff',
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedPlant(plant),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-2 text-slate-100 min-w-[210px]">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                        <span className="font-bold text-white text-sm">{plant.zone}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold border ${getScoreColor(plant.score)}`}>
                          Score: {plant.score}
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400 block">Proposed Facility:</span>
                        <span className={`font-semibold ${colors.text}`}>{plant.recommended_plant}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-700/50">
                        <div>
                          <span className="text-slate-400">Capacity:</span>
                          <p className="font-mono font-bold text-slate-200">{plant.capacity_tpd} TPD</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Investment:</span>
                          <p className="font-mono font-bold text-emerald-400">₹{plant.investment_cr} Cr</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Est. ROI:</span>
                          <p className="font-mono font-bold text-amber-400">{plant.roi_pct}% / yr</p>
                        </div>
                        <div>
                          <span className="text-slate-400">CO₂ Cut:</span>
                          <p className="font-mono font-bold text-cyan-400">{plant.co2_reduction_tons} t</p>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* SECTION 2: Recommendation Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Ranked Site Feasibility Assessments
            </h2>
            <p className="text-xs text-slate-400">
              Algorithms weight municipal waste density, land accessibility, grid distance, and payback period
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Sorted by Suitability Score</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRecommendations.map((plant, idx) => {
            const colors = getPlantColor(plant.recommended_plant);
            const isSelected = selectedPlant?.zone === plant.zone;

            return (
              <div
                key={idx}
                onClick={() => setSelectedPlant(plant)}
                className={`cursor-pointer bg-slate-800/90 border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                    : 'border-slate-700/70 hover:border-slate-600'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <h3 className="text-base font-bold text-white tracking-tight">{plant.zone}</h3>
                      </div>
                      <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                        {plant.lat.toFixed(4)}° N, {plant.lng.toFixed(4)}° E
                      </span>
                    </div>

                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold font-mono ${getScoreColor(plant.score)}`}>
                      ★ {plant.score}
                    </div>
                  </div>

                  {/* Plant Type Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md border ${colors.bg} ${colors.text} border-current/20`}>
                      <Factory className="w-3.5 h-3.5 mr-1.5" />
                      {plant.recommended_plant}
                    </span>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-700/60 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Capacity</span>
                      <span className="font-bold text-white font-mono text-sm">{plant.capacity_tpd} TPD</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Est. Capex</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">₹{plant.investment_cr} Cr</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Projected ROI</span>
                      <span className="font-bold text-amber-400 font-mono text-sm">{plant.roi_pct}% / yr</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">CO₂ Offset</span>
                      <span className="font-bold text-cyan-400 font-mono text-sm">{plant.co2_reduction_tons.toLocaleString()} t</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    +{plant.jobs_created} Direct Jobs
                  </span>
                  <span className="flex items-center text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {plant.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
