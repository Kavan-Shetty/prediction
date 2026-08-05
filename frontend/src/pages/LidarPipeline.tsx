import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileDown, Loader2, Server, CheckCircle, AlertCircle, Settings, Layers, Box } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PointCloudViewer } from '../components/PointCloudViewer';
import { BASE_URL } from '../lib/api';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LidarPipelineProps {}

export const LidarPipeline: React.FC<LidarPipelineProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [voxelSize, setVoxelSize] = useState<number>(0.5);
  const [nbNeighbors, setNbNeighbors] = useState<number>(20);
  const [stdRatio, setStdRatio] = useState<number>(2.0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'Idle' | 'Processing' | 'Completed' | 'Failed'>('Idle');
  const [isDragging, setIsDragging] = useState(false);
  const [downloadFile, setDownloadFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startProcessing = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('voxel_size', voxelSize.toString());
    formData.append('nb_neighbors', nbNeighbors.toString());
    formData.append('std_ratio', stdRatio.toString());

    setJobStatus('Processing');
    try {
      const response = await fetch(`${BASE_URL}/lidar/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setJobId(data.job_id);
    } catch (error) {
      console.error(error);
      setJobStatus('Failed');
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (jobId && jobStatus === 'Processing') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${BASE_URL}/lidar/jobs/${jobId}`);
          const data = await res.json();
          if (data.status === 'Completed') {
            setJobStatus('Completed');
            setDownloadFile(data.result_file);
            clearInterval(interval);
          } else if (data.status === 'Failed') {
            setJobStatus('Failed');
            clearInterval(interval);
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-12 relative">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />

        <header className="space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 text-sm font-medium text-indigo-300">
            <Layers className="w-4 h-4" />
            <span>v1.0 SHIPPED</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/40">
            LiDAR Pipeline
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            A premium pipeline for cleaning, filtering, and structuring raw LiDAR point clouds into a usable format for downstream spatial analysis.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Upload & Params */}
          <div className="lg:col-span-2 space-y-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative h-72 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm",
                isDragging
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]",
                file && !isDragging && "border-indigo-500/50 bg-indigo-500/5"
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".las,.laz,.pcd"
                className="hidden"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/[0.02] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center space-y-4">
                <div className={cn(
                  "p-4 rounded-2xl transition-colors duration-300",
                  file ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white/70"
                )}>
                  {file ? <CheckCircle className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-medium text-white/90">
                    {file ? file.name : "Drag & drop your LiDAR file"}
                  </p>
                  <p className="text-sm text-white/40">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Supports .LAS, .LAZ"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Settings className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold">Processing Parameters</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex justify-between text-sm font-medium text-white/70">
                    <span>Voxel Size (Downsampling)</span>
                    <span className="text-indigo-400">{voxelSize}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={voxelSize}
                    onChange={(e) => setVoxelSize(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <p className="text-xs text-white/40">Higher values = more compression.</p>
                </div>

                <div className="space-y-4">
                  <label className="flex justify-between text-sm font-medium text-white/70">
                    <span>Noise Neighbors (SOR)</span>
                    <span className="text-indigo-400">{nbNeighbors}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={nbNeighbors}
                    onChange={(e) => setNbNeighbors(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <p className="text-xs text-white/40">Points to analyze for noise removal.</p>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="flex justify-between text-sm font-medium text-white/70">
                    <span>Std Dev Ratio (SOR)</span>
                    <span className="text-indigo-400">{stdRatio}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={stdRatio}
                    onChange={(e) => setStdRatio(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <p className="text-xs text-white/40">Lower ratio removes more noise.</p>
                </div>
              </div>

              <button
                onClick={startProcessing}
                disabled={!file || jobStatus === 'Processing'}
                className="w-full py-4 mt-4 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
              >
                {jobStatus === 'Processing' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </span>
                ) : (
                  "Start Processing Pipeline"
                )}
              </button>
            </div>
          </div>

          {/* Job Tracker */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm h-full flex flex-col">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Server className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold">Job Status</h2>
              </div>
              
              {jobId ? (
                <div className="flex-1 flex flex-col space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Job ID</p>
                    <p className="font-mono text-sm truncate text-white/70">{jobId}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                    {jobStatus === 'Processing' && <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />}
                    {jobStatus === 'Completed' && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                    {jobStatus === 'Failed' && <AlertCircle className="w-6 h-6 text-rose-400" />}
                    
                    <div className="flex-1">
                      <p className="font-medium">{jobStatus}</p>
                      <p className="text-sm text-white/40">
                        {jobStatus === 'Processing' && 'Structuring & cleaning data...'}
                        {jobStatus === 'Completed' && 'Ready for download'}
                        {jobStatus === 'Failed' && 'An error occurred'}
                      </p>
                    </div>
                  </div>

                  {jobStatus === 'Completed' && downloadFile && (
                    <div className="flex-1 flex flex-col min-h-0 space-y-4">
                        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 min-h-[300px]">
                            <PointCloudViewer url={`${BASE_URL}/lidar/download/${downloadFile}`} />
                        </div>
                        <a
                          href={`${BASE_URL}/lidar/download/${downloadFile}`}
                          className="w-full py-3 rounded-xl font-medium text-center border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group shrink-0"
                        >
                          <FileDown className="w-5 h-5 text-white/70 group-hover:text-white" />
                          Download Processed File
                        </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <Server className="w-12 h-12 text-white/20" />
                  <p className="text-sm max-w-[200px]">No active jobs. Upload a file to start the pipeline.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
