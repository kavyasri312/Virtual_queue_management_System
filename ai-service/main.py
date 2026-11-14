"""
FastAPI service providing AI predictions for queue waiting time and crowd insights.
This is a scaffold with placeholder logic; later we will add model training.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import datetime
import random

app = FastAPI(title="Smart Queue AI Service")

class WaitPredictionRequest(BaseModel):
    department_id: int
    booking_time: datetime.datetime
    day_of_week: int  # 0=Monday ... 6=Sunday
    people_ahead: int
    active_counters: int
    priority: str  # e.g., "NORMAL", "HIGH"
    historical_avg_duration: float  # minutes

class WaitPredictionResponse(BaseModel):
    estimated_wait_minutes: float
    source: str  # "AI" or "BASELINE"

@app.post("/predict-wait", response_model=WaitPredictionResponse)
def predict_wait(req: WaitPredictionRequest):
    # Placeholder: if model not trained, return baseline estimate
    # Here we simulate a simple rule: baseline = people_ahead * historical_avg_duration / active_counters
    baseline = (
        req.people_ahead * req.historical_avg_duration / max(req.active_counters, 1)
    )
    # Simulate AI availability flag
    ai_available = False  # Change to True once a real model is loaded
    if not ai_available:
        return WaitPredictionResponse(estimated_wait_minutes=baseline, source="BASELINE")
    # If AI were available, we would use a trained model; for now return random variation
    ai_estimate = baseline * random.uniform(0.8, 1.2)
    return WaitPredictionResponse(estimated_wait_minutes=ai_estimate, source="AI")

class CrowdStatsResponse(BaseModel):
    department_id: int
    hour: int  # 0-23
    expected_tokens: int

@app.get("/crowd-stats", response_model=List[CrowdStatsResponse])
def crowd_stats():
    # Placeholder: generate random predictions for each department and hour
    # In a real implementation we would query historical data and run a forecasting model.
    dummy = []
    for dept_id in range(1, 10):  # assuming up to 9 departments
        for hour in range(0, 24):
            dummy.append(CrowdStatsResponse(department_id=dept_id, hour=hour, expected_tokens=random.randint(0, 50)))
    return dummy

# Endpoint to trigger retraining (placeholder)
@app.post("/retrain")
def retrain():
    # In a real service we would reload data and fit the RandomForest model.
    return {"status": "retraining started (placeholder)"}
