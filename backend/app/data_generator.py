import numpy as np
import pandas as pd
from typing import Dict, Any


ZONE_METADATA = [
    {
        "zone": "North Delhi",
        "population": 3600000,
        "area_sqkm": 287.0,
        "lat": 28.7041,
        "lng": 77.1025,
        "base_waste_scale": 1.15,
        "existing_plants": 1,
        "landfill_capacity_remaining_pct": 28.4
    },
    {
        "zone": "South Delhi",
        "population": 4800000,
        "area_sqkm": 250.0,
        "lat": 28.5355,
        "lng": 77.2410,
        "base_waste_scale": 1.45,
        "existing_plants": 2,
        "landfill_capacity_remaining_pct": 18.2
    },
    {
        "zone": "East Delhi",
        "population": 3900000,
        "area_sqkm": 166.0,
        "lat": 28.6280,
        "lng": 77.2950,
        "base_waste_scale": 1.25,
        "existing_plants": 1,
        "landfill_capacity_remaining_pct": 12.5
    },
    {
        "zone": "West Delhi",
        "population": 3700000,
        "area_sqkm": 218.0,
        "lat": 28.6692,
        "lng": 77.0688,
        "base_waste_scale": 1.10,
        "existing_plants": 1,
        "landfill_capacity_remaining_pct": 32.0
    },
    {
        "zone": "Central Delhi",
        "population": 1500000,
        "area_sqkm": 85.0,
        "lat": 28.6448,
        "lng": 77.2167,
        "base_waste_scale": 0.65,
        "existing_plants": 0,
        "landfill_capacity_remaining_pct": 45.0
    },
    {
        "zone": "Noida",
        "population": 2500000,
        "area_sqkm": 203.0,
        "lat": 28.5700,
        "lng": 77.3200,
        "base_waste_scale": 0.95,
        "existing_plants": 1,
        "landfill_capacity_remaining_pct": 38.5
    }
]

# Typical Delhi monthly temperatures in Celsius (Jan to Dec)
MONTHLY_DELHI_TEMP = {
    1: 14.5,
    2: 18.0,
    3: 24.5,
    4: 31.0,
    5: 35.5,
    6: 36.8,
    7: 32.5,
    8: 31.0,
    9: 29.8,
    10: 26.0,
    11: 20.5,
    12: 15.2
}


class DataStore:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataStore, cls).__new__(cls)
            cls._instance.is_initialized = False
        return cls._instance

    def __init__(self):
        if not self.is_initialized:
            self.waste_data: pd.DataFrame = pd.DataFrame()
            self.energy_data: pd.DataFrame = pd.DataFrame()
            self.zone_info: pd.DataFrame = pd.DataFrame()
            self.initialize_data()
            self.is_initialized = True

    def initialize_data(self):
        """Generate realistic synthetic waste and energy datasets for Delhi NCR."""
        np.random.seed(42)

        # Dates from Jan 2022 to Sep 2026 (inclusive)
        date_range = pd.date_range(start="2022-01-01", end="2026-09-30", freq="MS")

        # 1. Zone Info
        zone_info_rows = []
        for z in ZONE_METADATA:
            zone_info_rows.append({
                "zone": z["zone"],
                "population": z["population"],
                "area_sqkm": z["area_sqkm"],
                "lat": z["lat"],
                "lng": z["lng"],
                "existing_plants": z["existing_plants"],
                "landfill_capacity_remaining_pct": z["landfill_capacity_remaining_pct"]
            })
        self.zone_info = pd.DataFrame(zone_info_rows)

        # 2. Waste and Energy generation
        waste_rows = []
        energy_rows = []

        # Baseline monthly tonnes benchmark per zone scaling
        # In Delhi NCR, total waste ~11,000 TPD => ~330,000 tonnes/month across NCR
        city_monthly_base = 45000.0  # Base waste per zone tier

        for date_val in date_range:
            year = date_val.year
            month = date_val.month
            date_str = date_val.strftime("%Y-%m-%d")
            month_str = date_val.strftime("%Y-%m")

            # Year-over-year compounding growth ~6.2%
            yoy_factor = (1.0 + 0.062) ** (year - 2022 + (month - 1) / 12.0)

            # Seasonal factors
            # Organic peaks in summer (May-Aug) due to spoilage
            if month in [5, 6, 7, 8]:
                organic_season = 1.28 + 0.05 * np.sin((month - 5) * np.pi / 3.0)
            else:
                organic_season = 0.94

            # Recyclables spike Oct-Dec (festive Diwali/New Year packaging)
            if month in [10, 11, 12]:
                recyclable_season = 1.32
            else:
                recyclable_season = 0.95

            # E-waste spikes in January (post-holiday new devices & e-waste disposal)
            if month == 1:
                ewaste_season = 1.48
            elif month in [11, 12]:
                ewaste_season = 1.15
            else:
                ewaste_season = 0.90

            # Base Delhi temperature + minor inter-year fluctuation
            base_temp = MONTHLY_DELHI_TEMP[month]
            temp_c = round(base_temp + float(np.random.normal(0, 0.6)), 1)

            for z in ZONE_METADATA:
                zone_name = z["zone"]
                scale = z["base_waste_scale"]

                # Zone specific nuances (e.g. East Delhi has high organic wet waste from mandis)
                organic_boost = 1.08 if zone_name == "East Delhi" else (1.04 if zone_name == "West Delhi" else 1.0)
                recyclable_boost = 1.12 if zone_name in ["South Delhi", "Noida"] else 0.98

                # Random noise per stream
                noise_org = np.random.normal(1.0, 0.03)
                noise_rec = np.random.normal(1.0, 0.035)
                noise_ewaste = np.random.normal(1.0, 0.04)
                noise_haz = np.random.normal(1.0, 0.03)

                base_zone_tonnes = city_monthly_base * scale * yoy_factor

                # Components distribution: ~52% Organic, ~30% Recyclable, ~11% E-Waste, ~7% Hazardous
                organic_tonnes = round(base_zone_tonnes * 0.52 * organic_season * organic_boost * noise_org, 2)
                recyclable_tonnes = round(base_zone_tonnes * 0.30 * recyclable_season * recyclable_boost * noise_rec, 2)
                ewaste_tonnes = round(base_zone_tonnes * 0.11 * ewaste_season * noise_ewaste, 2)
                hazardous_tonnes = round(base_zone_tonnes * 0.07 * noise_haz, 2)

                total_tonnes = round(organic_tonnes + recyclable_tonnes + ewaste_tonnes + hazardous_tonnes, 2)

                waste_rows.append({
                    "date": date_str,
                    "month": month_str,
                    "year": year,
                    "month_num": month,
                    "zone": zone_name,
                    "organic_tonnes": organic_tonnes,
                    "recyclable_tonnes": recyclable_tonnes,
                    "ewaste_tonnes": ewaste_tonnes,
                    "hazardous_tonnes": hazardous_tonnes,
                    "total_tonnes": total_tonnes
                })

                # Energy consumption strongly correlates with city activity & seasonal cooling (temp)
                # Air conditioning causes huge Delhi power spikes in May-July
                ac_power_factor = 1.0 + max(0.0, (temp_c - 22.0) * 0.025)
                # Energy demand in MWh: Waste activity + cooling load
                base_energy = (total_tonnes * 0.38) * ac_power_factor * np.random.normal(1.0, 0.02)
                demand_mwh = round(base_energy, 2)

                # Waste-derived energy (biogas/refuse-derived fuel) potential
                waste_derived_mwh = round((organic_tonnes * 0.18 + recyclable_tonnes * 0.06) * (0.85 if z["existing_plants"] > 0 else 0.45), 2)

                # Solar MWh (high in summer months Mar-Jun, lower in foggy Dec-Jan & monsoon Jul-Aug)
                solar_efficiency = 1.35 if month in [3, 4, 5] else (0.75 if month in [12, 1] else 1.0)
                solar_mwh = round(scale * 2200.0 * solar_efficiency * np.random.normal(1.0, 0.03), 2)

                grid_mwh = round(max(0.0, demand_mwh - waste_derived_mwh - solar_mwh), 2)

                energy_rows.append({
                    "date": date_str,
                    "month": month_str,
                    "year": year,
                    "month_num": month,
                    "zone": zone_name,
                    "demand_mwh": demand_mwh,
                    "waste_derived_mwh": waste_derived_mwh,
                    "solar_mwh": solar_mwh,
                    "grid_mwh": grid_mwh,
                    "temperature_c": temp_c
                })

        self.waste_data = pd.DataFrame(waste_rows)
        self.energy_data = pd.DataFrame(energy_rows)

    def get_zone_list(self):
        return self.zone_info["zone"].tolist()

    def get_summary_metrics(self) -> Dict[str, Any]:
        tot_waste = float(self.waste_data["total_tonnes"].sum())
        tot_energy = float(self.energy_data["demand_mwh"].sum())
        return {
            "total_waste_tonnes": round(tot_waste, 2),
            "total_energy_mwh": round(tot_energy, 2),
            "active_zones": len(self.zone_info),
        }


# Singleton instance
data_store = DataStore()
