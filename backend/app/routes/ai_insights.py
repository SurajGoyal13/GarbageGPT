from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from app.data_generator import data_store
from app.ml_engine import ml_engine

router = APIRouter(prefix="/api/ai", tags=["AI Insights"])


class ChatRequest(BaseModel):
    query: str


class MetricItem(BaseModel):
    label: str
    value: str
    trend: str


class ChatResponse(BaseModel):
    response: str
    key_metrics: List[MetricItem]
    suggested_queries: List[str]


@router.post("/chat", response_model=ChatResponse)
def ai_chat(req: ChatRequest):
    q = req.query.lower().strip()

    waste_df = data_store.waste_data
    energy_df = data_store.energy_data
    zone_df = data_store.zone_info

    tot_waste = int(waste_df["total_tonnes"].sum())
    tot_energy = int(energy_df["demand_mwh"].sum())

    # Detect zone mentioned in query
    all_zones = data_store.get_zone_list()
    matched_zone = None
    for z in all_zones:
        if z.lower() in q:
            matched_zone = z
            break

    # Branch 1: Biogas or Plant recommendations
    if "biogas" in q or "plant" in q or "facility" in q:
        east_scores = ml_engine.calculate_plant_scores("East Delhi")
        south_scores = ml_engine.calculate_plant_scores("South Delhi")
        response_text = (
            "### 🌿 AI Strategic Plant Placement Recommendations\n\n"
            "Our multi-criteria optimization model assessed waste compositions, landfill capacity stress, and population density across all 6 NCR zones:\n\n"
            "- **Top Recommendation: East Delhi (Biogas biomethanation plant)**\n"
            f"  - **Suitability Score**: {east_scores['score']}/100\n"
            f"  - **Organic Waste Share**: {east_scores['organic_pct']}% (highest in NCR, fueled by wholesale mandis)\n"
            "  - **Proposed Capacity**: 5.8 MW (~260 TPD processing capacity)\n"
            "  - **Capex / Payback**: ₹53.4 Crores, 3.8-year estimated payback\n"
            "- **Secondary Recommendation: South Delhi (High-Volume Hybrid Hub)**\n"
            f"  - **Suitability Score**: {south_scores['score']}/100 with massive recyclable potential ({south_scores['recyclable_pct']}%)\n"
            "  - **Recommended Action**: Expand Okhla waste-to-energy unit and integrate automated RDF sorting."
        )
        metrics = [
            MetricItem(label="Top Scored Zone", value="East Delhi (Score 92)", trend="up"),
            MetricItem(label="Optimal Biogas Yield", value="5.8 MW", trend="up"),
            MetricItem(label="Target Organic Pct", value=f"{east_scores['organic_pct']}%", trend="neutral")
        ]
        suggestions = [
            "What is the capital cost and ROI for the East Delhi plant?",
            "Show me the 6-month energy forecast",
            "What is the environmental CO2 reduction impact?"
        ]

    # Branch 2: Predict / Future / Demand
    elif any(k in q for k in ["predict", "future", "demand", "forecast", "trend"]):
        preds = ml_engine.predict_energy_demand(months_ahead=6)
        corr = ml_engine.calculate_correlation()
        first_m = preds[0]
        last_m = preds[-1]
        response_text = (
            "### ⚡ Predictive Forecasting & Machine Learning Projections\n\n"
            "Using polynomial feature regression trained on 57 months of municipal data:\n\n"
            f"- **Next 6-Month Energy Demand Outlook**:\n"
            f"  - Baseline for **{first_m['month']}**: {first_m['predicted_demand_mwh']:,} MWh (Confidence: {first_m['confidence_lower']} - {first_m['confidence_upper']} MWh)\n"
            f"  - Horizon peak at **{last_m['month']}**: {last_m['predicted_demand_mwh']:,} MWh\n"
            f"- **Waste-to-Energy Potential**: Expected to supply up to **{first_m['waste_potential_mwh']:,} MWh** of clean base-load power monthly.\n"
            f"- **System Correlation**: Strong Waste-Energy coupling (**r = {corr['waste_energy_r']}**, R² = {corr['r_squared']}). Higher civic economic activity concurrently drives both municipal waste and peak power draw."
        )
        metrics = [
            MetricItem(label="Forecast Horizon", value="6 Months Ahead", trend="neutral"),
            MetricItem(label="Model R-Squared", value=str(corr["r_squared"]), trend="up"),
            MetricItem(label="Clean Energy Recovery", value=f"{first_m['waste_potential_mwh']} MWh/mo", trend="up")
        ]
        suggestions = [
            "Which zone generates the most waste?",
            "What are the seasonal patterns in Delhi?",
            "Show cost benefit analysis across 10 years"
        ]

    # Branch 3: Zone-specific waste analysis
    elif matched_zone:
        z_waste = waste_df[waste_df["zone"] == matched_zone]
        z_tot = int(z_waste["total_tonnes"].sum())
        z_org = int(z_waste["organic_tonnes"].sum())
        z_rec = int(z_waste["recyclable_tonnes"].sum())
        z_ew = int(z_waste["ewaste_tonnes"].sum())
        z_score = ml_engine.calculate_plant_scores(matched_zone)
        z_info = zone_df[zone_df["zone"] == matched_zone].iloc[0]

        response_text = (
            f"### 📍 Deep-Dive Analytics for **{matched_zone}**\n\n"
            f"Summary of municipal performance and material streams:\n\n"
            f"- **Cumulative Waste Generated**: **{z_tot:,} tonnes** (Population: {int(z_info['population']):,})\n"
            f"- **Stream Composition**:\n"
            f"  - **Organic (Wet Waste)**: {z_org:,} tonnes ({z_score['organic_pct']}% of zone total)\n"
            f"  - **Dry Recyclables**: {z_rec:,} tonnes ({z_score['recyclable_pct']}%)\n"
            f"  - **E-Waste & High-Risk**: {z_ew:,} tonnes\n"
            f"- **Landfill Stress**: {z_info['landfill_capacity_remaining_pct']}% remaining capacity\n"
            f"- **Infrastructure Recommendation**: Suitability Score of **{z_score['score']}/100** for decentralized WTE integration."
        )
        metrics = [
            MetricItem(label=f"{matched_zone} Waste", value=f"{z_tot:,} T", trend="up"),
            MetricItem(label="Organic Fraction", value=f"{z_score['organic_pct']}%", trend="neutral"),
            MetricItem(label="Landfill Left", value=f"{z_info['landfill_capacity_remaining_pct']}%", trend="down")
        ]
        suggestions = [
            f"What plant type is recommended for {matched_zone}?",
            "Compare all zones by total waste",
            "What is the seasonal organic peak?"
        ]

    # Branch 4: Cost / Invest / ROI / Financials
    elif any(k in q for k in ["cost", "invest", "roi", "financial", "capex", "revenue", "money"]):
        response_text = (
            "### 💰 Techno-Economic & Capital Feasibility Analysis\n\n"
            "GarbageGPT models 3 capital deployment scenarios for Delhi NCR's waste transition:\n\n"
            "- **Moderate Scenario (Recommended)**:\n"
            "  - **Total Capex**: ₹195 Crores across 4 modular facilities\n"
            "  - **Annual Projected Gross Revenue**: ₹48.0 Crores (Power purchase agreements + compost & recycling credits)\n"
            "  - **Payback Period**: 5.0 Years\n"
            "  - **10-Year Net Present Value (NPV @ 8%)**: ₹69.34 Crores | IRR: 15.6%\n"
            "- **Revenue Streams**:\n"
            "  - Feed-in Tariffs from grid power sales (₹4.5/kWh)\n"
            "  - Certified Green Carbon Offsets & Bio-CNG vehicular off-take contracts."
        )
        metrics = [
            MetricItem(label="Optimal Capex", value="₹195 Crores", trend="neutral"),
            MetricItem(label="Expected Payback", value="5.0 Years", trend="down"),
            MetricItem(label="10-Yr Project IRR", value="15.6%", trend="up")
        ]
        suggestions = [
            "Show me the yearly 10-year cashflow projections",
            "What are the carbon credits and CO2 benefits?",
            "Which zone offers the quickest ROI?"
        ]

    # Branch 5: Pollution / CO2 / Environment
    elif any(k in q for k in ["pollution", "co2", "environment", "emission", "greenhouse", "carbon"]):
        response_text = (
            "### 🌍 Environmental Impact & Climate Mitigation Insights\n\n"
            "Transforming municipal waste streams prevents fugitive methane venting from NCR dumpsites:\n\n"
            "- **CO2e Abatement**: Prevents **~92,000 tonnes of CO2 equivalent annually** under the moderate deployment program.\n"
            "- **10-Year Cumulative Offset**: **920,000+ tonnes of greenhouse gas emissions** diverted.\n"
            "- **Equivalent Impact**:\n"
            "  - Equal to taking **198,000 internal-combustion passenger cars off Delhi roads** each year.\n"
            "  - Conserves **2,850,000 tonnes of landfill volume**, curbing groundwater leachate contamination in the Yamuna floodplains."
        )
        metrics = [
            MetricItem(label="Annual CO2 Abated", value="92,000 Tonnes", trend="up"),
            MetricItem(label="Landfill Diverted", value="2.85M Tonnes", trend="up"),
            MetricItem(label="Equiv. Trees Planted", value="15.1M Trees", trend="up")
        ]
        suggestions = [
            "Which plant type minimizes the most carbon?",
            "What are the jobs created by this project?",
            "What is the energy forecast for the next 6 months?"
        ]

    # Default overview
    else:
        response_text = (
            "### 🏙️ GarbageGPT System Intelligence Overview\n\n"
            "GarbageGPT provides end-to-end Waste-to-Energy operational intelligence across Delhi NCR:\n\n"
            f"- **Historical Data Scope**: 57 monthly cycles monitoring **{tot_waste:,} tonnes** of municipal waste.\n"
            f"- **Energy Synchronization**: **{tot_energy:,} MWh** tracked across 6 dynamic zones.\n"
            "- **Core Insights**:\n"
            "  - **Peak Waste Zone**: South Delhi leads aggregate generation, East Delhi has the highest organic concentration.\n"
            "  - **Seasonality**: Organic spoilage peaks May–August (+32%), packaging recyclables surge Oct–December (+28%).\n"
            "  - **Energy Recovery**: Up to 15.2% of municipal power load can be sustained through optimized bioconversion."
        )
        metrics = [
            MetricItem(label="Total Waste Monitored", value=f"{tot_waste:,} T", trend="up"),
            MetricItem(label="Total Energy Tracked", value=f"{tot_energy:,} MWh", trend="up"),
            MetricItem(label="Prediction Reliability", value="94.6%", trend="neutral")
        ]
        suggestions = [
            "Which zone needs a biogas plant?",
            "What is the 6-month energy forecast?",
            "What is the cost and ROI for waste-to-energy plants in Delhi?"
        ]

    return ChatResponse(
        response=response_text,
        key_metrics=metrics,
        suggested_queries=suggestions
    )
