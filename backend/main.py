from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routers import lidar, groups, markets, trades

load_dotenv()

app = FastAPI(title="Prediction App API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lidar.router, prefix="/api/lidar", tags=["lidar"])
app.include_router(groups.router)
app.include_router(markets.router)
app.include_router(trades.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Prediction App API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
