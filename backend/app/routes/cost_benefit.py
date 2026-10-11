from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np

router = APIRouter(prefix="/api/cost-benefit", tags=["Cost Benefit"])


class ScenarioModel(BaseModel):
    scenario_name: str
    investment_crores: float
    annual_revenue_crores: float
    payback_years: float
    npv_crores: float
    irr_pct: float
    co2_reduction_tonnes_per_year: int
    jobs_created: int
    clean_mwh_generated_per_year: float


class YearlyProjectionItem(BaseModel):
    year: int
    conservative_revenue_crores: float
    moderate_revenue_crores: float
    aggressive_revenue_crores: float
    conservative_net_cashflow_crores: float
    moderate_net_cashflow_crores: float
    aggressive_net_cashflow_crores: float
    cumulative_co2_saved_tonnes: int


class EnvironmentalImpactSummary(BaseModel):
    total_landfill_diversion_tonnes_10yr: int
    total_co2_offset_tonnes_10yr: int
    fossil_fuel_replaced_barrels: int
    equivalent_trees_planted: int
    methane_emissions_abated_tonnes: int


class CostBenefitResponse(BaseModel):
    scenarios: List[ScenarioModel]
    projections_10_year: List[YearlyProjectionItem]
    environmental_impact: EnvironmentalImpactSummary


def calculate_npv(rate: float, initial_capex: float, annual_cf: float, years: int = 10) -> float:
    cash_flows = [-initial_capex] + [annual_cf] * years
    npv = sum([cf / ((1 + rate) ** t) for t, cf in enumerate(cash_flows)])
    return round(npv, 2)


def calculate_approx_irr(initial_capex: float, annual_cf: float, years: int = 10) -> float:
    # Newton approximation for IRR
    low, high = 0.01, 1.0
    for _ in range(50):
        mid = (low + high) / 2.0
        npv_val = sum([-initial_capex] + [annual_cf / ((1 + mid) ** t) for t in range(1, years + 1)])
        if npv_val > 0:
            low = mid
        else:
            high = mid
    return round(low * 100, 1)


@router.get("", response_model=CostBenefitResponse)
def get_cost_benefit_analysis():
    discount_rate = 0.08  # 8% standard municipal hurdle rate

    # 3 Scenarios
    scenario_configs = [
        {
            "name": "Conservative",
            "capex": 110.0,
            "rev": 24.5,
            "co2_yr": 48000,
            "jobs": 380,
            "mwh_yr": 54000.0
        },
        {
            "name": "Moderate",
            "capex": 195.0,
            "rev": 48.0,
            "co2_yr": 92000,
            "jobs": 720,
            "mwh_yr": 112000.0
        },
        {
            "name": "Aggressive",
            "capex": 310.0,
            "rev": 82.5,
            "co2_yr": 155000,
            "jobs": 1250,
            "mwh_yr": 198000.0
        }
    ]

    scenarios = []
    for cfg in scenario_configs:
        capex = cfg["capex"]
        rev = cfg["rev"]
        # Operating expenditure approx 18% of revenue
        net_annual = rev * 0.82
        payback = round(capex / net_annual, 1)
        npv = calculate_npv(discount_rate, capex, net_annual, years=10)
        irr = calculate_approx_irr(capex, net_annual, years=10)

        scenarios.append(
            ScenarioModel(
                scenario_name=cfg["name"],
                investment_crores=capex,
                annual_revenue_crores=rev,
                payback_years=payback,
                npv_crores=npv,
                irr_pct=irr,
                co2_reduction_tonnes_per_year=cfg["co2_yr"],
                jobs_created=cfg["jobs"],
                clean_mwh_generated_per_year=cfg["mwh_yr"]
            )
        )

    # 10-Year Projections (assuming tariff escalation ~3% per year and ramp-up)
    projections = []
    cum_co2 = 0
    for yr in range(1, 11):
        escalation = (1.03) ** (yr - 1)
        # Year 1 ramp-up factor 0.8, full capacity thereafter
        ramp = 0.80 if yr == 1 else 1.0

        c_rev = round(scenario_configs[0]["rev"] * escalation * ramp, 2)
        m_rev = round(scenario_configs[1]["rev"] * escalation * ramp, 2)
        a_rev = round(scenario_configs[2]["rev"] * escalation * ramp, 2)

        c_cf = round(c_rev * 0.82, 2)
        m_cf = round(m_rev * 0.82, 2)
        a_cf = round(a_rev * 0.82, 2)

        cum_co2 += int(scenario_configs[1]["co2_yr"] * ramp)

        projections.append(
            YearlyProjectionItem(
                year=yr,
                conservative_revenue_crores=c_rev,
                moderate_revenue_crores=m_rev,
                aggressive_revenue_crores=a_rev,
                conservative_net_cashflow_crores=c_cf,
                moderate_net_cashflow_crores=m_cf,
                aggressive_net_cashflow_crores=a_cf,
                cumulative_co2_saved_tonnes=cum_co2
            )
        )

    # Environmental Impact Summary (based on Moderate Scenario)
    mod_co2_10yr = sum(p.cumulative_co2_saved_tonnes for p in projections[-1:])
    env_summary = EnvironmentalImpactSummary(
        total_landfill_diversion_tonnes_10yr=2850000,
        total_co2_offset_tonnes_10yr=cum_co2,
        fossil_fuel_replaced_barrels=int(cum_co2 * 2.3),
        equivalent_trees_planted=int(cum_co2 * 16.5),
        methane_emissions_abated_tonnes=int(cum_co2 * 0.28)
    )

    return CostBenefitResponse(
        scenarios=scenarios,
        projections_10_year=projections,
        environmental_impact=env_summary
    )
