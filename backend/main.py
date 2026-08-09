from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routers import lidar, groups, markets, trades, admin, users
import asyncio
from services.scraper import start_scraper_daemon
from contextlib import asynccontextmanager

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the background AI scraper daemon
    task = asyncio.create_task(start_scraper_daemon(interval_seconds=3600))
    yield
    task.cancel()

app = FastAPI(title="Prediction App API", lifespan=lifespan)

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
app.include_router(admin.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Prediction App API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
