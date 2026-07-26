from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Form
from fastapi.responses import FileResponse, JSONResponse
import shutil
import uuid
import os
from pathlib import Path
from services.lidar_service import LidarService, UPLOAD_DIR, PROCESSED_DIR

router = APIRouter()

# Simple in-memory job tracker (in production, use Supabase/Postgres)
jobs = {}

@router.post("/upload")
async def upload_lidar(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    voxel_size: float = Form(0.5),
    nb_neighbors: int = Form(20),
    std_ratio: float = Form(2.0)
):
    job_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    saved_filename = f"{job_id}{file_ext}"
    saved_path = UPLOAD_DIR / saved_filename
    
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    jobs[job_id] = {"status": "Processing", "filename": file.filename, "result_file": None}
    
    background_tasks.add_task(process_job, job_id, saved_path, voxel_size, nb_neighbors, std_ratio)
    
    return {"job_id": job_id, "status": "Processing"}

def process_job(job_id: str, file_path: Path, voxel_size: float, nb_neighbors: int, std_ratio: float):
    try:
        output_path = LidarService.process_lidar_file(
            file_path, voxel_size=voxel_size, nb_neighbors=nb_neighbors, std_ratio=std_ratio
        )
        jobs[job_id]["status"] = "Completed"
        jobs[job_id]["result_file"] = str(output_path.name)
    except Exception as e:
        jobs[job_id]["status"] = "Failed"
        jobs[job_id]["error"] = str(e)
        print(f"Error processing job {job_id}: {e}")

@router.get("/jobs")
async def get_all_jobs():
    return jobs

@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in jobs:
        return JSONResponse(status_code=404, content={"message": "Job not found"})
    return jobs[job_id]

@router.get("/download/{file_name}")
async def download_file(file_name: str):
    file_path = PROCESSED_DIR / file_name
    if not file_path.exists():
        return JSONResponse(status_code=404, content={"message": "File not found"})
    return FileResponse(file_path, filename=f"processed_{file_name}")
