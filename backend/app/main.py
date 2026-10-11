from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.data_generator import data_store
from app.ml_engine import ml_engine

from app.routes.dashboard import router as dashboard_router
from app.routes.waste import router as waste_router
from app.routes.energy import router as energy_router
from app.routes.plants import router as plants_router
from app.routes.cost_benefit import router as cost_benefit_router
from app.routes.ai_insights import router as ai_insights_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure synthetic data is populated and models are trained
    if not data_store.is_initialized:
        data_store.initialize_data()
    if not ml_engine.is_trained:
        ml_engine.train_models()
    yield
    # Shutdown logic if any


app = FastAPI(
    title="GarbageGPT API",
    description="Waste-to-Energy Intelligence Platform for Indian Cities (Delhi NCR)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - allow all origins for hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all route modules
app.include_router(dashboard_router)
app.include_router(waste_router)
app.include_router(energy_router)
app.include_router(plants_router)
app.include_router(cost_benefit_router)
app.include_router(ai_insights_router)


@app.get("/")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "GarbageGPT API",
        "version": "1.0.0",
        "platform": "Waste-to-Energy Intelligence Platform",
        "zones_tracked": len(data_store.zone_info),
        "data_records": len(data_store.waste_data)
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
