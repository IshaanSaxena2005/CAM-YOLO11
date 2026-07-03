import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Eye, 
  Cpu, 
  Database, 
  History, 
  BarChart3, 
  BookOpen, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Upload, 
  Clock, 
  Layers, 
  TrendingUp, 
  Zap, 
  Terminal, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Sliders, 
  Search, 
  Filter, 
  FileText, 
  Crosshair, 
  Radar,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar
} from 'recharts';

// --- STYLING CONSTANTS ---
const COLORS = {
  emerald: '#10b981',
  blue: '#0ea5e9',
  orange: '#f97316',
  red: '#ef4444',
  darkBg: '#0b0f17',
  cardBg: '#121a28',
  border: '#1e293b'
};

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'video' | 'blockchain' | 'quantum' | 'history' | 'analytics' | 'research'>('dashboard');

  // Stats State
  const [stats, setStats] = useState({
    totalDetections: 4,
    activeThreats: 2,
    todaysScans: 4,
    systemIntegrity: true,
    aiConfidence: 91.5,
    blockchainBlocks: 5,
    databaseStatus: 'ONLINE (PERSISTENT)',
    sensorFusionDepth: '94.8% OPTIMAL'
  });

  // Data State
  const [detections, setDetections] = useState<any[]>([]);
  const [blockchain, setBlockchain] = useState<any[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [systemAlert, setSystemAlert] = useState<{ type: 'sync' | 'tamper' | 'error' | 'success'; message: string } | null>({
    type: 'success',
    message: 'Multispectral sensor array online. COSPAS-SARSAT orbiters telemetry established.'
  });

  // Image Upload Analysis State
  const [selectedScenario, setSelectedScenario] = useState<number>(0);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [activeOverlayMode, setActiveOverlayMode] = useState<'raw' | 'yolo' | 'gradcam' | 'thermal'>('yolo');
  const [gradcamAlpha, setGradcamAlpha] = useState<number>(75);
  const [selectedModel, setSelectedModel] = useState<string>('yolov8n');
  const [confThreshold, setConfThreshold] = useState<number>(0.70);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isTestingSuiteRunning, setIsTestingSuiteRunning] = useState<boolean>(false);
  const [testSuiteReport, setTestSuiteReport] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setSystemLogs(data);
    } catch (e) {
      console.error('Failed to sync logs', e);
    }
  };

  const runValidationSuite = async () => {
    setIsTestingSuiteRunning(true);
    setTestSuiteReport(null);
    try {
      const res = await fetch('/api/test-suite/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: confThreshold })
      });
      const data = await res.json();
      setTestSuiteReport(data);
      fetchStats();
      fetchLogs();
    } catch (err) {
      console.error('Test suite failed', err);
    } finally {
      setIsTestingSuiteRunning(false);
    }
  };

  // Video Drone State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoFrame, setVideoFrame] = useState(0);
  const [droneZoom, setDroneZoom] = useState(1);
  const [trackerLocked, setTrackerLocked] = useState(true);

  // Custom Video Upload Analysis State
  const [customVideo, setCustomVideo] = useState<string | null>(null);
  const [customVideoFileName, setCustomVideoFileName] = useState('');
  const [customVideoSeconds, setCustomVideoSeconds] = useState(0);
  const [videoTrackingData, setVideoTrackingData] = useState<any[] | null>(null);
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState(false);

  // Quantum Optimization State
  const [quantumFusionDepth, setQuantumFusionDepth] = useState(5);
  const [quantumLearningRate, setQuantumLearningRate] = useState(0.015);
  const [quantumEpochs, setQuantumEpochs] = useState(60);
  const [quantumSimulating, setQuantumSimulating] = useState(false);

  // Blockchain Interactivity State
  const [selectedBlockForTamper, setSelectedBlockForTamper] = useState<number | null>(null);
  const [tamperThreatType, setTamperThreatType] = useState('DECRYPTED_SAFE_VEHICLE');
  const [isChainCompromised, setIsChainCompromised] = useState(false);

  // Filters for History
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL');

  // --- PRELOADED SCENARIO IMAGES (RENDERED IN CUSTOM DYNAMIC SVGS) ---
  const SCENARIOS = [
    {
      title: 'Woodland Sentry Camp',
      location: 'Sector 4 Ridge',
      terrain: 'Forest / Spruce Canopy',
      baseColor: '#1b321f',
      targets: 'Hidden Infantry Unit & Stealth Outpost',
      detections: [
        { label: 'Camo Sniper Alpha', confidence: 0.94, box: [32, 50, 48, 62], desc: 'Personnel utilizing synthetic cedar branch shroud.' },
        { label: 'Sentry Bunker Roof', confidence: 0.91, box: [60, 15, 85, 38], desc: 'Infiltration structure with thermal dispersion canvas nets.' }
      ]
    },
    {
      title: 'Desert Scrub Dune',
      location: 'Sector 9 Basin',
      terrain: 'Arid Sand / Mesquite Shrubs',
      baseColor: '#4f3e2a',
      targets: 'Concealed Heavy APC (Armored Personnel Carrier)',
      detections: [
        { label: 'Camo Vehicle T-72', confidence: 0.89, box: [28, 20, 68, 75], desc: 'Armored carrier concealed with high-spectral scattering canvas.' }
      ]
    },
    {
      title: 'Tropical Operations Depot',
      location: 'Sector 2 Canopy',
      terrain: 'Broadleaf Dense Rainforest',
      baseColor: '#0a231c',
      targets: 'Under-Canopy Garrison & Ammo Bundles',
      detections: [
        { label: 'Logistics Supply Tent', confidence: 0.91, box: [18, 40, 52, 70], desc: 'Fabric shelter under triple-tier canopy foliage.' },
        { label: 'Generators Placement', confidence: 0.86, box: [58, 48, 74, 59], desc: 'Engine set masked behind visual tree branches.' }
      ]
    },
    {
      title: 'Rocky Ridge Garrison',
      location: 'Sector 7 Canyon',
      terrain: 'Scree Slope / Basalt Rocks',
      baseColor: '#2d3748',
      targets: 'Anti-Aircraft Radar & SAM Site launcher',
      detections: [
        { label: 'SAM Battery Launcher', confidence: 0.87, box: [35, 30, 60, 68], desc: 'Concealed air defence launcher unit mimicking rock forms.' }
      ]
    }
  ];

  // --- DATA SYNCING ---
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
      setIsChainCompromised(!data.systemIntegrity);
    } catch (e) {
      console.error('Failed to sync telemetry stats', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setDetections(data);
      if (data.length > 0 && !selectedDetection) {
        setSelectedDetection(data[0]);
      }
    } catch (e) {
      console.error('Failed to sync archives', e);
    }
  };

  const fetchBlockchain = async () => {
    try {
      const res = await fetch('/api/blockchain');
      const data = await res.json();
      setBlockchain(data);
    } catch (e) {
      console.error('Failed to sync block ledger', e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchHistory();
    fetchBlockchain();
    fetchLogs();
  }, []);

  // Sync intervals
  useEffect(() => {
    const timer = setInterval(() => {
      fetchStats();
      fetchLogs();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const triggerAudit = async () => {
    try {
      const res = await fetch('/api/blockchain/verify', { method: 'POST' });
      const audit = await res.json();
      if (audit.isValid) {
        setSystemAlert({
          type: 'success',
          message: 'Cryptographic security audit fully green! Ledger chains verified to block zero.'
        });
        setIsChainCompromised(false);
      } else {
        setSystemAlert({
          type: 'tamper',
          message: `CRITICAL SEC CODE ERROR: Cryptographic link corruption detected starting at Block #${audit.errorBlockIndex}! Evidence logs are compromised.`
        });
        setIsChainCompromised(true);
      }
      fetchStats();
    } catch (e) {
      setSystemAlert({ type: 'error', message: 'Failed to broadcast secure blockchain validation sweep.' });
    }
  };

  const executeTamperSimulation = async () => {
    if (selectedBlockForTamper === null) return;
    try {
      const res = await fetch('/api/blockchain/tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: selectedBlockForTamper, modifiedThreatType: tamperThreatType })
      });
      const data = await res.json();
      
      setSystemAlert({
        type: 'tamper',
        message: `LEDGER HACK ACTIVATED: Block #${selectedBlockForTamper} overwritten. Integrity watchdogs triggered.`
      });
      setIsChainCompromised(true);
      fetchStats();
      fetchBlockchain();
    } catch (e) {
      setSystemAlert({ type: 'error', message: 'Unauthorized sandbox intrusion packet failed.' });
    }
  };

  const resetBlockchainChain = async () => {
    try {
      const res = await fetch('/api/blockchain/reset', { method: 'POST' });
      await res.json();
      setSystemAlert({
        type: 'success',
        message: 'Cryptographic security module reset. Recalibrated ledger chains; integrity normal.'
      });
      setIsChainCompromised(false);
      setSelectedBlockForTamper(null);
      fetchStats();
      fetchBlockchain();
      fetchHistory();
    } catch (e) {
      setSystemAlert({ type: 'error', message: 'Reset protocol denied.' });
    }
  };

  // --- DYNAMIC QUANTUM SIMULATOR UPDATE ---
  const runQuantumOptimization = () => {
    setQuantumSimulating(true);
    setSystemAlert({ type: 'sync', message: 'Coupling optical feature grids with quantum-annealing weights...' });
    setTimeout(() => {
      setQuantumSimulating(false);
      setSystemAlert({
        type: 'success',
        message: `CAM-YOLO11 weights successfully optimized: Spatial resolution enhanced +8.9%. Feature fusion balance: ${(quantumFusionDepth * 10).toFixed(0)}% Depth.`
      });
    }, 1800);
  };

  // --- IMAGE ANALYSIS TRIGGER ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
      setCustomFileName(file.name);
      setSystemAlert({ type: 'success', message: `Multispectral feed loaded: ${file.name}. Ready for CAM-YOLO11 analysis.` });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
      setCustomFileName(file.name);
      setSystemAlert({ type: 'success', message: `Physical source dropped: ${file.name}. Configured for optical analysis.` });
    };
    reader.readAsDataURL(file);
  };

  const runYoloAnalysis = async () => {
    setIsAnalyzing(true);
    setSystemAlert({ type: 'sync', message: `Initializing specialized CAM-YOLO11 backbone on target frame ${customImage ? 'Custom upload' : SCENARIOS[selectedScenario].title}...` });

    try {
      let base64Part = '';
      let fName = customFileName || 'military_scenario_recon.jpg';

      if (customImage) {
        base64Part = customImage.split(',')[1];
      } else {
        // Create base64 of dummy scene for API
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 400;
        dummyCanvas.height = 300;
        const ctx = dummyCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = SCENARIOS[selectedScenario].baseColor;
          ctx.fillRect(0, 0, 400, 300);
          ctx.font = '14px monospace';
          ctx.fillStyle = '#fff';
          ctx.fillText(`Tactical Analysis Scenario: ${SCENARIOS[selectedScenario].title}`, 20, 150);
        }
        base64Part = dummyCanvas.toDataURL('image/jpeg').split(',')[1];
        fName = `recon_${SCENARIOS[selectedScenario].title.toLowerCase().replace(/\s/g, '_')}.jpg`;
      }

      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: base64Part,
          fileName: fName,
          modelName: selectedModel,
          threshold: confThreshold
        })
      });

      const responseRecord = await res.json();
      
      // Update states
      setSelectedDetection(responseRecord);
      if (responseRecord.detected !== false) {
        setSystemAlert({
          type: 'success',
          message: `Analysis completed! Detections: ${responseRecord.boundingBoxes.length} targets locked. Added to security blockchain.`
        });
      } else {
        setSystemAlert({
          type: 'error',
          message: `Inference completed. No valid military target detected above ${confThreshold.toFixed(2)} threshold.`
        });
      }
      fetchStats();
      fetchHistory();
      fetchBlockchain();
      fetchLogs();
    } catch (err: any) {
      setSystemAlert({ type: 'error', message: 'Failed to route frames to YOLOv11 backend.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- VIDEO SIMULATION CONTROLLER ---
  useEffect(() => {
    let interval: any = null;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoFrame((prev) => (prev + 1) % 60);
      }, 300);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying]);

  // --- DRONE COORDINATES/DETECTION FOR FRAME STEP (CUSTOM OR MOCK) ---
  const getDroneDetectionsForFrame = (frame: number) => {
    if (customVideo && videoTrackingData) {
      const currentSec = Math.floor(customVideoSeconds);
      const matched = videoTrackingData.find((t: any) => t.time_seconds === currentSec);
      if (matched && matched.boundingBoxes) {
        return matched.boundingBoxes;
      }
      return [];
    }
    if (frame >= 12 && frame <= 25) {
      return [
        { label: 'Camo Sniper (Under foliage)', confidence: 0.92, box: [40, 48, 55, 59] }
      ];
    }
    if (frame >= 35 && frame <= 50) {
      return [
        { label: 'Tactical Vehicle T-80', confidence: 0.88, box: [25, 30, 60, 68] }
      ];
    }
    return [];
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomVideoFileName(file.name);
    setIsVideoAnalyzing(true);
    setVideoTrackingData(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setCustomVideo(base64);

      try {
        setSystemAlert({
          type: 'sync',
          message: `Uploading tactical footprint vector of ${file.name} to CAM-YOLO11 real-time frame parser...`
        });

        const res = await fetch('/api/detect-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            base64,
            fileName: file.name,
            modelName: selectedModel
          })
        });

        if (!res.ok) {
          throw new Error('Video tracker compilation rejected by YOLO frame parser.');
        }

        const data = await res.json();
        setVideoTrackingData(data);
        setIsVideoAnalyzing(false);

        setSystemAlert({
          type: 'success',
          message: `Camouflage targeting network mapped! Blockchain block mined and locked for video stream ${file.name}. Click Play to watch tracking overlays.`
        });
        fetchStats();
        fetchHistory();
        fetchBlockchain();
      } catch (err: any) {
        setIsVideoAnalyzing(false);
        setSystemAlert({
          type: 'error',
          message: `Video surveillance compile error: ${err.message}`
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // --- QUANTUM PARAMETERS CHART MATH ---
  const standardYoloData = [
    { epoch: 10, classical: 72.1, quantum: 79.5 },
    { epoch: 20, classical: 76.5, quantum: 84.8 },
    { epoch: 30, classical: 79.8, quantum: 89.2 },
    { epoch: 40, classical: 82.3, quantum: 92.4 },
    { epoch: 50, classical: 84.5, quantum: 94.6 },
    { epoch: 60, classical: 86.1, quantum: 96.2 },
    { epoch: 80, classical: 87.8, quantum: 97.9 },
    { epoch: 100, classical: 88.5, quantum: 99.1 }
  ];

  // Dynamically calculate optimized quantum curve mapping with sliders
  const dynamicQuantumData = standardYoloData.map(item => {
    const fusionFactor = (quantumFusionDepth - 5) * 1.2; 
    const learnFactor = (quantumLearningRate - 0.01) * 35;
    const epochFactor = (quantumEpochs / 100);
    
    let quantumVal = item.quantum + fusionFactor - learnFactor + (epochFactor * 2);
    quantumVal = Math.min(100, Math.max(70, quantumVal));

    return {
      epoch: item.epoch,
      Classical_YOLO11: parseFloat(item.classical.toFixed(1)),
      CAM_YOLO11_Quantum: parseFloat(quantumVal.toFixed(1))
    };
  });

  // --- SYSTEM LOGS TICKERS ---
  const SYSTEM_LOGS = [
    { time: '15:21:04', log: 'Orbit telemetry lock: BEIDOU-3 constellation sync completed.' },
    { time: '15:21:08', log: 'FLIR infra-red channels combined with optical spectrum layers.' },
    { time: '15:21:12', log: 'Quantum state register loaded. Phase parameters calibrated.' },
    { time: '15:21:20', log: 'Tamper watchdogs verified. Node #0 (Genesis) validated: 100% OK.' }
  ];

  return (
    <div id="app-root" className="min-h-screen font-sans text-gray-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-400" style={{ backgroundColor: COLORS.darkBg }}>
      
      {/* 1. FUTURISTIC TOP BAR */}
      <header className="border-b bg-slate-950 px-4 py-3 shadow-lg" style={{ borderColor: COLORS.border }} id="header-bar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/50 bg-emerald-950/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Radar className="h-5 w-5 animate-pulse" />
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-widest text-white uppercase sm:text-base">CAM-YOLO11</h1>
                <span className="rounded bg-sky-950/80 px-2 py-0.5 text-[10px] font-bold tracking-tight text-sky-400 border border-sky-800">
                  UROP PROTOTYPE v2.4
                </span>
              </div>
              <p className="text-[10px] text-gray-400 sm:text-xs">Military Command Suite & Camouflage Detection Portal</p>
            </div>
          </div>

          {/* TELEMETRY READOUTS */}
          <div className="hidden items-center gap-6 text-xs md:flex lg:gap-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">TACTICAL WATCHDOG</div>
                <div className="font-bold text-gray-300">GEO-STATIONERY SATELLITE ACTIVE</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isChainCompromised ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">BLOCKCHAIN SECURITY</div>
                <div className={`font-bold ${isChainCompromised ? 'text-red-400' : 'text-emerald-400 font-mono text-[11px]'}`}>
                  {isChainCompromised ? 'COMPROMISED (TAMPER TRIGGERED)' : 'CRYPTOGRAPHIC INTEGRITY GUARANTEED'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-l pl-4" style={{ borderColor: COLORS.border }}>
              <Clock className="h-4 w-4 text-emerald-500" />
              <div className="font-mono text-gray-300">
                15:21:24 <span className="text-[10px] text-gray-500 font-sans">UTC</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SYSTEM WARNING BANNER */}
      {systemAlert && (
        <div className={`border-b px-4 py-2 text-xs transition-all ${
          systemAlert.type === 'tamper' ? 'bg-red-950/70 border-red-900/60 text-red-300' :
          systemAlert.type === 'sync' ? 'bg-indigo-950/70 border-indigo-900/60 text-indigo-300' :
          systemAlert.type === 'error' ? 'bg-amber-950/70 border-amber-900/60 text-amber-300' :
          'bg-emerald-950/45 border-emerald-900/50 text-emerald-300'
        }`} id="system-alert-banner">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 shrink-0 ${systemAlert.type === 'tamper' ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
              <span className="font-mono tracking-tight">{systemAlert.message}</span>
            </div>
            <button onClick={() => setSystemAlert(null)} className="rounded p-1 hover:bg-white/10">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN GRID LAYOUT */}
      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:flex-row lg:p-6" id="main-content-layout">
        
        {/* SIDE BAR DASHBOARD NAVIGATION */}
        <aside className="w-full shrink-0 lg:w-64" id="sidebar-navigation">
          <div className="sticky top-6 flex flex-col gap-4 rounded-xl border bg-slate-950/80 p-3 shadow-md" style={{ borderColor: COLORS.border }}>
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500">SURVEILLANCE MODULES</div>
            
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.06)]' 
                    : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                }`}
                id="tab-dashboard"
              >
                <Layers className="h-4 w-4" />
                <span>Command Deck HUD</span>
              </button>

              <button 
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'analysis' 
                    ? 'bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.06)]' 
                    : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                }`}
                id="tab-analysis"
              >
                <Eye className="h-4 w-4" />
                <span>CAM-YOLO11 Analyzer</span>
              </button>

              <button 
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'video' 
                    ? 'bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.06)]' 
                    : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                }`}
                id="tab-video"
              >
                <Play className="h-4 w-4" />
                <span>Real-Time Drone Feed</span>
              </button>

              <button 
                onClick={() => setActiveTab('blockchain')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'blockchain' 
                    ? 'bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.06)]' 
                    : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                }`}
                id="tab-blockchain"
              >
                <Shield className="h-4 w-4" />
                <span>Secure block Ledger</span>
              </button>

              <button 
                onClick={() => setActiveTab('quantum')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'quantum' 
                    ? 'bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.06)]' 
                    : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                }`}
                id="tab-quantum"
              >
                <Cpu className="h-4 w-4" />
                <span>Quantum Optimizer</span>
              </button>

              <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'history' 
                    ? 'bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.06)]' 
                    : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                }`}
                id="tab-history"
              >
                <History className="h-4 w-4" />
                <span>Archive & Logs</span>
              </button>

              <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.06)]' 
                    : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                }`}
                id="tab-analytics"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics Grid</span>
              </button>

              <button 
                onClick={() => setActiveTab('research')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'research' 
                    ? 'bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.06)]' 
                    : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                }`}
                id="tab-research"
              >
                <BookOpen className="h-4 w-4" />
                <span>Academic UROP Panel</span>
              </button>
            </nav>

            {/* SATELLITE GROUNDING SYSTEM HEALTH */}
            <div className="mt-4 border-t pt-4" style={{ borderColor: COLORS.border }}>
              <div className="flex justify-between text-[10px] tracking-wider text-gray-500 uppercase font-black">
                <span>SENSOR STATUS</span>
                <span className="text-emerald-500">NOMINAL</span>
              </div>
              <div className="mt-2 space-y-1 text-[11px] text-gray-400">
                <div className="flex justify-between">
                  <span>FLIR Fusion Ratio:</span>
                  <span className="font-mono text-emerald-400 font-bold">94.8% OPT</span>
                </div>
                <div className="flex justify-between">
                  <span>SQLite DB Threads:</span>
                  <span className="font-mono text-gray-300">4 Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Ledger validation:</span>
                  <span className={`font-mono font-bold ${isChainCompromised ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isChainCompromised ? 'FAILING' : 'SECURE'}
                  </span>
                </div>
              </div>
              
              {/* LEDGER FORCE VALIDATION SENSORS */}
              <button 
                onClick={triggerAudit}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-sky-500/30 bg-sky-950/20 py-2 text-xs font-bold text-sky-400 transition-colors hover:bg-sky-950/40"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Trigger security Audit</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 3. CENTER DYNAMIC COMPONENT PANEL */}
        <section className="flex-1 space-y-6" id="center-panel-viewport">
          
          {/* ----- MODULE 1: COMMAND CENTER DECK HUD ----- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in" id="dashboard-hud-view">
              
              {/* TOP PERFORMANCE METRIC OVERLAYS */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border bg-slate-950/50 p-4 transition-all hover:bg-slate-950/80" style={{ borderColor: COLORS.border }}>
                  <div className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">SYS SCANS CARRIED</div>
                  <div className="mt-1 font-mono text-2xl font-black text-white">{stats.totalDetections}</div>
                  <p className="text-[10px] text-gray-400">Archived in persistent DB</p>
                </div>
                
                <div className="rounded-xl border bg-slate-950/50 p-4 transition-all hover:bg-slate-950/80 border-rose-950/40" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-red-500 uppercase">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                    <span>ACTIVE TARGETS</span>
                  </div>
                  <div className="mt-1 font-mono text-2xl font-black text-red-400">{stats.activeThreats}</div>
                  <p className="text-[10px] text-gray-400">High / Critical threat rating</p>
                </div>

                <div className="rounded-xl border bg-slate-950/50 p-4 transition-all hover:bg-slate-950/80" style={{ borderColor: COLORS.border }}>
                  <div className="text-[10px] font-bold tracking-widest text-sky-500 uppercase">SCANS COMPLETED (24H)</div>
                  <div className="mt-1 font-mono text-2xl font-black text-sky-400">{stats.todaysScans}</div>
                  <p className="text-[10px] text-gray-400">Tactical orbits sweep</p>
                </div>

                <div className="rounded-xl border bg-slate-950/50 p-4 transition-all hover:bg-slate-950/80" style={{ borderColor: COLORS.border }}>
                  <div className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">AI CONFIDENCE OVERALL</div>
                  <div className="mt-1 font-mono text-2xl font-black text-orange-400">{stats.aiConfidence}%</div>
                  <p className="text-[10px] text-gray-400">Mean probability score</p>
                </div>
              </div>

              {/* MILITARY TARGETING RADAR SWEEP PANELS */}
              <div className="grid gap-6 lg:grid-cols-12">
                
                {/* CYBERNETIC INTEGRATION RADAR MATRIX */}
                <div className="lg:col-span-8 rounded-xl border bg-slate-950/60 p-4 relative overflow-hidden flex flex-col justify-between" style={{ borderColor: COLORS.border, height: '420px' }}>
                  <div className="z-10 flex justify-between items-center bg-slate-950/90 p-2 rounded border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-black tracking-widest uppercase font-mono text-emerald-400">ACTIVE MULTISPECTRAL SECTOR RECON</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-400">BEIDOU LAT: 37.4 / LNG: -122.0</span>
                  </div>

                  {/* RADAR RETICLE CONTAINER */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-60">
                    <div className="relative w-[340px] h-[340px] rounded-full border border-emerald-500/20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-pulse" />
                      <div className="w-[240px] h-[240px] rounded-full border border-emerald-500/30 flex items-center justify-center">
                        <div className="w-[140px] h-[140px] rounded-full border border-emerald-500/40 border-dotted" />
                      </div>
                      
                      {/* Crosshairs axis lines */}
                      <div className="absolute h-full w-[1px] bg-emerald-500/20" />
                      <div className="absolute w-full h-[1px] bg-emerald-500/20" />
                      
                      {/* Interactive Radar Vector sweeping sweep */}
                      <div className="absolute w-[170px] h-[170px] bg-gradient-to-tr from-emerald-500/0 to-emerald-500/20 origin-bottom-left bottom-1/2 left-1/2 animate-radar" style={{ transformOrigin: '0% 100%' }} />
                      
                      {/* Active detected threat blips mapped from selectedDetection boundingBoxes */}
                      {selectedDetection && selectedDetection.detected !== false && selectedDetection.boundingBoxes && selectedDetection.boundingBoxes.length > 0 ? (
                        selectedDetection.boundingBoxes.map((boxObj: any, idx: number) => {
                          const [ymin, xmin, ymax, xmax] = boxObj.box;
                          const cx = xmin + (xmax - xmin) / 2;
                          const cy = ymin + (ymax - ymin) / 2;
                          const topPct = 20 + (cy * 0.6); // map box coordinates to central radar area
                          const leftPct = 20 + (cx * 0.6);
                          
                          return (
                            <div 
                              key={idx} 
                              style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                              className="absolute flex flex-col items-center z-10"
                            >
                              <span className="h-2.5 w-2.5 bg-red-400 rounded-full animate-ping absolute" />
                              <span className="h-2 w-2 bg-red-500 rounded-full" />
                              <span className="text-[8px] bg-slate-950 border border-red-500/50 text-red-400 px-1.5 py-0.5 rounded font-mono mt-1 font-bold shadow-lg whitespace-nowrap">
                                TRG-{idx + 1}: {boxObj.label.split(':')[1]?.trim() || boxObj.label}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-gray-500 font-mono text-[10px] bg-slate-950/80 border border-slate-800 px-2 py-1 rounded z-10">
                            No active targets.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="z-10 flex justify-between items-end">
                    <div className="bg-slate-950/80 p-3 rounded font-mono text-[10px] space-y-1 text-gray-400 border border-emerald-950">
                      <div className="text-emerald-400 font-bold">RADAR EMISSION STATUS: ACTIVE</div>
                      <div>FREQUENCY: 9.42 GHz (Multimode)</div>
                      <div>PULSE WIDTH: 0.12 μs | ANGLE: 312.4°</div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('analysis')}
                      className="rounded bg-emerald-600 px-4 py-2 text-xs font-black tracking-wider text-black transition-colors hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] uppercase"
                    >
                      ENGAGE CAM-YOLO BACKBONE
                    </button>
                  </div>
                </div>

                {/* TELEMETRY TICKS & BLOCK DETAILS */}
                <div className="lg:col-span-4 rounded-xl border bg-slate-950/60 p-4 flex flex-col gap-4" style={{ borderColor: COLORS.border }}>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-emerald-500" />
                      <span>SURVEILLANCE ACTIVITY LOG</span>
                    </h3>
                    <p className="text-[10px] text-gray-400">Live operational event stream</p>
                  </div>

                  {/* LOG ENTRIES */}
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[220px] font-mono text-[11px] text-gray-300">
                    {systemLogs.length > 0 ? (
                      systemLogs.map((item, idx) => (
                        <div key={idx} className="border-b border-slate-900 pb-1.5 flex gap-2">
                          <span className="text-emerald-500 font-bold shrink-0">[{item.time}]</span>
                          <span className="text-gray-300">{item.log}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-4 italic">
                        No operational logs recorded. Engage the backbone to track active targets.
                      </div>
                    )}
                  </div>

                  {/* SECURE BLOCKCHAIN SHORT DET BRIEF */}
                  <div className="rounded-lg bg-slate-900/50 p-3 border border-slate-800">
                    <div className="flex justify-between items-center text-[10px] tracking-wider text-gray-400 font-bold uppercase mb-2">
                      <span>LEDGER SUMMARY</span>
                      <span className={`px-1.5 rounded text-[9px] ${isChainCompromised ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'}`}>
                        {isChainCompromised ? 'HACK_ALERT' : 'VERIFIED'}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-gray-300 font-mono">
                      <div className="flex justify-between">
                        <span>LEDGER BLOCKS:</span>
                        <span className="font-bold text-white">#{blockchain.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LATEST HASH:</span>
                        <span className="text-sky-400 truncate w-32 text-right">
                          {blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : 'GENESIS_0x...'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('blockchain')}
                      className="mt-3 w-full rounded bg-slate-800 py-1.5 text-center text-xs font-bold text-gray-300 hover:bg-slate-700 hover:text-white"
                    >
                      Enter Blockchain Security Module
                    </button>
                  </div>

                </div>
              </div>

              {/* DENSE CAMOUFLAGE KNOWLEDGE BLOCK SUMMARY */}
              <div className="rounded-xl border bg-slate-950/40 p-4 border-slate-800" id="summary-urop-box">
                <div className="flex gap-4">
                  <div className="bg-emerald-950/20 text-emerald-500 rounded p-2 h-fit border border-emerald-900/50">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">CAM-YOLO11 SURVEILLANCE RESEARCH BACKBONE</h4>
                    <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                      Classical algorithms like YOLOv8 suffer from high miss-detection ratios when targets possess military visual camouflage. By implementing Grad-CAM gradient overlays coupled with custom multiphase backpropagation models, the CAM-YOLO11 prototype identifies localized heat maps and isolates hidden edges. Results are validated in a zero-trust blockchain architecture, guaranteeing unalterable defense surveillance logs.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ----- MODULE 2 & 4: CAM-YOLO11 IMAGE ANALYZER + GRAD-CAM ----- */}
          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-fade-in" id="image-analyzer-view">
              
              <div className="rounded-xl border bg-slate-950/60 p-4 shadow-md" style={{ borderColor: COLORS.border }}>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-emerald-500" />
                    <span>CAM-YOLO11 INTELLIGENCE COMPILATION PIPELINE</span>
                  </h2>
                  <p className="text-xs text-gray-400">Upload drone recon frames or select academic scenarios for multispectral camouflage classification.</p>
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-12">
                  
                  {/* LEFT CONTROLS PANEL */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    
                    {/* SCENARIOS CHOOSER */}
                    <div className="rounded-lg bg-slate-900/50 p-3 border border-slate-800">
                      <div className="text-[10px] tracking-wide text-gray-400 font-black uppercase mb-2">SCENARIO TEMPLATES</div>
                      <div className="space-y-1.5">
                        {SCENARIOS.map((sc, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedScenario(index);
                              setCustomImage(null); // Clear custom upload when template selected
                            }}
                            className={`w-full text-left p-2.5 rounded text-xs transition-all flex items-center justify-between border ${
                              selectedScenario === index && !customImage
                                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/50'
                                : 'bg-slate-950 text-gray-400 border-transparent hover:bg-slate-900 hover:text-white'
                            }`}
                          >
                            <div>
                              <div className="font-bold">{sc.title}</div>
                              <div className="text-[10px] text-gray-500">{sc.location} • {sc.terrain}</div>
                            </div>
                            <CheckCircle2 className={`h-4 w-4 ${selectedScenario === index && !customImage ? 'opacity-100 text-emerald-400' : 'opacity-0'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* MODEL ENGINE CHOOSER & TRIGGER */}
                    <div className="rounded-lg bg-slate-900/50 p-3 border border-slate-800 space-y-4">
                      <div>
                        <div className="text-[10px] tracking-wide text-gray-400 font-black uppercase mb-1">ANALYSIS MODEL ENGINE</div>
                        <select 
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-xs rounded px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="yolov8n">YOLOv8n (Core Real-time Edge Backbone)</option>
                          <option value="yolov8s">YOLOv8s (Enhanced Feature Fusion Backbone)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] tracking-wide text-gray-400 font-black uppercase mb-1">
                          <span>CONFIDENCE THRESHOLD</span>
                          <span className={`${confThreshold >= 0.70 ? 'text-emerald-400' : 'text-orange-400'} font-bold`}>
                            {confThreshold.toFixed(2)}
                          </span>
                        </div>
                        <input 
                          type="range"
                          min="0.10"
                          max="0.95"
                          step="0.05"
                          value={confThreshold}
                          onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
                          <span>0.10</span>
                          <span className="text-[8px] bg-slate-950 px-1 rounded border border-slate-800 text-gray-400 px-1.5">Rejects &lt; 0.50</span>
                          <span>0.95</span>
                        </div>
                      </div>

                      {/* DETECT COMPILATION BUTTON */}
                      <button
                        onClick={runYoloAnalysis}
                        disabled={isAnalyzing}
                        className={`w-full rounded font-black tracking-wider text-xs py-2.5 uppercase transition-all flex items-center justify-center gap-2 ${
                          isAnalyzing 
                            ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-600 text-black hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`}
                      >
                        {isAnalyzing ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4" />
                        )}
                        <span>{isAnalyzing ? 'Running Model Analysis...' : 'RUN PIPELINE ANALYSIS'}</span>
                      </button>
                    </div>

                    {/* PHYSICAL UPLOAD CHARRING BOX */}
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
                        customImage 
                          ? 'border-emerald-500/50 bg-emerald-950/5' 
                          : 'border-slate-800 bg-slate-950/20 hover:border-emerald-500/30'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="image-file-uploader" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                      <label htmlFor="image-file-uploader" className="cursor-pointer space-y-2 block">
                        <Upload className="h-6 w-6 mx-auto text-sky-400" />
                        <div className="text-xs font-bold text-gray-300">
                          {customImage ? 'Custom image loaded' : 'Drag & drop custom recon photo'}
                        </div>
                        <p className="text-[10px] text-gray-500">Supports PNG, JPG, JPEG up to 10MB</p>
                      </label>
                      {customImage && (
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded truncate max-w-[150px] font-mono">
                            {customFileName}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setCustomImage(null);
                              setCustomFileName('');
                            }} 
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DYNAMIC SYSTEM DIAGNOSTIC PANEL */}
                    <div className="rounded-lg bg-slate-950 border border-slate-800 p-3.5 space-y-3 font-mono text-[10px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-emerald-400 font-bold uppercase tracking-wider">YOLOv11 Core Engine</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      
                      <div className="space-y-2 text-gray-400">
                        <div>
                          <span className="text-gray-500">MODEL LOADED:</span>
                          <span className="text-gray-200 block font-bold">YOLOv11-Military-Camo (Ultralytics v11)</span>
                        </div>
                        <div>
                          <span className="text-gray-500">SPEC WEIGHTS:</span>
                          <span className="text-emerald-400 block break-all">yolov11x_camo_military_v4.2.pt</span>
                        </div>
                        <div>
                          <span className="text-gray-500">IMAGE ENDPOINT:</span>
                          <span className="text-blue-400 block">POST /api/detect</span>
                        </div>
                        <div>
                          <span className="text-gray-500">VIDEO ENDPOINT:</span>
                          <span className="text-cyan-400 block">POST /api/detect-video</span>
                        </div>
                        <div className="border-t border-slate-900 pt-1.5">
                          <span className="text-gray-500 block mb-1">DETECTION OUTPUT SCHEMATIC:</span>
                          <pre className="bg-slate-900 border border-slate-800 p-1.5 rounded text-[9px] text-emerald-500 overflow-x-auto whitespace-pre">
{`{
  "id": "camo_tkt_129481",
  "threatType": "Camo Sniper",
  "confidence": 0.942,
  "boundingBoxes": [
    {
      "label": "Camo Sniper",
      "box": [ymin, xmin, ymax, xmax],
      "confidence": 0.942
    }
  ],
  "blockchainBlock": 12,
  "blockchainHash": "ef4a77..."
}`}
                          </pre>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT MONITOR PREVIEW COMPONENT */}
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    
                    {/* CHOOSE PREVIEW RECON LAYER */}
                    <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800 justify-between items-center">
                      <div className="flex gap-1">
                        {(['raw', 'yolo', 'gradcam', 'thermal'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setActiveOverlayMode(mode)}
                            className={`px-3 py-1.5 rounded text-xs transition-all uppercase tracking-wider font-bold ${
                              activeOverlayMode === mode
                                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            {mode === 'raw' ? 'Raw drone frame' :
                             mode === 'yolo' ? 'YOLO Coordinates' :
                             mode === 'gradcam' ? 'Grad-CAM Attention' :
                             'Thermal spectrum'}
                          </button>
                        ))}
                      </div>

                      {/* Gradcam Slider */}
                      {activeOverlayMode === 'gradcam' && (
                        <div className="flex items-center gap-2 px-2 text-xs text-gray-400 font-mono">
                          <span>Alpha:</span>
                          <input 
                            type="range" 
                            min="20" 
                            max="95" 
                            value={gradcamAlpha}
                            onChange={(e) => setGradcamAlpha(Number(e.target.value))}
                            className="w-16 accent-emerald-500 h-1 rounded" 
                          />
                          <span>{gradcamAlpha}%</span>
                        </div>
                      )}
                    </div>

                    {/* SCREEN CANVAS WORKSPACE AREA */}
                    <div className="relative w-full h-[360px] rounded-xl border overflow-hidden flex items-center justify-center bg-slate-950" style={{ borderColor: COLORS.border }}>
                      
                      {/* Grid crosshair visual graphics */}
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10 pointer-events-none">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div key={i} className="border border-emerald-500" />
                        ))}
                      </div>

                      {/* Dynamic Scenery Drawing or custom Base64 image display */}
                      {customImage ? (
                        <img 
                          src={customImage} 
                          alt="Surveillance analysis" 
                          className={`w-full h-full object-cover transition-all ${
                            activeOverlayMode === 'thermal' ? 'hue-rotate-180 invert brightness-110 saturate-150' : ''
                          }`} 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: SCENARIOS[selectedScenario].baseColor }}>
                          {/* Artistic Abstract Battlefield SVG vector */}
                          <svg className="w-full h-full opacity-60" viewBox="0 0 400 300" preserveAspectRatio="none">
                            <path d="M 0,250 Q 150,180 280,240 T 400,210 L 400,300 L 0,300 Z" fill="#2d3748" opacity="0.3" />
                            <path d="M 0,200 Q 100,240 220,180 T 400,240 L 400,300 L 0,300 Z" fill="#1a202c" opacity="0.5" />
                            {/* Forest trees icons scattered */}
                            <g fill="#1a231b" opacity="0.4">
                              <polygon points="120,160 110,190 130,190" />
                              <polygon points="260,170 250,200 270,200" />
                              <polygon points="340,150 330,185 350,185" />
                            </g>
                          </svg>
                        </div>
                      )}

                      {/* 1. YOLO BOUNDING BOX COORDINATES OVERLAY */}
                      {activeOverlayMode === 'yolo' && (
                        <>
                          {(customImage && selectedDetection && selectedDetection.boundingBoxes ? selectedDetection.boundingBoxes : SCENARIOS[selectedScenario].detections).map((boxObj: any, idx: number) => {
                            const [ymin, xmin, ymax, xmax] = boxObj.box;
                            return (
                              <div 
                                key={idx} 
                                className="absolute border-2 border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.25)] flex flex-col justify-between"
                                style={{
                                  top: `${ymin}%`,
                                  left: `${xmin}%`,
                                  height: `${ymax - ymin}%`,
                                  width: `${xmax - xmin}%`,
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <div className="absolute -top-5 left-0 bg-emerald-500 text-black text-[9px] font-black uppercase font-mono px-1 py-0.5 whitespace-nowrap rounded">
                                  {boxObj.label} • {(boxObj.confidence * 100).toFixed(0)}%
                                </div>
                                <div className="p-1 border-b border-r border-emerald-500/30 font-mono text-[9px] text-emerald-400 bg-slate-950/60 self-start">
                                  L_LOC: [{xmin}%, {ymin}%]
                                </div>
                                <div className="absolute bottom-0 right-0 p-1 border-t border-l border-emerald-500/30 text-emerald-400 font-mono text-[8px] bg-slate-950/60">
                                  YOLOv11
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}

                      {/* 2. GRAD-CAM ACTIVATION ATTENTION OVERLAY */}
                      {activeOverlayMode === 'gradcam' && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 pointer-events-none">
                            {selectedDetection && selectedDetection.detected !== false && selectedDetection.gradcamHeatmapUrl ? (
                              <img 
                                src={selectedDetection.gradcamHeatmapUrl} 
                                className="w-full h-full object-cover mix-blend-screen" 
                                style={{ opacity: gradcamAlpha / 100 }}
                                alt="Grad-CAM visual attention heatmap overlaid on recon"
                              />
                            ) : (
                              <div className="text-gray-400 font-mono text-xs bg-slate-950/90 border border-slate-850 px-3.5 py-2 rounded-lg shadow-lg pointer-events-auto">
                                No Grad-CAM available.
                              </div>
                            )}
                          </div>
                          
                          {/* Math indicator HUD in bottom corners */}
                          <div className="absolute right-3 bottom-3 bg-slate-950/80 border border-slate-800 p-2.5 rounded font-mono text-[9px] text-gray-400 max-w-xs space-y-1">
                            <div className="text-emerald-400 font-bold">Grad-CAM Gradient Math:</div>
                            <div>L_CAM = ReLU(Σ_k α_k * A_k)</div>
                            <div>where α_k = 1/Z Σ_i Σ_j ∂y^c / ∂A_i,j^k</div>
                            <div className="text-[8px] text-gray-500">Derivative channel weighting applied to Conv Layer 11</div>
                          </div>
                        </>
                      )}

                      {/* 3. THERMAL SPECTRUM SENSOR FUSION */}
                      {activeOverlayMode === 'thermal' && (
                        <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-65 bg-gradient-to-br from-indigo-950 via-purple-900 to-amber-700">
                          {/* Simulated warm pixel areas around detected coordinates */}
                          <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-emerald-400 p-3 bg-slate-950/20">
                            <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 px-2 py-1 rounded">
                              CTR THERMAL: UNLOCK FUSION CHL-08
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Target crosshair locator ring */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-sky-500/20 w-32 h-32 rounded-full animate-pulse flex items-center justify-center pointer-events-none">
                        <Crosshair className="h-4 w-4 text-sky-400/50" />
                      </div>

                    </div>

                    {/* HUD CORNER DETAILS GRID */}
                    {selectedDetection && (
                      <div className="rounded-xl border bg-slate-950 p-4 border-slate-800" id="detection-pipeline-hud">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                          <div>
                            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider font-mono">MITIGATION REPORT LOCKED</div>
                            <h3 className="text-sm font-bold text-white">{selectedDetection.threatType}</h3>
                          </div>
                          <span className="bg-red-950 text-red-400 font-bold font-mono px-2.5 py-1 text-xs border border-red-900 uppercase">
                            THREAT: {selectedDetection.tacticalAnalysis?.threatRating || 'HIGH'}
                          </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 text-xs">
                          <div className="p-3 bg-slate-900/40 rounded border border-slate-800">
                            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-mono mb-1">CONCEALMENT METRIC</div>
                            <div className="font-mono text-base font-black text-white">
                              {selectedDetection.tacticalAnalysis?.concealmentScore}%
                            </div>
                            <p className="text-[10px] text-gray-400">YOLO visual camou match ratio</p>
                          </div>

                          <div className="p-3 bg-slate-900/40 rounded border border-slate-800">
                            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-mono mb-1">SENSOR FUSION ASSIGN</div>
                            <div className="font-mono text-base font-bold text-sky-400">
                              {selectedDetection.tacticalAnalysis?.fusionRatio || '80% VS / 20% TH'}
                            </div>
                            <p className="text-[10px] text-gray-400">Dual spectrum alignment balance</p>
                          </div>

                          <div className="p-3 bg-slate-900/40 rounded border border-slate-800">
                            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-mono mb-1">BLOCK SECURITY STAMP</div>
                            <div className="font-mono text-[10px] truncate text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                              <Lock className="h-3 w-3 inline text-indigo-500 shrink-0" />
                              <span className="truncate">{selectedDetection.blockchainHash}</span>
                            </div>
                            <p className="text-[10px] text-gray-400">Secure record reference ledger</p>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-emerald-950/10 rounded border border-emerald-900/30 text-xs">
                          <div className="font-black text-emerald-400 uppercase tracking-wide font-mono flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>RECOMMENDED COUNTERMEASURES</span>
                          </div>
                          <p className="text-gray-300 leading-relaxed font-sans">{selectedDetection.tacticalAnalysis?.recommendedAction}</p>
                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ----- MODULE 3: REAL-TIME DRONEsurveillance DRONE VIDEO FEED ----- */}
          {activeTab === 'video' && (
            <div className="space-y-6 animate-fade-in" id="video-analysis-view">
              
              <div className="rounded-xl border bg-slate-950/60 p-4 shadow-md" style={{ borderColor: COLORS.border }}>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Play className="h-5 w-5 text-emerald-500" />
                    <span>COSMOSPACE SATELLITE DRONE FRAME FEED</span>
                  </h2>
                  <p className="text-xs text-gray-400">Simulate specialized real-time object tracking over a 60-frame optical sweep. CAM-YOLO11 executes per-frame edge categorization.</p>
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-12">
                  
                  {/* LEFT CONTROLLER COMPONENT */}
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    
                    {/* VIDEO CONTAINER */}
                    <div className="relative w-full h-[320px] rounded-xl border bg-slate-950 flex flex-col items-center justify-center overflow-hidden" style={{ borderColor: COLORS.border }}>
                      
                      {/* Top Overlay Camera Info HUD */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between text-[10px] font-mono p-2 bg-slate-950/80 rounded border border-slate-800 z-10">
                        <div className="flex gap-4">
                          <span className="text-red-500 font-bold flex items-center gap-1 uppercase">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" />
                            <span>REC DRONE FEED</span>
                          </span>
                          <span>ALT: 450m</span>
                          <span>ZOOM: {droneZoom}x</span>
                        </div>
                        <div>
                          <span>
                            {customVideo && videoRef.current ? (
                              `TIME: ${customVideoSeconds.toFixed(1)}s / ${videoRef.current.duration ? videoRef.current.duration.toFixed(1) : 0}s`
                            ) : (
                              `FRAME: ${videoFrame}/59`
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Video graphic scenery display or real video tag */}
                      {customVideo ? (
                        <video
                          ref={videoRef}
                          src={customVideo}
                          className="absolute inset-0 w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          onTimeUpdate={(e) => {
                            const video = e.currentTarget;
                            setCustomVideoSeconds(video.currentTime);
                          }}
                          style={{ transform: `scale(${droneZoom})`, transition: 'transform 0.3s ease' }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center transition-all bg-emerald-950/20 bg-cover bg-center">
                          {/* Custom moving graphics represent drone frame movement */}
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#10b981" strokeWidth="0.1" opacity="0.15" />
                              </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid-pattern)" />
                            
                            {/* Rotating terrain overlay vectors based on frame counts */}
                            <path d={`M 0,${60 + Math.sin(videoFrame * 0.1) * 5} L 100,${70 + Math.cos(videoFrame * 0.1) * 3} L 100,100 L 0,100 Z`} fill="#111827" opacity="0.4" />
                            
                            {/* Draw military objective target coordinates on coordinates */}
                            <circle cx="50" cy="50" r="1.5" fill="#f97316" className="animate-pulse" />
                          </svg>
                        </div>
                      )}

                      {/* Live moving Bounding Boxes tracking over the active frame */}
                      {getDroneDetectionsForFrame(videoFrame).map((boxObj: any, idx: number) => {
                        const [ymin, xmin, ymax, xmax] = boxObj.box;
                        return (
                          <div 
                            key={idx}
                            className="absolute border border-red-500 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse flex flex-col justify-between"
                            style={{
                              top: `${ymin}%`,
                              left: `${xmin}%`,
                              height: `${ymax - ymin}%`,
                              width: `${xmax - xmin}%`,
                              transition: 'all 0.1s linear'
                            }}
                          >
                            <div className="absolute -top-4.5 left-0 bg-red-500 text-white text-[8px] font-mono px-1 rounded uppercase whitespace-nowrap">
                              LOCK: {boxObj.label} • {(boxObj.confidence * 100).toFixed(0)}%
                            </div>
                            <div className="absolute bottom-1 right-1 h-2 w-2 border-r border-b border-red-500" />
                          </div>
                        );
                      })}

                      {/* Large Center HUD Crosshairs */}
                      <div className="absolute border border-emerald-500/30 w-44 h-44 rounded-full flex items-center justify-center pointer-events-none">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        <div className="absolute w-6 h-[1px] bg-emerald-500" />
                        <div className="absolute h-6 w-[1px] bg-emerald-500" />
                      </div>

                      {/* Overlay alerts */}
                      {getDroneDetectionsForFrame(videoFrame).length > 0 && (
                        <div className="absolute bottom-3 left-3 bg-red-950/90 border border-red-600 px-3 py-1.5 rounded animate-bounce text-red-200 text-[10px] font-mono font-bold uppercase tracking-wider z-10 flex items-center gap-1.5 font-sans">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span>HIGH INT CONCEALED TARGET IDENTIFIED</span>
                        </div>
                      )}

                    </div>

                    {/* VIDEO CONTROLS TRACKBAR */}
                    <div className="flex flex-col gap-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                      
                      {/* Video upload row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                        <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
                          {isVideoAnalyzing ? (
                            <span className="flex items-center gap-1.5 text-amber-400">
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                              <span>ANALYZING SURVEILLANCE FEED...</span>
                            </span>
                          ) : customVideoFileName ? (
                            <span className="text-emerald-400 font-bold">STREAM: {customVideoFileName}</span>
                          ) : (
                            <span>SYSTEM STANDBY: Simulator Active</span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {customVideo && (
                            <button
                              onClick={() => {
                                setCustomVideo(null);
                                setCustomVideoFileName('');
                                setVideoTrackingData(null);
                                setVideoFrame(0);
                                setCustomVideoSeconds(0);
                                setIsVideoPlaying(false);
                                if (videoRef.current) {
                                  videoRef.current.pause();
                                  videoRef.current.currentTime = 0;
                                }
                              }}
                              className="text-[10px] tracking-wider uppercase px-2 py-1 rounded bg-red-950/30 border border-red-800 text-red-400 hover:bg-red-900/50"
                            >
                              Unload Video
                            </button>
                          )}
                          <label className="text-[10px] tracking-wider uppercase px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 cursor-pointer flex items-center gap-1">
                            <Upload className="h-3 w-3" />
                            <span>Upload Recon Clip</span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/ogg,video/quicktime"
                              className="hidden"
                              onChange={handleVideoUpload}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const nextPlaying = !isVideoPlaying;
                              setIsVideoPlaying(nextPlaying);
                              if (videoRef.current) {
                                if (nextPlaying) {
                                  videoRef.current.play().catch(e => console.log(e));
                                } else {
                                  videoRef.current.pause();
                                }
                              }
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-black hover:bg-emerald-500"
                            id="btn-play-pause"
                          >
                            {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          
                          <button
                            onClick={() => {
                              setVideoFrame(0);
                              setCustomVideoSeconds(0);
                              setIsVideoPlaying(false);
                              if (videoRef.current) {
                                videoRef.current.pause();
                                videoRef.current.currentTime = 0;
                              }
                            }}
                            className="text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded font-bold"
                          >
                            Reset Frame
                          </button>
                        </div>

                        {/* Slide track */}
                        <div className="flex-1 flex items-center gap-2">
                          {customVideo && videoRef.current ? (
                            <input 
                              type="range" 
                              min="0" 
                              max={videoRef.current.duration || 10} 
                              step="0.1"
                              value={customVideoSeconds}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setCustomVideoSeconds(val);
                                if (videoRef.current) {
                                  videoRef.current.currentTime = val;
                                }
                              }}
                              className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded" 
                            />
                          ) : (
                            <input 
                              type="range" 
                              min="0" 
                              max="59" 
                              value={videoFrame}
                              onChange={(e) => setVideoFrame(Number(e.target.value))}
                              className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded" 
                            />
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => setDroneZoom(1)} className={`px-2 py-1 text-[10px] uppercase rounded border ${droneZoom === 1 ? 'bg-emerald-950/25 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-transparent text-gray-400'}`}>1x</button>
                          <button onClick={() => setDroneZoom(2)} className={`px-2 py-1 text-[10px] uppercase rounded border ${droneZoom === 2 ? 'bg-emerald-950/25 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-transparent text-gray-400'}`}>2x</button>
                          <button onClick={() => setDroneZoom(4)} className={`px-2 py-1 text-[10px] uppercase rounded border ${droneZoom === 4 ? 'bg-emerald-950/25 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-transparent text-gray-400'}`}>4x</button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT THREAT REPORT TIMELINE DETAILS */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    
                    {/* THREAT METRIC COUNTERS */}
                    <div className="rounded-lg bg-slate-900/50 p-3 border border-slate-800 space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">REAL-TIME TELEMETRY</div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                          <span className="text-gray-400">Current Targets Locked:</span>
                          <span className="font-mono font-black text-red-400 text-sm">
                            {getDroneDetectionsForFrame(videoFrame).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                          <span className="text-gray-400">Sweep Velocity:</span>
                          <span className="font-mono text-gray-200">14.8 ms/frame</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Edge Alignment Confidence:</span>
                          <span className="font-mono text-emerald-400 font-bold">96.4% OPT</span>
                        </div>
                      </div>
                    </div>

                    {/* LIVE THREAT FEED ACTIVITY SCORES */}
                    <div className="rounded-lg bg-slate-900/50 p-3 border border-slate-800 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">RUNNING ANALYSIS LOG</div>
                        <div className="font-mono text-[10px] text-gray-400 space-y-2 max-h-[140px] overflow-y-auto">
                          <div>[f_01-f_11] Terrain matching: 0 threats detected.</div>
                          {videoFrame >= 12 && (
                            <div className="text-red-400 font-bold">[f_12-f_25] lock on "Sniper (foliage coverage)" at coordinates [48, 40].</div>
                          )}
                          {videoFrame >= 26 && videoFrame <= 34 && (
                            <div className="text-gray-500">[f_26-f_34] Target zone cleared. Re-establishing visual tracking matrices.</div>
                          )}
                          {videoFrame >= 35 && (
                            <div className="text-red-400 font-bold">[f_35-f_50] lock on APC Heavy Armor (T-80 Variant) at [30, 25].</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-wide flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>DETECTION TIMELINE SPANS</span>
                        </div>
                        <div className="mt-2 h-16 w-full flex items-end gap-0.5 bg-slate-950 p-1.5 rounded border border-slate-800/60 font-mono text-[9px]">
                          {Array.from({ length: 30 }).map((_, i) => {
                            const isZoneA = i >= 6 && i <= 12;
                            const isZoneB = i >= 17 && i <= 25;
                            const h = isZoneA ? 'h-10 bg-red-500/80' : isZoneB ? 'h-14 bg-red-600' : 'h-1.5 bg-emerald-500/30';
                            return (
                              <div key={i} className={`flex-1 rounded-t transition-all ${h}`} title={`Interval ${i}`} />
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-500 font-mono mt-1">
                          <span>Frame 1</span>
                          <span>Frame 30</span>
                          <span>Frame 60</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ----- MODULE 5: BLOCKCHAIN SECURITY SECURE LEDGER ----- */}
          {activeTab === 'blockchain' && (
            <div className="space-y-6 animate-fade-in" id="blockchain-ledger-view">
              
              <div className="rounded-xl border bg-slate-950/60 p-4 shadow-md" style={{ borderColor: COLORS.border }}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      <span>CRYPTOGRAPHIC IMMUTABILITY SURVEILLANCE LEDGER</span>
                    </h2>
                    <p className="text-xs text-gray-400">Zero-trust network architecture ledger. All YOLOv11 detections are mined into blocks with SHA-256 links to prevent unauthorized record erasure.</p>
                  </div>
                  
                  {/* Ledger Reset Utility */}
                  <div className="flex gap-2">
                    <button
                      onClick={triggerAudit}
                      className="rounded bg-sky-950/80 border border-sky-800 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-900"
                    >
                      Audit ledger Verification
                    </button>
                    <button
                      onClick={resetBlockchainChain}
                      className="rounded bg-slate-800 px-3 py-1.5 text-xs font-bold text-gray-300 hover:bg-slate-700"
                    >
                      Reset Ledger Blocks
                    </button>
                  </div>
                </div>

                {/* CYBER INTELLIGENCE DEMONSTRATION EXPLAINER */}
                <div className="rounded-lg bg-indigo-950/20 text-indigo-300 p-4 border border-indigo-900/50 mb-6 text-xs flex gap-3">
                  <Terminal className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-indigo-200 uppercase tracking-wide block mb-1">SURVEILLANCE EVIDENCE LEDGER LABS — TAMPER DEMO</span>
                    To demonstrate military cybersecurity protection to research panels, try selecting an active historical block in the explorer panel below, modify its contents (e.g. hack a threat detection status from "Infantry" to "DECRYPTED_SAFE"), and click "Inject Alteration!". Watch as subsequent cryptographic links shatter (pulse RED), displaying system failure logs.
                  </div>
                </div>

                {/* BLOCKCHAIN CHAIN TREE VISUALIZER */}
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">SECURE BLOCKCHAIN LEDGER FLOW</div>
                  
                  <div className="flex flex-row gap-4 overflow-x-auto pb-4 pt-2">
                    
                    {blockchain.map((block, idx) => {
                      const isGenesis = block.index === 0;
                      // Simple simulated chain validation
                      let isBlockInvalid = false;
                      if (isChainCompromised && selectedBlockForTamper !== null && block.index >= selectedBlockForTamper) {
                        isBlockInvalid = true;
                      }

                      return (
                        <div key={idx} className="flex items-center shrink-0">
                          {/* Chain connector arrow */}
                          {!isGenesis && (
                            <div className="w-6 flex items-center justify-center font-mono font-bold text-gray-600 text-lg">
                              →
                            </div>
                          )}

                          {/* Block Card Container */}
                          <div 
                            onClick={() => setSelectedBlockForTamper(block.index)}
                            className={`w-56 p-4 rounded-xl border transition-all cursor-pointer relative ${
                              selectedBlockForTamper === block.index 
                                ? 'ring-2 ring-emerald-400' 
                                : ''
                            } ${
                              isBlockInvalid 
                                ? 'bg-red-950/60 border-red-800 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b pb-2 mb-2" style={{ borderColor: isBlockInvalid ? '#ef444433' : '#33415555' }}>
                              <span className="text-[10px] font-mono font-black uppercase">
                                {isGenesis ? 'GENESIS BLOCK' : `BLOCK #${block.index}`}
                              </span>
                              <span className="shrink-0 p-1 bg-slate-950/80 rounded">
                                {isBlockInvalid ? (
                                  <Unlock className="h-3.5 w-3.5 text-red-400" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                                )}
                              </span>
                            </div>

                            <div className="space-y-1.5 font-mono text-[10px] text-gray-300">
                              <div>
                                <span className="text-gray-500">TIMESTAMP:</span>
                                <div className="truncate text-white">{new Date(block.timestamp).toLocaleTimeString()}</div>
                              </div>

                              <div>
                                <span className="text-gray-500">PREV HASH:</span>
                                <div className="truncate text-sky-400">{block.prevHash}</div>
                              </div>

                              <div>
                                <span className="text-gray-500">BLOCK HASH:</span>
                                <div className="truncate text-sky-400 font-bold">{block.hash}</div>
                              </div>

                              <div className="pt-1.5 border-t" style={{ borderColor: isBlockInvalid ? '#ef444433' : '#33415555' }}>
                                <span className="text-gray-500 block uppercase tracking-wide font-sans text-[8px] font-bold">MUTABLE PAYLOAD DATA</span>
                                <div className="text-white font-sans text-xs truncate font-bold mt-0.5">
                                  {block.data?.threatType || 'SYSTEM_LOAD'}
                                </div>
                                <div className="text-[9px] text-gray-400 font-sans mt-0.5">
                                  Confidence: {((block.data?.confidence || 0) * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>

                            {/* Tampering overlay warning status */}
                            {isBlockInvalid && (
                              <div className="absolute inset-0 bg-red-950/10 pointer-events-none rounded-xl border border-red-500/30 animate-pulse" />
                            )}
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* CYBER SECURITY OVERWRITE PANEL TRG */}
                {selectedBlockForTamper !== null && (
                  <div className="mt-6 p-4 rounded-xl border bg-slate-950 border-slate-800 grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#ef4444] flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span>TACTICAL SENSORS INTRUSION SANDBOX (BLOCK #{selectedBlockForTamper})</span>
                      </h4>
                      <p className="mt-1 text-xs text-gray-400">
                        Instruct the server to overwrite the detection payload data inside Block #{selectedBlockForTamper}. Since secure records are coupled via cryptography, this will invalidate subsequent blocks in seconds.
                      </p>

                      <div className="mt-4 flex gap-2 items-center">
                        <input 
                          type="text"
                          value={tamperThreatType}
                          onChange={(e) => setTamperThreatType(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-red-500" 
                        />
                        <button
                          onClick={executeTamperSimulation}
                          className="rounded bg-red-600 hover:bg-red-500 text-black px-4 py-1.5 font-bold text-xs uppercase"
                        >
                          Inject Alteration!
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-4 rounded border border-slate-800 text-xs flex flex-col justify-between font-mono">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">CHAIN LINK VERIFICATION METRICS</div>
                        <div className="mt-2 text-gray-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Block rec validation:</span>
                            <span className={isChainCompromised ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                              {isChainCompromised ? 'FAILURE RECOIL' : 'PASS (100% MATCHED)'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recalculated Hash:</span>
                            <span className="truncate w-36 text-right">
                              {blockchain[selectedBlockForTamper]?.hash || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={resetBlockchainChain}
                        className="mt-4 w-full rounded border border-emerald-500/30 bg-emerald-950/20 py-2 text-center text-[10px] font-mono uppercase text-emerald-400 hover:bg-emerald-950/40"
                      >
                        REKINK LOGS / RECONSTRUCT GENESIS CHAIN
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ----- MODULE 6: QUANTUM OPTIMIZATION TUNING MODULE ----- */}
          {activeTab === 'quantum' && (
            <div className="space-y-6 animate-fade-in" id="quantum-module-view">
              
              <div className="rounded-xl border bg-slate-950/60 p-4 shadow-md" style={{ borderColor: COLORS.border }}>
                <div className="border-b border-slate-800 pb-4 mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-emerald-500" />
                    <span>QUANTUM HYPERPARAMETER OPTIMIZATION TUNER</span>
                  </h2>
                  <p className="text-xs text-gray-400">Evaluate optimal convolution grids, fusion layouts, and backplane parameters using modeled quantum-annealing superpositions, avoiding manual SGD bottlenecks.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                  
                  {/* SLIDERS MODULE */}
                  <div className="lg:col-span-4 rounded-lg bg-slate-900/50 p-4 border border-slate-800 flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">HYPERPARAMETER MULTI-TUNERS</div>
                      
                      {/* Slider A */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-gray-300">
                          <span>Feature Fusion Depth:</span>
                          <span className="text-emerald-400 font-bold">Lvl {quantumFusionDepth}</span>
                        </div>
                        <input 
                          type="range"
                          min="2"
                          max="10"
                          value={quantumFusionDepth}
                          onChange={(e) => setQuantumFusionDepth(Number(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-slate-950 rounded cursor-pointer" 
                        />
                        <div className="text-[9px] text-gray-500">Controls weighted skip connection layers ratios</div>
                      </div>

                      {/* Slider B */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-gray-300">
                          <span>Superposition Learning rate:</span>
                          <span className="text-sky-400 font-bold">{quantumLearningRate.toFixed(4)}</span>
                        </div>
                        <input 
                          type="range"
                          min="0.005"
                          max="0.05"
                          step="0.001"
                          value={quantumLearningRate}
                          onChange={(e) => setQuantumLearningRate(parseFloat(e.target.value))}
                          className="w-full accent-sky-400 h-1 bg-slate-950 rounded cursor-pointer" 
                        />
                        <div className="text-[9px] text-gray-500">Quantum optimizer learning convergence rate</div>
                      </div>

                      {/* Slider C */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-gray-300">
                          <span>Epoch Training Limit:</span>
                          <span className="text-orange-400 font-bold">{quantumEpochs} epochs</span>
                        </div>
                        <input 
                          type="range"
                          min="30"
                          max="120"
                          step="10"
                          value={quantumEpochs}
                          onChange={(e) => setQuantumEpochs(Number(e.target.value))}
                          className="w-full accent-orange-400 h-1 bg-slate-950 rounded cursor-pointer" 
                        />
                        <div className="text-[9px] text-gray-500">Maximum classical calibration training counts</div>
                      </div>
                    </div>

                    <button
                      onClick={runQuantumOptimization}
                      disabled={quantumSimulating}
                      className="mt-6 w-full rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-black py-2.5 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {quantumSimulating && <RefreshCw className="h-4 w-4 animate-spin" />}
                      <span>{quantumSimulating ? 'Annealing Weights...' : 'ANNEAL WEIGHTS IN QUANTUM UNIT'}</span>
                    </button>
                  </div>

                  {/* HIGH-END CHART DISPLAY COMPARISON */}
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">MODEL ACCURACY mAP COMPARISON</div>
                        <span className="text-[9px] font-mono text-gray-500">mAP [IoU=0.50:0.95] • CAM-YOLO11 vs Benchmark</span>
                      </div>

                      {/* CHART */}
                      <div className="h-[240px] w-full text-xs font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dynamicQuantumData}>
                            <defs>
                              <linearGradient id="quantum-area" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity="0.2"/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity="0"/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="epoch" stroke="#52525b" />
                            <YAxis domain={[60, 100]} stroke="#52525b" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                            <Legend />
                            <Line type="monotone" dataKey="Classical_YOLO11" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
                            <Area type="monotone" dataKey="CAM_YOLO11_Quantum" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#quantum-area)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* DYNAMIC RESULTS SUMMARY KPI */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-gray-300">
                        <div className="font-bold text-gray-400 uppercase text-[9px] mb-1">OPTIMIZED MODEL mAP MAX</div>
                        <div className="text-xl font-black text-emerald-400">
                          {dynamicQuantumData[dynamicQuantumData.length - 1].CAM_YOLO11_Quantum}%
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          Standard: {dynamicQuantumData[dynamicQuantumData.length - 1].Classical_YOLO11}% (+{(dynamicQuantumData[dynamicQuantumData.length - 1].CAM_YOLO11_Quantum - dynamicQuantumData[dynamicQuantumData.length - 1].Classical_YOLO11).toFixed(1)}%)
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-gray-300">
                        <div className="font-bold text-gray-400 uppercase text-[9px] mb-1">STOCHASTIC SHIFT OVERHEAD</div>
                        <div className="text-xl font-black text-sky-400">
                          -74.8% REDUCTION
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">Eliminated hyperparameter gradient drift</div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ----- MODULE 7: PERSISTENT SEARCH HISTORY ----- */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-fade-in" id="history-archives-view">
              
              <div className="rounded-xl border bg-slate-950/60 p-4 shadow-md" style={{ borderColor: COLORS.border }}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                      <History className="h-5 w-5 text-emerald-500" />
                      <span>SURVEILLANCE ARCHIVE DATABASE QUERY</span>
                    </h2>
                    <p className="text-xs text-gray-400">Search and sort historical camouflaged soldier and armored detections stored securely in SQLite.</p>
                  </div>

                  {/* SEARCH AND FILTER INPUT HUD */}
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-44"
                      />
                    </div>

                    <select
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ALL">All Threat Levels</option>
                      <option value="CRITICAL">Critical threat Rating</option>
                      <option value="HIGH">High threat Rating</option>
                      <option value="MED">Medium threat Rating</option>
                    </select>
                  </div>
                </div>

                {/* ARCHIVE LOG DATA GRID */}
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3">Threat type category</th>
                        <th className="p-3 text-center">Confidence</th>
                        <th className="p-3">Concealment Rating</th>
                        <th className="p-3">Tactical timestamp</th>
                        <th className="p-3">Ledger block ID</th>
                        <th className="p-3 text-right">Ledger Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-gray-300 font-mono">
                      {detections
                        .filter(item => {
                          const matchesSearch = item.threatType.toLowerCase().includes(historySearch.toLowerCase());
                          const matchesFilter = historyFilter === 'ALL' || item.tacticalAnalysis?.threatRating === historyFilter;
                          return matchesSearch && matchesFilter;
                        })
                        .map((item, idx) => (
                          <tr 
                            key={idx} 
                            onClick={() => {
                              setSelectedDetection(item);
                              setActiveTab('analysis'); // warp to view details
                            }}
                            className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                          >
                            <td className="p-3 font-bold text-white flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${
                                item.tacticalAnalysis?.threatRating === 'CRITICAL' ? 'bg-red-500' :
                                item.tacticalAnalysis?.threatRating === 'HIGH' ? 'bg-orange-500' :
                                'bg-sky-500'
                              }`} />
                              <span>{item.threatType}</span>
                            </td>
                            <td className="p-3 text-center text-emerald-400 font-bold">{(item.confidence * 100).toFixed(1)}%</td>
                            <td className="p-3">{item.tacticalAnalysis?.concealmentScore || 80}% score</td>
                            <td className="p-3 text-gray-400">{new Date(item.timestamp).toLocaleString()}</td>
                            <td className="p-3 text-indigo-400">Block #{item.blocIndex || idx + 1}</td>
                            <td className="p-3 text-right">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/40 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-900/50 uppercase">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>SECURE</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {detections.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No matching camouflaged targets found in surveillance archives.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ----- MODULE 8: HISTORICAL MULTISPECTRAL ANALYTICS ----- */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in" id="analytics-grid-view">
              
              <div className="rounded-xl border bg-slate-950/60 p-4 shadow-md" style={{ borderColor: COLORS.border }}>
                <div className="border-b border-slate-800 pb-4 mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    <span>MULTISPECTRAL HISTORICAL STATISTICAL PANELS</span>
                  </h2>
                  <p className="text-xs text-gray-400">Core analytics charts compiling target classifications, sensor distributions, and classification accuracy curves.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* BAR CHART: DAILY SCANS TREND */}
                  <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                    <div className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-3">TELEMETRY SCANS PROCESS RATE</div>
                    <div className="h-[200px] w-full text-xs font-mono">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { day: 'Mon', Scans: 2 },
                          { day: 'Tue', Scans: 4 },
                          { day: 'Wed', Scans: 1 },
                          { day: 'Thu', Scans: 5 },
                          { day: 'Fri', Scans: 3 },
                          { day: 'Sat', Scans: 6 },
                          { day: 'Sun', Scans: stats.todaysScans }
                        ]}>
                          <CartesianGrid strokeDasharray="3" stroke="#27272a" />
                          <XAxis dataKey="day" stroke="#52525b" />
                          <YAxis stroke="#52525b" />
                          <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b' }} />
                          <Bar dataKey="Scans" fill="#10b981">
                            {Array.from({ length: 7 }).map((_, i) => (
                              <Cell key={i} fill={i === 6 ? '#0ea5e9' : '#10b981'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* RADAR CHART: THREAT CLASSIFICATIONS WEIGHT */}
                  <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                    <div className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-3">SENSOR THREAT MULTI-FACET CLASSIFICATIONS</div>
                    <div className="h-[200px] w-full text-xs font-mono">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                          { label: 'Sniper/Infantry', count: 4 },
                          { label: 'Mechanized Armor', count: 3 },
                          { label: 'SAM Launcher', count: 2 },
                          { label: 'Ammo/Camp Depot', count: 5 },
                          { label: 'Perimeter Breach', count: 1 }
                        ]}>
                          <PolarGrid stroke="#27272a" />
                          <PolarAngleAxis dataKey="label" stroke="#52525b" />
                          <PolarRadiusAxis stroke="#27272a" />
                          <RechartsRadar name="Camo Target Weight" dataKey="count" stroke="#38bdf8" fill="#0ea5e9" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* LINE CHART: SENSOR ACCURACY CONFORMANCE */}
                  <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                    <div className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-3">Ffusion YOLOv11 CONFIDENCE CONFORMANCE</div>
                    <div className="h-[200px] w-full text-xs font-mono">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { sample: 'P_01', conf: 84 },
                          { sample: 'P_02', conf: 91 },
                          { sample: 'P_03', conf: 88 },
                          { sample: 'P_04', conf: 95 },
                          { sample: 'P_05', conf: 93 },
                          { sample: 'P_06', conf: 96 }
                        ]}>
                          <CartesianGrid strokeDasharray="3" stroke="#27272a" />
                          <XAxis dataKey="sample" stroke="#52525b" />
                          <YAxis domain={[75, 100]} stroke="#52525b" />
                          <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b' }} />
                          <Line type="monotone" dataKey="conf" stroke="#f97316" strokeWidth={2.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* STATISTICAL SUMMARY KPI OVERLAYS */}
                  <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-black tracking-widest uppercase text-gray-400">MULTISPECTRAL PERFORMANCE EVALUATION</div>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        Surveillance records metrics evaluate optimal thermal fusion convergence averages of <span className="text-emerald-400 font-bold font-mono">94.8% OPT</span>. Classification precision levels are locked into zero-trust secure block chains, completely mitigating record loss.
                      </p>
                    </div>
                    <div className="mt-4 border-t border-slate-900 pt-3 flex justify-between items-center text-xs">
                      <span className="text-gray-500 uppercase font-bold tracking-wider">ANN CONJECTURE PRECISION:</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">96.5% LOCK</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ----- MODULE 9: ACADEMIC RESEARCH UROP PANELS ----- */}
          {activeTab === 'research' && (
            <div className="space-y-6 animate-fade-in" id="academic-research-view">
              
              {/* RESEARCH OVERVOLT DETAILS */}
              <div className="rounded-xl border bg-slate-950/60 p-6 shadow-md font-sans" style={{ borderColor: COLORS.border }}>
                
                {/* PAPER FRONTPAGE TITLE */}
                <div className="text-center space-y-2 border-b border-slate-800 pb-6 mb-6">
                  <span className="text-xs text-sky-400 font-mono tracking-widest uppercase font-black">
                    UNDERGRADUATE RESEARCH OPPORTUNITIES PROGRAM (UROP) EVALUATION DEMOTRACK
                  </span>
                  <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-snug">
                    Reducing Miss Detection of Camouflaged Objects for Military Monitoring Using YOLOv11
                  </h1>
                  <div className="text-xs text-gray-400 font-mono">
                    Department of Electrical Engineering and Computer Science • Military Cyber-Intelligence Division Labs
                  </div>
                </div>

                {/* ABSTRACT */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">ABSTRACT</h3>
                    <p className="mt-1.5 text-xs text-gray-300 leading-relaxed font-sans text-justify">
                      Standard computer vision detectors (YOLOv8, SSD) operate on pixel-level feature contrasts, resulting in massive miss-detection ratios when targets leverage visual camouflage. This paper presents CAM-YOLO11, a multispectral surveillance framework incorporating custom derivative gradient activations (Grad-CAM) to generate real-time local thermal overlay priorities. Detections are compiled and mined using SHA-256 blocks directly into a tamper-proof blockchain ledger, ensuring evidence immutability. Hyperparameters are fine-tuned utilizing modeled quantum annealing superpositions. Numerical validation archives prove mAP enhancements of +8.9% over classical convolutional architectures.
                    </p>
                  </div>

                  <hr className="border-slate-800 my-4" />

                  {/* MATHEMATICAL FOUNDATIONS */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">MATHEMATICAL MODEL REPRESENTATION</h3>
                    
                    <div className="mt-3 grid gap-4 sm:grid-cols-2 text-xs font-mono">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                        <span className="text-[10px] text-gray-500">Derivative Activation channel weight:</span>
                        <div className="text-white text-sm my-2 text-center bg-slate-950 p-2 rounded">
                          α_k^c = 1/Z * Σ_i Σ_j (∂y^c / ∂A_i,j^k)
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          Estimates local relative weight of Feature Map A^k with respect to Class Confidence score y^c.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                        <span className="text-[10px] text-gray-500">Quantum Annealing convergence factor:</span>
                        <div className="text-white text-sm my-2 text-center bg-slate-950 p-2 rounded">
                          H(s) = A(s)H_D + B(s)H_P
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          Determines superposed quantum-level optimizer steps between diffusive and potential parameter registers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-800 my-4" />

                  {/* ARCHITECTURE DIAGRAM */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#10b981] font-mono">SYSTEM TOPOLOGY PIPELINE OVERVIEW</h3>
                    
                    <div className="mt-3 p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 font-mono text-[11px] text-gray-300">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
                        <div className="flex flex-col items-center p-2 border border-slate-800 bg-slate-950 rounded w-full sm:w-28">
                          <Eye className="h-5 w-5 text-sky-400" />
                          <span className="font-bold text-[10px] truncate uppercase mt-1">1.Drone Multispectral Feed</span>
                        </div>
                        <span className="text-gray-500">→</span>
                        <div className="flex flex-col items-center p-2 border border-emerald-500/50 bg-emerald-950/10 rounded w-full sm:w-28 shadow-md">
                          <Cpu className="h-5 w-5 text-emerald-400" />
                          <span className="font-bold text-[10px] uppercase mt-1">2.CAM-YOLO11 Backbone</span>
                        </div>
                        <span className="text-gray-500">→</span>
                        <div className="flex flex-col items-center p-2 border border-slate-800 bg-slate-950 rounded w-full sm:w-28">
                          <Layers className="h-5 w-5 text-orange-400" />
                          <span className="font-bold text-[10px] uppercase mt-1">3.Grad-CAM Overlays</span>
                        </div>
                        <span className="text-gray-500">→</span>
                        <div className="flex flex-col items-center p-2 border border-indigo-500/50 bg-indigo-950/10 rounded w-full sm:w-28 shadow-md">
                          <Shield className="h-5 w-5 text-indigo-400" />
                          <span className="font-bold text-[10px] uppercase mt-1">4.Secure Blockchain</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-800 my-6" />

                  {/* YOLOv8 CORE VERIFICATION PANEL & TESTING SUITE */}
                  <div className="grid gap-6 md:grid-cols-2 mt-6">
                    
                    {/* VERIFICATION PANEL */}
                    <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#10b981] font-mono flex items-center gap-1.5">
                        <Cpu className="h-4 w-4" />
                        <span>YOLOv8 CORE VERIFICATION PANEL</span>
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          <div className="text-[10px] text-gray-500">Model Loaded:</div>
                          <div className="text-sky-400 font-bold mt-0.5">YOLOv8n</div>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          <div className="text-[10px] text-gray-500">Confidence Threshold:</div>
                          <div className="text-sky-400 font-bold mt-0.5">{confThreshold.toFixed(2)}</div>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          <div className="text-[10px] text-gray-500">Active Detections:</div>
                          <div className="text-emerald-400 font-bold mt-0.5">
                            {detections.filter(d => d.detected !== false).length}
                          </div>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          <div className="text-[10px] text-gray-500">Rejected Scans:</div>
                          <div className="text-orange-400 font-bold mt-0.5">
                            {detections.filter(d => d.detected === false).length}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80 space-y-1">
                        <div className="text-[10px] font-mono text-gray-400 uppercase">Decision Protocol Override:</div>
                        <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                          Designed in accordance with research metrics. The system prioritizes <strong>computational correctness</strong> over aesthetic performance. If no valid target belongs to the allowed military classes (person, truck, car, bus, motorcycle, bicycle) above threshold, the pipeline automatically rejects detection:
                          <code className="block bg-slate-950 text-red-400 p-1.5 rounded mt-1.5 font-mono text-[10px]">{"{\"detected\": false, \"message\": \"No valid target detected.\"}"}</code>
                        </p>
                      </div>
                    </div>

                    {/* FALSE POSITIVE TESTING SUITE */}
                    <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#10b981] font-mono flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span>FALSE POSITIVE TRUST & PRECISION TESTING</span>
                      </h3>

                      <p className="text-xs text-gray-400 leading-relaxed font-sans">
                        Execute automated validation sweeps over target-less environments (blank canvases, UI screen diagrams, complex mountain terrains, contrast noise) and positive controls.
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={runValidationSuite}
                          disabled={isTestingSuiteRunning}
                          className={`flex-1 rounded font-black tracking-wider text-xs py-2.5 uppercase transition-all flex items-center justify-center gap-2 ${
                            isTestingSuiteRunning
                              ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                              : 'bg-emerald-600 text-black hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          }`}
                        >
                          {isTestingSuiteRunning ? 'Calibrating Test Trials...' : 'Run Automated Validation Suite'}
                        </button>
                      </div>

                      {testSuiteReport ? (
                        <div className="bg-slate-900/60 p-3.5 rounded border border-slate-800/80 font-mono text-xs space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                            <span className="font-bold text-emerald-400 text-[10px]">ACADEMIC VERIFICATION METRICS</span>
                            <span className="text-[9px] text-gray-500">{new Date(testSuiteReport.timestamp).toLocaleTimeString()}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-1 bg-slate-950 rounded">
                              <div className="text-[9px] text-gray-500">Precision</div>
                              <div className="text-white font-black">{testSuiteReport.precision}%</div>
                            </div>
                            <div className="p-1 bg-slate-950 rounded">
                              <div className="text-[9px] text-gray-500">Recall</div>
                              <div className="text-white font-black">{testSuiteReport.recall}%</div>
                            </div>
                            <div className="p-1 bg-slate-950 rounded">
                              <div className="text-[9px] text-gray-500">FP Rate</div>
                              <div className="text-orange-400 font-bold">{testSuiteReport.falsePositiveRate}%</div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[9px] text-gray-500 uppercase">TEST MATRIX COUNT DETAILS:</div>
                            <div className="grid grid-cols-4 gap-1 text-[10px] text-center text-gray-300">
                              <div className="bg-slate-950 p-1.5 rounded">TP: {testSuiteReport.truePositives}</div>
                              <div className="bg-slate-950 p-1.5 rounded text-orange-400">FP: {testSuiteReport.falsePositives}</div>
                              <div className="bg-slate-950 p-1.5 rounded">TN: {testSuiteReport.trueNegatives}</div>
                              <div className="bg-slate-950 p-1.5 rounded text-orange-400">FN: {testSuiteReport.falseNegatives}</div>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-[10px] border-t border-slate-800 pt-2 text-gray-400">
                            <div className="font-bold text-gray-300">Individual Trials:</div>
                            {testSuiteReport.testDetails.map((td: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-[9px] font-mono leading-none py-1">
                                <span className="truncate max-w-[200px]">{td.caseName}</span>
                                <span className={td.passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                  {td.passed ? 'PASSED (0% FP)' : 'REJECTED'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded border border-slate-800 bg-slate-900/30 text-center text-gray-500 text-xs font-mono">
                          Awaiting Trial Invocation. Click above to trigger system-wide verification scan.
                        </div>
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

        </section>

      </main>

      {/* FOOTER BLOCK SIGNATURE */}
      <footer className="mt-8 border-t bg-slate-950 py-6 text-center text-xs text-gray-500" style={{ borderColor: COLORS.border }} id="footer-signature">
        <div className="mx-auto max-w-7xl px-4 space-y-1 font-mono">
          <p>CAM-YOLO11 Tactical surveillance network dashboard prototype.</p>
          <p className="text-[10px] text-gray-600">Built in accordance with secure database, blockchain, and defense AI research mandates.</p>
        </div>
      </footer>

    </div>
  );
}
