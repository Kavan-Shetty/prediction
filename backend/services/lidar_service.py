import os
import uuid
import laspy
import numpy as np
from pathlib import Path
from scipy.spatial import cKDTree

UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

class LidarService:
    @staticmethod
    def voxel_downsample(points, voxel_size):
        # Calculate voxel indices for each point
        voxel_coords = np.floor(points / voxel_size).astype(np.int32)
        
        # Get unique voxel indices and the first point in each voxel
        _, unique_indices = np.unique(voxel_coords, axis=0, return_index=True)
        return unique_indices

    @staticmethod
    def statistical_outlier_removal(points, nb_neighbors=20, std_ratio=2.0):
        # Build KDTree
        tree = cKDTree(points)
        
        # Get distances to nb_neighbors (k=nb_neighbors+1 because the point itself is included, dist=0)
        distances, _ = tree.query(points, k=nb_neighbors + 1)
        
        # Calculate mean distance for each point (excluding the distance to itself)
        mean_distances = np.mean(distances[:, 1:], axis=1)
        
        # Calculate global mean and standard deviation of these mean distances
        global_mean = np.mean(mean_distances)
        global_std = np.std(mean_distances)
        
        # Threshold: keep points where local mean distance < global_mean + std_ratio * global_std
        threshold = global_mean + std_ratio * global_std
        
        # Return indices of points to keep
        return np.where(mean_distances < threshold)[0]

    @staticmethod
    def process_lidar_file(file_path: Path, voxel_size: float = 0.5, nb_neighbors: int = 20, std_ratio: float = 2.0) -> Path:
        """
        Processes a LiDAR file (cleaning and downsampling) using laspy and numpy.
        Returns the path to the processed .las file.
        """
        print(f"Processing {file_path}")
        
        # Read the point cloud using laspy
        try:
            las = laspy.read(file_path)
            # Use scaled values to get actual coordinates instead of raw integers
            # las.x, las.y, las.z are properly scaled automatically by laspy
            points = np.vstack((las.x, las.y, las.z)).transpose()
        except Exception as e:
            raise ValueError(f"Failed to read file with laspy. Make sure it's a valid LAS/LAZ file. Error: {e}")
            
        print(f"Original point cloud has {len(points)} points.")
        
        # 1. Cleaning: Statistical Outlier Removal (SOR)
        if nb_neighbors > 0:
            valid_indices = LidarService.statistical_outlier_removal(points, nb_neighbors=nb_neighbors, std_ratio=std_ratio)
            # Filter the points in the las object to keep all dimensions
            las.points = las.points[valid_indices]
            points = points[valid_indices]
            print(f"After cleaning: {len(points)} points.")
        
        # 2. Structuring: Voxel Grid Downsampling
        if voxel_size > 0:
            downsampled_indices = LidarService.voxel_downsample(points, voxel_size=voxel_size)
            las.points = las.points[downsampled_indices]
            points = points[downsampled_indices]
            print(f"After downsampling: {len(points)} points.")
        
        # Save output
        output_filename = f"processed_{uuid.uuid4()}.las"
        output_path = PROCESSED_DIR / output_filename
        
        las.header.point_count = len(las.points)
        las.write(str(output_path))
            
        return output_path
