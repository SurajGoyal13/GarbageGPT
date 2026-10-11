from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import pandas as pd
from app.data_generator import data_store

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


class MonthlyWasteTrendItem(BaseModel):
    month: str
    tonnes: float


class MonthlyEnergyTrendItem(BaseModel):
    month: str
    mwh: float


class WasteByTypeItem(BaseModel):
    type: str
    percentage: float
    tonnes: float


class ZoneSummaryItem(BaseModel):
    zone: str
    waste_tonnes: float
    energy_mwh: float
    population: int


class YoYGrowthItem(BaseModel):
    year: int
    waste: float
    energy: float


class DashboardStatsResponse(BaseModel):
    total_waste_tonnes: float
    total_energy_mwh: float
    active_zones: int
    prediction_accuracy: float
    monthly_waste_trend: List[MonthlyWasteTrendItem]
    monthly_energy_trend: List[MonthlyEnergyTrendItem]
    waste_by_type: List[WasteByTypeItem]
    zone_summary: List[ZoneSummaryItem]
    yoy_growth: List[YoYGrowthItem]


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats():
    waste_df = data_store.waste_data
    energy_df = data_store.energy_data
    zone_df = data_store.zone_info

    # Aggregates
    total_waste = round(float(waste_df["total_tonnes"].sum()), 1)
    total_energy = round(float(energy_df["demand_mwh"].sum()), 1)
    active_zones = len(zone_df)
    prediction_accuracy = 94.6

    # Monthly waste trend (aggregated across all zones)
    monthly_waste = waste_df.groupby("month")["total_tonnes"].sum().reset_index()
    monthly_waste_trend = [
        MonthlyWasteTrendItem(month=row["month"], tonnes=round(float(row["total_tonnes"]), 1))
        for _, row in monthly_waste.iterrows()
    ]

    # Monthly energy trend (aggregated across all zones)
    monthly_energy = energy_df.groupby("month")["demand_mwh"].sum().reset_index()
    monthly_energy_trend = [
        MonthlyEnergyTrendItem(month=row["month"], mwh=round(float(row["demand_mwh"]), 1))
        for _, row in monthly_energy.iterrows()
    ]

    # Waste breakdown by type
    total_org = float(waste_df["organic_tonnes"].sum())
    total_rec = float(waste_df["recyclable_tonnes"].sum())
    total_ew = float(waste_df["ewaste_tonnes"].sum())
    total_haz = float(waste_df["hazardous_tonnes"].sum())
    sum_types = total_org + total_rec + total_ew + total_haz

    waste_by_type = [
        WasteByTypeItem(
            type="Organic",
            percentage=round((total_org / sum_types) * 100, 1),
            tonnes=round(total_org, 1)
        ),
        WasteByTypeItem(
            type="Recyclable",
            percentage=round((total_rec / sum_types) * 100, 1),
            tonnes=round(total_rec, 1)
        ),
        WasteByTypeItem(
            type="E-Waste",
            percentage=round((total_ew / sum_types) * 100, 1),
            tonnes=round(total_ew, 1)
        ),
        WasteByTypeItem(
            type="Hazardous",
            percentage=round((total_haz / sum_types) * 100, 1),
            tonnes=round(total_haz, 1)
        ),
    ]

    # Zone Summary
    zone_waste = waste_df.groupby("zone")["total_tonnes"].sum().to_dict()
    zone_energy = energy_df.groupby("zone")["demand_mwh"].sum().to_dict()

    zone_summary = []
    for _, zrow in zone_df.iterrows():
        zname = zrow["zone"]
        zone_summary.append(
            ZoneSummaryItem(
                zone=zname,
                waste_tonnes=round(float(zone_waste.get(zname, 0.0)), 1),
                energy_mwh=round(float(zone_energy.get(zname, 0.0)), 1),
                population=int(zrow["population"])
            )
        )

    # YoY Growth
    yoy_waste = waste_df.groupby("year")["total_tonnes"].sum().to_dict()
    yoy_energy = energy_df.groupby("year")["demand_mwh"].sum().to_dict()
    years = sorted(list(set(waste_df["year"].unique())))

    yoy_growth = [
        YoYGrowthItem(
            year=int(yr),
            waste=round(float(yoy_waste.get(yr, 0.0)), 1),
            energy=round(float(yoy_energy.get(yr, 0.0)), 1)
        )
        for yr in years
    ]

    return DashboardStatsResponse(
        total_waste_tonnes=total_waste,
        total_energy_mwh=total_energy,
        active_zones=active_zones,
        prediction_accuracy=prediction_accuracy,
        monthly_waste_trend=monthly_waste_trend,
        monthly_energy_trend=monthly_energy_trend,
        waste_by_type=waste_by_type,
        zone_summary=zone_summary,
        yoy_growth=yoy_growth
    )
