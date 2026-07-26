import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { load } from '@loaders.gl/core';
import { LASLoader } from '@loaders.gl/las';
import { Loader2 } from 'lucide-react';

interface PointCloudViewerProps {
  url: string;
}

export const PointCloudViewer: React.FC<PointCloudViewerProps> = ({ url }) => {
  const [points, setPoints] = useState<THREE.Points | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        // Load LAS data
        const data: any = await load(url, LASLoader);
        
        if (!active) return;
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(data.attributes.POSITION.value);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Use colors if available
        if (data.attributes.COLOR_0) {
            const colors = new Float32Array(data.attributes.COLOR_0.value);
            // Convert to 0-1 float for WebGL if they are 16-bit
            for (let i = 0; i < colors.length; i++) {
                colors[i] = colors[i] / 65535.0;
            }
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        }
        
        // Center the geometry so it orbits nicely
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox?.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);
        
        // We might want to auto-scale it so it fits the view
        const size = new THREE.Vector3();
        geometry.boundingBox?.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxDim;
        geometry.scale(scale, scale, scale);
        
        // Create Material
        const material = new THREE.PointsMaterial({
          size: 0.05,
          vertexColors: !!data.attributes.COLOR_0,
          color: data.attributes.COLOR_0 ? 0xffffff : 0x818cf8, // Indigo 400
        });
        
        const pts = new THREE.Points(geometry, material);
        
        // Optional rotation to fix up axis (LAS is usually Z-up, Three is Y-up)
        pts.rotation.x = -Math.PI / 2;
        
        setPoints(pts);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to load point cloud", err);
        if (active) {
            setError(err.message || "Failed to load point cloud");
            setLoading(false);
        }
      }
    }
    
    loadData();
    return () => { active = false; };
  }, [url]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/20 text-indigo-300 rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm">Downloading & Parsing 3D Data...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/20 text-rose-400 rounded-2xl p-4 text-center">
            <p className="font-semibold mb-2">Error Loading Viewer</p>
            <p className="text-sm opacity-70">{error}</p>
        </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] rounded-2xl overflow-hidden relative shadow-inner border border-white/5">
        <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            {points && <primitive object={points} />}
            <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
        </Canvas>
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/10 pointer-events-none">
            Left Click: Rotate • Right Click: Pan • Scroll: Zoom
        </div>
    </div>
  );
};
