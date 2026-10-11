from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.data_generator import data_store
from app.ml_engine import ml_engine

router = APIRouter(prefix="/api/plants", tags=["Plants"])


class PlantRecommendationItem(BaseModel):
    zone: str
    lat: float
    lng: float
    plant_type: str
    capacity_mw: float
    investment_crores: float
    roi_years: float
    annual_revenue_crores: float
    waste_processed_tpd: int
    co2_reduction_tonnes: int
    jobs_created: int
    score: int
    reasoning: str


class PlantsRecommendationsResponse(BaseModel):
    recommendations: List[PlantRecommendationItem]
    total_investment_crores: float
    total_capacity_mw: float
    total_co2_reduction: int
    total_jobs: int


@router.get("/recommendations", response_model=PlantsRecommendationsResponse)
def get_plant_recommendations():
    zone_info = data_store.zone_info
    recommendations = []

    # Zone landmarks and local context for realistic hackathon presentation
    zone_contexts = {
        "East Delhi": {
            "site": "near Ghazipur landfill remediation zone",
            "solar_site": "Mayur Vihar green corridor"
        },
        "South Delhi": {
            "site": "near Okhla industrial corridor",
            "solar_site": "Asola Bhatti buffer zone"
        },
        "North Delhi": {
            "site": "adjacent to Bhalswa remediation complex",
            "solar_site": "Narela industrial cluster"
        },
        "West Delhi": {
            "site": "near Mundka eco-industrial zone",
            "solar_site": "Tikri border transmission node"
        },
        "Central Delhi": {
            "site": "rooftop micro-hub near ITO civic center",
            "solar_site": "Pragati Maidan renewable grid"
        },
        "Noida": {
            "site": "Sector 145 municipal waste processing hub",
            "solar_site": "Yamuna Expressway green belt"
        }
    }

    for _, row in zone_info.iterrows():
        zname = str(row["zone"])
        lat = float(row["lat"])
        lng = float(row["lng"])

        score_data = ml_engine.calculate_plant_scores(zname)
        score = score_data["score"]
        organic_pct = score_data["organic_pct"]
        rec_pct = score_data["recyclable_pct"]
        ctx = zone_contexts.get(zname, {"site": "designated municipal zone", "solar_site": "civic solar rooftop"})

        # Plant type determination
        if organic_pct >= 50.0:
            plant_type = "Biogas"
            capacity_mw = round(3.5 + (score / 100.0) * 3.0, 1)  # 3.5 - 6.5 MW
            investment_crores = round(capacity_mw * 9.2, 1)       # ~35 - 60 Crores
            annual_rev = round(investment_crores * 0.26, 1)       # ~26% gross yield
            roi_years = round(investment_crores / annual_rev, 1)
            tpd = int(capacity_mw * 45)
            co2 = int(capacity_mw * 3200)
            jobs = int(capacity_mw * 24)
            reasoning = (
                f"Elevated organic fraction ({organic_pct}%) enables high-efficiency anaerobic digestion; "
                f"strategic land availability {ctx['site']} with acute landfill diversion need."
            )
        elif rec_pct >= 40.0:
            plant_type = "Recycling Hub"
            capacity_mw = round(2.0 + (score / 100.0) * 2.0, 1)
            investment_crores = round(capacity_mw * 7.5, 1)
            annual_rev = round(investment_crores * 0.28, 1)
            roi_years = round(investment_crores / annual_rev, 1)
            tpd = int(capacity_mw * 60)
            co2 = int(capacity_mw * 2500)
            jobs = int(capacity_mw * 30)
            reasoning = (
                f"Substantial recyclable packaging density ({rec_pct}%); ideal for automated sorting and "
                f"pelletizing hub at {ctx['site']}."
            )
        else:
            plant_type = "Solar"
            capacity_mw = round(4.0 + (score / 100.0) * 2.5, 1)
            investment_crores = round(capacity_mw * 5.0, 1)
            annual_rev = round(investment_crores * 0.22, 1)
            roi_years = round(investment_crores / annual_rev, 1)
            tpd = 0
            co2 = int(capacity_mw * 2800)
            jobs = int(capacity_mw * 15)
            reasoning = (
                f"Balanced waste distribution favors hybrid solar canopy installations at {ctx['solar_site']} "
                f"to offset peak municipal grid load."
            )

        recommendations.append(
            PlantRecommendationItem(
                zone=zname,
                lat=lat,
                lng=lng,
                plant_type=plant_type,
                capacity_mw=capacity_mw,
                investment_crores=investment_crores,
                roi_years=roi_years,
                annual_revenue_crores=annual_rev,
                waste_processed_tpd=tpd,
                co2_reduction_tonnes=co2,
                jobs_created=jobs,
                score=score,
                reasoning=reasoning
            )
        )

    # Sort descending by feasibility score
    recommendations.sort(key=lambda x: x.score, reverse=True)

    tot_inv = round(sum(r.investment_crores for r in recommendations), 1)
    tot_cap = round(sum(r.capacity_mw for r in recommendations), 1)
    tot_co2 = int(sum(r.co2_reduction_tonnes for r in recommendations))
    tot_jobs = int(sum(r.jobs_created for r in recommendations))

    return PlantsRecommendationsResponse(
        recommendations=recommendations,
        total_investment_crores=tot_inv,
        total_capacity_mw=tot_cap,
        total_co2_reduction=tot_co2,
        total_jobs=tot_jobs
    )
