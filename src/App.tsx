import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Eye,
  Database,
  History,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  Clock,
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
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar
} from 'recharts';

// --- STYLING CONSTANTS ---
const COLORS = {
  emerald: 'var(--accent-green)',
  emeraldHover: 'var(--accent-green-hover)',
  emeraldSubtle: 'var(--accent-green-subtle)',
  blue: '#0ea5e9',
  orange: '#f97316',
  red: '#ef4444',
  darkBg: 'var(--bg-primary)',
  cardBg: 'var(--bg-card)',
  sidebarBg: 'var(--bg-sidebar)',
  hoverBg: 'var(--bg-hover)',
  border: 'var(--border-color)',
  borderLight: 'var(--border-light)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)'
};

// ── Animated Bar Chart (pure SVG) ──────────────────────────────────────────
const AnimatedBarChart = ({ data }: { data: { day: string; Scans: number }[] }) => {
  const W = 500, H = 180, PAD = { top: 10, right: 10, bottom: 30, left: 32 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map(d => d.Scans), 1);
  const barW = Math.floor(chartW / data.length * 0.55);
  const gap = chartW / data.length;
  const yTicks = [0, Math.round(maxVal / 2), maxVal];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <style>{`
        @keyframes riseBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        .bar-anim { transform-origin: bottom; animation: riseBar 1.6s cubic-bezier(.22,.68,0,1.2) forwards; }
      `}</style>
      {/* Grid lines */}
      {yTicks.map((t, i) => {
        const y = PAD.top + chartH - (t / maxVal) * chartH;
        return (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#27272a" strokeDasharray="3 3" />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#52525b">{t}</text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.Scans / maxVal) * chartH;
        const x = PAD.left + i * gap + gap / 2 - barW / 2;
        const y = PAD.top + chartH - barH;
        return (
          <g key={i}>
            <rect
              className="bar-anim"
              x={x} y={y} width={barW} height={Math.max(barH, 0)}
              fill="#0ea5e9" rx="3" ry="3"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
            <text x={x + barW / 2} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="9" fill="#52525b">{d.day}</text>
          </g>
        );
      })}
      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH} stroke="#374151" />
      <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH} stroke="#374151" />
    </svg>
  );
};

// ── Animated Line Chart (pure SVG) ──────────────────────────────────────────
const AnimatedLineChart = ({ data }: { data: { sample: string; conf: number }[] }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 500, H = 180, PAD = { top: 10, right: 10, bottom: 30, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = data.length;
  const xStep = n > 1 ? chartW / (n - 1) : chartW;
  const yTicks = [0, 25, 50, 75, 100];
  const pts = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + chartH - Math.max(0, Math.min(d.conf, 100)) / 100 * chartH,
    label: d.sample,
    val: d.conf
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const [pathLen, setPathLen] = React.useState(0);
  useEffect(() => {
    if (svgRef.current) {
      const path = svgRef.current.querySelector('.line-path') as SVGPathElement;
      if (path) setPathLen(path.getTotalLength());
    }
  }, [data]);
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <style>{`
        @keyframes drawLine {
          from { stroke-dashoffset: var(--len); }
          to   { stroke-dashoffset: 0; }
        }
        .line-path { animation: drawLine 2.2s cubic-bezier(.4,0,.2,1) forwards; }
        @keyframes popDot { 0%{r:0;opacity:0} 80%{r:6px} 100%{r:4px;opacity:1} }
        .dot-anim { animation: popDot 0.4s ease forwards; }
      `}</style>
      {/* Grid */}
      {yTicks.map((t, i) => {
        const y = PAD.top + chartH - t / 100 * chartH;
        return (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#27272a" strokeDasharray="3 3" />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#52525b">{t}</text>
          </g>
        );
      })}
      {/* Line */}
      {pts.length > 1 && (
        <path
          className="line-path"
          d={pathD}
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLen || 9999}
          style={{ '--len': `${pathLen || 9999}px` } as React.CSSProperties}
        />
      )}
      {/* Dots */}
      {pts.map((p, i) => (
        <circle
          key={i}
          className="dot-anim"
          cx={p.x} cy={p.y} r="4"
          fill="#f97316" stroke="#f97316"
          style={{ animationDelay: `${0.3 + i * (2.2 / Math.max(n, 1))}s`, opacity: 0 }}
        />
      ))}
      {/* X labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="9" fill="#52525b">{p.label}</text>
      ))}
      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH} stroke="#374151" />
      <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH} stroke="#374151" />
    </svg>
  );
};

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'blockchain' | 'history' | 'analytics'>('dashboard');

  // Stats State
  const [stats, setStats] = useState({
    totalDetections: 0,
    activeThreats: 0,
    todaysScans: 0,
    systemIntegrity: true,
    aiConfidence: 0,
    blockchainBlocks: 0,
    databaseStatus: 'ONLINE (PERSISTENT)',
    sensorFusionDepth: '--'
  });

  // Data State
  const [detections, setDetections] = useState<any[]>([]);
  const [blockchain, setBlockchain] = useState<any[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    remainingTime: number;
    isPaused: boolean;
  }
  const [toasts, setToasts] = useState<Toast[]>([
    {
      id: 'startup',
      type: 'success',
      message: 'Multispectral sensor array online. COSPAS-SARSAT orbiters telemetry established.',
      remainingTime: 3000,
      isPaused: false
    }
  ]);

  const getDismissTime = (type: 'success' | 'error' | 'warning' | 'info'): number => {
    switch (type) {
      case 'success':
        return 3000;
      case 'info':
        return 3000;
      case 'warning':
        return 4000;
      case 'error':
        return 5000;
      default:
        return 3000;
    }
  };

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const dismissTime = getDismissTime(type);
    setToasts((prev) => [...prev, { id, type, message, remainingTime: dismissTime, isPaused: false }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pauseToast = (id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, isPaused: true } : t));
  };

  const resumeToast = (id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, isPaused: false } : t));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prev) => {
        const updated = prev.map((toast) => {
          if (toast.isPaused) return toast;
          const newRemainingTime = toast.remainingTime - 100;
          return { ...toast, remainingTime: newRemainingTime };
        });
        return updated.filter((toast) => toast.remainingTime > 0);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Image Upload Analysis State
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeOverlayMode, setActiveOverlayMode] = useState<'yolo' | 'gradcam' | 'thermal'>('yolo');
  const [gradcamAlpha, setGradcamAlpha] = useState<number>(75);
  const selectedModel = 'yolo11'; // model name fixed, selector removed
  const [confThreshold, setConfThreshold] = useState<number>(0.50);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);

  // === STEP 7: Log selectedDetection every time it changes (render-time verification) ===
  useEffect(() => {
    if (selectedDetection !== null) {
      console.log('=========================');
      console.log('STEP 7 – selectedDetection state changed (render-time)');
      console.log('=========================');
      console.log('[STEP7] selectedDetection            :', JSON.stringify(selectedDetection, null, 2));
      console.log('[STEP7] selectedDetection.detected   :', selectedDetection.detected);
      console.log('[STEP7] typeof .detected             :', typeof selectedDetection.detected);
      console.log('[STEP7] selectedDetection.boundingBoxes:', JSON.stringify(selectedDetection.boundingBoxes));
      console.log('[STEP7] boundingBoxes.length         :', selectedDetection.boundingBoxes?.length);
      console.log('[STEP7] === Render condition check ===');
      console.log('[STEP7] (detected !== false)         :', selectedDetection.detected !== false);
      console.log('[STEP7] (boundingBoxes?.length > 0)  :', (selectedDetection.boundingBoxes?.length ?? 0) > 0);
      console.log('[STEP7] Will render bounding boxes?  :', selectedDetection.detected !== false && (selectedDetection.boundingBoxes?.length ?? 0) > 0);
    }
  }, [selectedDetection]);

  // Reusable timestamp formatter
  const formatTimestampUTC = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const day = String(date.getUTCDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}\n${hours}:${minutes} UTC`;
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const json = await res.json();
      if (json.success && json.data) {
        setSystemLogs(json.data);
      }
    } catch (e) {
      console.error('Failed to sync logs', e);
    }
  };


  // Blockchain Interactivity State
  const [selectedBlockForTamper, setSelectedBlockForTamper] = useState<number | null>(null);
  const [tamperThreatType, setTamperThreatType] = useState('DECRYPTED_SAFE_VEHICLE');
  const [isChainCompromised, setIsChainCompromised] = useState(false);

  // Filters for History
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL');

  // --- DATA SYNCING ---
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
        setIsChainCompromised(!json.data.systemIntegrity);
      }
    } catch (e) {
      console.error('Failed to sync telemetry stats', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const json = await res.json();
      if (json.success && json.data) {
        setDetections(json.data);
      }
    } catch (e) {
      console.error('Failed to sync archives', e);
    }
  };

  const fetchBlockchain = async () => {
    try {
      const res = await fetch('/api/blockchain');
      const json = await res.json();
      if (json.success && json.data) {
        setBlockchain(json.data);
      }
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
      const json = await res.json();
      if (json.success && json.data) {
        const audit = json.data;
        if (audit.isValid) {
          addToast('success', 'Cryptographic security audit fully green! Ledger chains verified to block zero.');
          setIsChainCompromised(false);
        } else {
          addToast('error', `CRITICAL SEC CODE ERROR: Cryptographic link corruption detected starting at Block #${audit.errorBlockIndex}! Evidence logs are compromised.`);
          setIsChainCompromised(true);
        }
        fetchStats();
      }
    } catch (e) {
      addToast('error', 'Failed to broadcast secure blockchain validation sweep.');
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
            addToast('warning', data.message);
      setIsChainCompromised(true);
      fetchStats();
      fetchBlockchain();
    } catch (e) {
      addToast('error', 'Unauthorized sandbox intrusion packet failed.');
    }
  };

  const resetBlockchainChain = async () => {
    try {
      const res = await fetch('/api/blockchain/reset', { method: 'POST' });
      const data = await res.json();
          addToast('success', data.message);
      setIsChainCompromised(false);
      setSelectedBlockForTamper(null);
      fetchStats();
      fetchBlockchain();
      fetchHistory();
    } catch (e) {
      addToast('error', 'Reset protocol denied.');
    }
  };

  // Validate uploaded file
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPG, JPEG, and PNG are supported.';
    }

    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size is ${maxSizeMB} MB.`;
    }

    return null;
  };

  // --- IMAGE ANALYSIS TRIGGER ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      addToast('error', validationError);
      return;
    }

    setUploadError(null);
    setSelectedDetection(null);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
      setCustomFileName(file.name);
      addToast('success', `Multispectral feed loaded: ${file.name}. Ready for CAM-YOLO11 analysis.`);
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

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      addToast('error', validationError);
      return;
    }

    setUploadError(null);
    // Reset previous analysis results
    setSelectedDetection(null);
    setActiveOverlayMode('yolo');
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
      setCustomFileName(file.name);
      addToast('success', `Physical source dropped: ${file.name}. Configured for optical analysis.`);
    };
    reader.readAsDataURL(file);
  };

  const runYoloAnalysis = async () => {
    if (!customImage) {
      addToast('error', 'Please upload an image to analyze.');
      return;
    }

    setIsAnalyzing(true);
    addToast('info', 'Initializing specialized CAM-YOLO11 backbone on target frame...');

    try {
      let base64Part = customImage.split(',')[1];
      let fName = customFileName || 'uploaded_image.jpg';

      // Create abort controller for timeout (180 seconds – matches backend PYTHON_TIMEOUT_MS)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: base64Part,
          fileName: fName,
          modelName: selectedModel,
          threshold: confThreshold
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Parse response
      let json;
      try {
        json = await res.json();
      } catch (parseErr) {
        throw new Error('Invalid JSON response from server');
      }

      if (json.success && json.data) {
        const responseRecord = json.data;

        // === STEP 6: Frontend API response ===
        console.log('=========================');
        console.log('STEP 6 – Frontend: API response received');
        console.log('=========================');
        console.log('[STEP6] json.success                    :', json.success);
        console.log('[STEP6] json.data                       :', JSON.stringify(json.data, null, 2));
        console.log('[STEP6] responseRecord.detected         :', responseRecord.detected);
        console.log('[STEP6] typeof responseRecord.detected  :', typeof responseRecord.detected);
        console.log('[STEP6] responseRecord.boundingBoxes    :', JSON.stringify(responseRecord.boundingBoxes));
        console.log('[STEP6] boxes length                    :', responseRecord.boundingBoxes?.length);
        console.log('[STEP6] responseRecord.confidence       :', responseRecord.confidence);
        console.log('[STEP6] responseRecord.threatType       :', responseRecord.threatType);

        // Update states
        setSelectedDetection(responseRecord);
        if (responseRecord.detected !== false) {
          const count = responseRecord.boundingBoxes?.length ?? 0;
          const targetText = count === 1 ? 'target' : 'targets';
          addToast('success', `Analysis completed! Detections: ${count} ${targetText} locked.`);
        } else {
          addToast('warning', `Inference completed. No valid target detected above ${confThreshold.toFixed(2)} threshold.`);
        }
        fetchStats();
        fetchHistory();
        fetchBlockchain();
        fetchLogs();
      } else {
        console.log('[STEP6-FAIL] json.success is false or json.data is missing');
        console.log('[STEP6-FAIL] json:', JSON.stringify(json));
        throw new Error(json.message || 'Detection failed');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to route frames to YOLOv11 backend.';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      addToast('error', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };


  // --- SYSTEM LOGS TICKERS ---
  const SYSTEM_LOGS = [
    { time: '15:21:04', log: 'Orbit telemetry lock: BEIDOU-3 constellation sync completed.' },
    { time: '15:21:08', log: 'FLIR infra-red channels combined with optical spectrum layers.' },
    { time: '15:21:12', log: 'YOLOv11 model loaded. Detection pipeline initialized.' },
    { time: '15:21:20', log: 'Tamper watchdogs verified. Node #0 (Genesis) validated: 100% OK.' }
  ];

  return (
    <div id="app-root" className="min-h-screen font-sans text-gray-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-400" style={{ backgroundColor: COLORS.darkBg }}>
      
      {/* 1. FUTURISTIC TOP BAR */}
      <header className="border-b px-4 py-5" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, boxShadow: 'var(--shadow-subtle)' }} id="header-bar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border" style={{ backgroundColor: 'var(--accent-green-subtle)', borderColor: 'var(--accent-green)' }}>
              <Radar className="h-5 w-5 animate-pulse" style={{ color: 'var(--accent-green)' }} />
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full" style={{ backgroundColor: 'var(--accent-green)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-widest uppercase sm:text-base" style={{ color: 'var(--text-primary)' }}>CAM-YOLO11</h1>
                
              </div>
            </div>
          </div>

          {/* Updated telemetry readouts with new status labels */}
          <div className="hidden items-center gap-8 text-xs md:flex lg:gap-10">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-green)' }} />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>YOLOv11 ENGINE</div>
                <div className="font-bold" style={{ color: 'var(--accent-green)' }}>ONLINE</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-green)' }} />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>INFERENCE SERVER</div>
                <div className="font-bold" style={{ color: 'var(--accent-green)' }}>ACTIVE</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-green)' }} />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>SQLITE</div>
                <div className="font-bold" style={{ color: 'var(--accent-green)' }}>CONNECTED</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${isChainCompromised ? 'bg-red-500 animate-ping' : 'animate-pulse'}`} style={{ backgroundColor: isChainCompromised ? '#ef4444' : 'var(--accent-green)' }} />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>BLOCKCHAIN</div>
                <div className={`font-bold font-mono text-[11px] ${isChainCompromised ? 'text-red-400' : ''}`} style={{ color: isChainCompromised ? '#f87171' : 'var(--accent-green)' }}>
                  {isChainCompromised ? 'COMPROMISED (TAMPER TRIGGERED)' : 'VERIFIED'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 border-l pl-6" style={{ borderColor: COLORS.border }}>
              <Clock className="h-4 w-4" style={{ color: 'var(--accent-green)' }} />
              <div className="font-mono" style={{ color: 'var(--text-primary)' }}>
                15:21:24 <span className="text-[10px] font-sans" style={{ color: 'var(--text-muted)' }}>UTC</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATIONS CONTAINER */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(120%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in {
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 border-slate-800';
          let border = 'border-l-4';
          let iconColor = 'text-blue-400';
          let borderColor = 'border-l-blue-500';
          
          if (toast.type === 'success') {
            bg = 'bg-emerald-950/95 border-emerald-900/50';
            iconColor = 'text-emerald-400';
            borderColor = 'border-l-emerald-500';
          } else if (toast.type === 'error') {
            bg = 'bg-red-950/95 border-red-900/50';
            iconColor = 'text-red-400';
            borderColor = 'border-l-red-500';
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-950/95 border-amber-900/50';
            iconColor = 'text-amber-400';
            borderColor = 'border-l-amber-500';
          } else if (toast.type === 'info') {
            bg = 'bg-sky-950/95 border-sky-900/50';
            iconColor = 'text-sky-400';
            borderColor = 'border-l-sky-500';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start justify-between gap-3 p-4 rounded-lg border shadow-2xl ${bg} ${border} ${borderColor} transition-all duration-300 animate-slide-in pointer-events-auto`}
              style={{ backdropFilter: 'blur(8px)' }}
              onMouseEnter={() => pauseToast(toast.id)}
              onMouseLeave={() => resumeToast(toast.id)}
            >
              <div className="flex gap-2.5">
                <span className={`mt-0.5 font-bold ${iconColor}`}>
                  {toast.type === 'success' && '✓'}
                  {toast.type === 'error' && '✗'}
                  {toast.type === 'warning' && '⚠'}
                  {toast.type === 'info' && 'ℹ'}
                </span>
                <p className="text-xs font-semibold text-gray-200 font-mono leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-200 transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 2. MAIN GRID LAYOUT */}
      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:flex-row lg:p-6" id="main-content-layout" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        
        {/* SIDE BAR DASHBOARD NAVIGATION */}
        <aside className="w-full shrink-0 lg:w-72" id="sidebar-navigation">
          <div className="sticky top-6 flex flex-col gap-4 border p-3" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-card)' }}>
            
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs tracking-wide transition-all ${
                  activeTab === 'dashboard' 
                    ? 'border-l-4' 
                    : ''
                }`} 
                style={activeTab === 'dashboard' ? {
                  backgroundColor: 'var(--accent-green-subtle)',
                  color: 'var(--accent-green)',
                  borderColor: 'var(--accent-green)',
                  fontWeight: 600
                } : {
                  color: 'var(--text-secondary)',
                  fontWeight: 400
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'dashboard') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'dashboard') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                id="tab-dashboard">
                <Database className="h-4 w-4 shrink-0" style={{ color: activeTab === 'dashboard' ? 'var(--accent-green)' : 'var(--text-secondary)' }} />
                <span className="truncate">Command Deck HUD</span>
              </button>

              <button 
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs tracking-wide transition-all ${
                  activeTab === 'analysis' 
                    ? 'border-l-4' 
                    : ''
                }`} 
                style={activeTab === 'analysis' ? {
                  backgroundColor: 'var(--accent-green-subtle)',
                  color: 'var(--accent-green)',
                  borderColor: 'var(--accent-green)',
                  fontWeight: 600
                } : {
                  color: 'var(--text-secondary)',
                  fontWeight: 400
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'analysis') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'analysis') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                id="tab-analysis">
                <Eye className="h-4 w-4 shrink-0" style={{ color: activeTab === 'analysis' ? 'var(--accent-green)' : 'var(--text-secondary)' }} />
                <span className="truncate">CAM-YOLO11 Analyzer</span>
              </button>


              <button 
                onClick={() => setActiveTab('blockchain')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs tracking-wide transition-all ${
                  activeTab === 'blockchain' 
                    ? 'border-l-4' 
                    : ''
                }`} 
                style={activeTab === 'blockchain' ? {
                  backgroundColor: 'var(--accent-green-subtle)',
                  color: 'var(--accent-green)',
                  borderColor: 'var(--accent-green)',
                  fontWeight: 600
                } : {
                  color: 'var(--text-secondary)',
                  fontWeight: 400
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'blockchain') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'blockchain') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                id="tab-blockchain">
                <Shield className="h-4 w-4 shrink-0" style={{ color: activeTab === 'blockchain' ? 'var(--accent-green)' : 'var(--text-secondary)' }} />
                <span className="truncate">Evidence Integrity Ledger</span>
              </button>

              <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs tracking-wide transition-all ${
                  activeTab === 'history' 
                    ? 'border-l-4' 
                    : ''
                }`}
                style={activeTab === 'history' ? {
                  backgroundColor: 'var(--accent-green-subtle)',
                  color: 'var(--accent-green)',
                  borderColor: 'var(--accent-green)',
                  fontWeight: 600
                } : {
                  color: 'var(--text-secondary)',
                  fontWeight: 400
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'history') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'history') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                id="tab-history"
              >
                <History className="h-4 w-4 shrink-0" style={{ color: activeTab === 'history' ? 'var(--accent-green)' : 'var(--text-secondary)' }} />
                <span className="truncate">Archive & Logs</span>
              </button>

              <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs tracking-wide transition-all ${
                  activeTab === 'analytics' 
                    ? 'border-l-4' 
                    : ''
                }`}
                style={activeTab === 'analytics' ? {
                  backgroundColor: 'var(--accent-green-subtle)',
                  color: 'var(--accent-green)',
                  borderColor: 'var(--accent-green)',
                  fontWeight: 600
                } : {
                  color: 'var(--text-secondary)',
                  fontWeight: 400
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'analytics') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'analytics') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                id="tab-analytics"
              >
                <BarChart3 className="h-4 w-4 shrink-0" style={{ color: activeTab === 'analytics' ? 'var(--accent-green)' : 'var(--text-secondary)' }} />
                <span className="truncate">Analytics Grid</span>
              </button>

            </nav>

            {/* SATELLITE GROUNDING SYSTEM HEALTH */}
            <div className="mt-4" style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 'var(--spacing-unit)' }}>
               <div className="flex justify-between text-[10px] tracking-wider" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '900' }}>
                 <span>SENSOR STATUS</span>
                 <span style={{ color: 'var(--accent-green)' }}>NOMINAL</span>
               </div></div>
              <div className="mt-2 space-y-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between">
                  <span>FLIR Fusion Ratio:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--accent-green)' }}>94.8% OPT</span>
                </div>
                <div className="flex justify-between">
                  <span>SQLite DB Threads:</span>
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>4 Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Ledger validation:</span>
                  <span className={`font-mono font-bold ${isChainCompromised ? 'text-red-400' : ''}`} style={isChainCompromised ? {} : { color: 'var(--accent-green)' }}>
                    {isChainCompromised ? 'FAILING' : 'SECURE'}
                  </span>
                </div>
              </div>
              
              {/* LEDGER FORCE VALIDATION SENSORS */}
              <button
                onClick={triggerAudit}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors"
                style={{ borderColor: 'rgba(14, 165, 233, 0.3)', backgroundColor: 'rgba(15, 23, 42, 0.4)', color: '#38bdf8' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'}
              >
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span>Trigger security Audit</span>
              </button>

          </div>
        </aside>

        {/* 3. CENTER DYNAMIC COMPONENT PANEL */}
        <section className="flex-1 space-y-6" id="center-panel-viewport">
          
          {/* ----- MODULE 1: COMMAND CENTER DECK HUD ----- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in" id="dashboard-hud-view">
              
              {/* TOP PERFORMANCE METRIC OVERLAYS */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="border transition-all h-24 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', padding: 'var(--card-padding)', boxShadow: 'var(--shadow-card)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}>
                  <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--accent-green)' }}>SYS SCANS CARRIED</div>
                  <div className="mt-1 font-mono text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalDetections}</div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Archived in persistent DB</p>
                </div>

                <div className="border transition-all h-24 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', padding: 'var(--card-padding)', boxShadow: 'var(--shadow-card)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-red-500 uppercase">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                    <span>ACTIVE TARGETS</span>
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold text-red-400">{stats.activeThreats}</div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>High / Critical threat rating</p>
                </div>

                <div className="border transition-all h-24 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', padding: 'var(--card-padding)', boxShadow: 'var(--shadow-card)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}>
                  <div className="text-[10px] font-bold tracking-widest text-sky-500 uppercase">SCANS COMPLETED (24H)</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-sky-400">{stats.todaysScans}</div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Tactical orbits sweep</p>
                </div>

                <div className="border transition-all h-24 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', padding: 'var(--card-padding)', boxShadow: 'var(--shadow-card)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}>
                  <div className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">AI CONFIDENCE OVERALL</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-orange-400">{stats.aiConfidence}%</div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Mean probability score</p>
                </div>
              </div>

              {/* MILITARY TARGETING RADAR SWEEP PANELS */}
              <div className="grid gap-6 lg:grid-cols-12">
                
                {/* CYBERNETIC INTEGRATION RADAR MATRIX */}
                <div className="lg:col-span-8 border p-4 relative overflow-hidden flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', height: '420px', boxShadow: 'var(--shadow-card)' }}>
                  <div className="z-10 flex justify-between items-center p-2 rounded border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border }}>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent-green)' }} />
                      <span className="text-[10px] font-bold tracking-widest uppercase font-mono" style={{ color: 'var(--accent-green)' }}>ACTIVE MULTISPECTRAL SECTOR RECON</span>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>BEIDOU LAT: 37.4 / LNG: -122.0</span>
                  </div>

                  {/* RADAR RETICLE CONTAINER */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-70">
                    <div className="relative w-[340px] h-[340px] rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(16, 185, 129, 0.35)' }}>
                      <div className="absolute inset-0 rounded-full border animate-pulse" style={{ borderColor: 'rgba(16, 185, 129, 0.15)' }} />
                      <div className="w-[240px] h-[240px] rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(16, 185, 129, 0.45)' }}>
                        <div className="w-[140px] h-[140px] rounded-full border border-dotted" style={{ borderColor: 'rgba(16, 185, 129, 0.55)' }} />
                      </div>
                      
                      {/* Crosshairs axis lines */}
                      <div className="absolute h-full w-[1px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.35)' }} />
                      <div className="absolute w-full h-[1px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.35)' }} />
                      
                      {/* Interactive Radar Vector sweeping sweep */}
                      <div className="absolute w-[170px] h-[170px] bg-gradient-to-tr from-emerald-500/0 to-emerald-500/15 origin-bottom-left bottom-1/2 left-1/2 animate-radar" style={{ transformOrigin: '0% 100%', backgroundImage: 'linear-gradient(to top right, transparent, rgba(16, 185, 129, 0.15))' }} />
                      
                      {/* Active detected threat blips mapped from selectedDetection boundingBoxes */}
                      {customImage && selectedDetection && selectedDetection.detected !== false && selectedDetection.boundingBoxes && selectedDetection.boundingBoxes.length > 0 ? (
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
                              <span className="text-[8px] px-1.5 py-0.5 rounded font-mono mt-1 font-bold whitespace-nowrap" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#f87171', boxShadow: 'var(--shadow-subtle)' }}>
                                TRG-{idx + 1}: {boxObj.label.split(':')[1]?.trim() || boxObj.label}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="font-mono text-[10px] px-2 py-1 rounded z-10" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, color: 'var(--text-muted)' }}>
                            No active targets.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="z-10 flex justify-between items-end">
                    <div className="p-3 rounded font-mono text-[10px] space-y-1 border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, color: 'var(--text-secondary)' }}>
                      <div className="font-bold" style={{ color: 'var(--accent-green)' }}>RADAR EMISSION STATUS: ACTIVE</div>
                      <div>FREQUENCY: 9.42 GHz (Multimode)</div>
                      <div>PULSE WIDTH: 0.12 μs | ANGLE: 312.4°</div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('analysis')}
                      className="rounded-lg px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all"
                      style={{ backgroundColor: 'var(--accent-green)', color: '#000' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-green-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-green)'}
                    >
                      ENGAGE CAM-YOLO BACKBONE
                    </button>
                  </div>
                </div>

                {/* TELEMETRY TICKS & BLOCK DETAILS */}
                <div className="lg:col-span-4 border p-4 flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-card)' }}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Terminal className="h-4 w-4" style={{ color: 'var(--accent-green)' }} />
                      <span>SURVEILLANCE ACTIVITY LOG</span>
                    </h3>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Live operational event stream</p>
                  </div>

                  {/* LOG ENTRIES */}
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[220px] font-mono text-[11px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent" style={{ color: 'var(--text-primary)' }}>
                    {systemLogs.length > 0 ? (
                      systemLogs.map((item: any, idx: number) => (
                        <div key={idx} className="border-b pb-1.5 flex gap-2" style={{ borderColor: COLORS.border }}>
                          <span className="font-bold shrink-0" style={{ color: 'var(--accent-green)' }}>[{item.time}]</span>
                          <span className={`font-bold shrink-0 ${
                            item.severity === 'ERROR' ? 'text-red-400' : 
                            item.severity === 'WARNING' ? 'text-orange-400' : 
                            ''
                          }`} style={item.severity !== 'ERROR' && item.severity !== 'WARNING' ? { color: 'var(--accent-green)' } : {}}>
                            [{item.severity}]
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>{item.message || item.log}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 space-y-2">
                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>System Ready</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Waiting for reconnaissance scan...</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Upload an image to begin analysis.</div>
                      </div>
                    )}
                  </div>

                  {/* SECURE BLOCKCHAIN SHORT DET BRIEF */}
                  <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border }}>
                    <div className="flex justify-between items-center text-[10px] tracking-wider font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                      <span>LEDGER SUMMARY</span>
                      <span className="px-1.5 rounded text-[9px]" style={{ backgroundColor: isChainCompromised ? 'rgba(127, 29, 29, 0.5)' : 'rgba(16, 185, 129, 0.15)', color: isChainCompromised ? '#f87171' : 'var(--accent-green)' }}>
                        {isChainCompromised ? 'HACK_ALERT' : 'VERIFIED'}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] font-mono" style={{ color: 'var(--text-primary)' }}>
                      <div className="flex justify-between">
                        <span>LEDGER BLOCKS:</span>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>#{blockchain.length}</span>
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
                      className="mt-3 w-full rounded-lg px-3 py-2.5 text-center text-xs font-bold transition-colors"
                      style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      Enter Blockchain Security Module
                    </button>
                  </div>

                </div>
              </div>

              {/* DENSE CAMOUFLAGE KNOWLEDGE BLOCK SUMMARY */}
              <div className="border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)' }} id="summary-urop-box">
                <div className="flex gap-4">
                  <div className="rounded p-2 h-fit border" style={{ backgroundColor: 'var(--accent-green-subtle)', color: 'var(--accent-green)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                    <Info className="h-5 w-5" />
                  </div>
                  <div>

                    <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>

                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ----- MODULE 2 & 4: CAM-YOLO11 IMAGE ANALYZER + GRAD-CAM ----- */}
          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-fade-in" id="image-analyzer-view">
              
              <div className="border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-card)' }}>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Eye className="h-5 w-5" style={{ color: 'var(--accent-green)' }} />
                    <span>CAM-YOLO11 INTELLIGENCE COMPILATION PIPELINE</span>
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload drone recon frames for multispectral camouflage classification.</p>
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-12">

                  {/* LEFT CONTROLS PANEL */}
                  <div className="lg:col-span-4 flex flex-col gap-4">

                    {/* MODEL ENGINE CHOOSER & TRIGGER */}
                    <div className="rounded-lg p-3 border space-y-4" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border }}>
                       <div className="text-[10px] tracking-wide font-black uppercase mb-1" style={{ color: 'var(--text-muted)' }}>ANALYSIS MODEL ENGINE</div>
                       <p className="text-xs" style={{ color: 'var(--text-primary)' }}>YOLOv11 Military Camouflage Detector</p>
                       <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Model file: models/best.pt</p>
                       <div className="border-t pt-4" style={{ borderColor: COLORS.border }}>
                        <div className="flex items-center justify-between text-[10px] tracking-wide font-black uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                          <span>CONFIDENCE THRESHOLD</span>
                          <span className="font-bold" style={{ color: confThreshold >= 0.70 ? 'var(--accent-green)' : '#f97316' }}>
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
                          className="w-full h-1 rounded-lg appearance-none cursor-pointer transition-all"
                          style={{ backgroundColor: 'var(--bg-hover)', accentColor: 'var(--accent-green)' }}
                        />
                        <div className="flex justify-between text-[9px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                          <span>0.10</span>
                          <span className="text-[8px] px-1 rounded" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, color: 'var(--text-secondary)' }}>Rejects &lt; 0.50</span>
                          <span>0.95</span>
                        </div>
                      </div>

                      {/* DETECT COMPILATION BUTTON */}
                      <button
                        onClick={runYoloAnalysis}
                        disabled={isAnalyzing}
                        className="w-full rounded font-black tracking-wider text-xs py-2.5 uppercase transition-all flex items-center justify-center gap-2"
                        style={isAnalyzing ? {
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-muted)',
                          cursor: 'not-allowed'
                        } : {
                          backgroundColor: 'var(--accent-green)',
                          color: '#000'
                        }}
                        onMouseEnter={(e) => {
                          if (!isAnalyzing) e.currentTarget.style.backgroundColor = 'var(--accent-green-hover)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isAnalyzing) e.currentTarget.style.backgroundColor = 'var(--accent-green)';
                        }}
                      >
                        {isAnalyzing ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4" />
                        )}
                        <span>{isAnalyzing ? 'Running YOLOv11 Inference...' : 'RUN PIPELINE ANALYSIS'}</span>
                      </button>
                    </div>

                    {/* PHYSICAL UPLOAD CHARRING BOX */}
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors`}
                      style={uploadError 
                        ? { borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(127, 29, 29, 0.05)' } 
                        : customImage 
                          ? { borderColor: 'rgba(16, 185, 129, 0.5)', backgroundColor: 'rgba(16, 185, 129, 0.05)' } 
                          : { borderColor: COLORS.border, backgroundColor: 'rgba(15, 23, 42, 0.2)' }
                      }
                      onMouseEnter={(e) => {
                        if (!uploadError && !customImage) {
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!uploadError && !customImage) {
                          e.currentTarget.style.borderColor = COLORS.border;
                        }
                      }}
                    >
                      <input 
                        type="file" 
                        id="image-file-uploader" 
                        accept="image/jpeg,image/png,image/jpg" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                      <label htmlFor="image-file-uploader" className="cursor-pointer space-y-2 block">
                        <Upload className="h-6 w-6 mx-auto" style={{ color: '#38bdf8' }} />
                        <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {customImage ? 'Custom image loaded' : 'Drag & drop custom recon photo'}
                        </div>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Supports PNG, JPG, JPEG up to 10MB</p>
                      </label>
                      {customImage && (
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded truncate max-w-[150px] font-mono" style={{ backgroundColor: 'var(--accent-green-subtle)', color: 'var(--accent-green)' }}>
                            {customFileName}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setCustomImage(null);
                              setCustomFileName('');
                              setUploadError(null);
                            }} 
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {uploadError && (
                        <div className="mt-2 text-[10px] text-red-400 font-bold">{uploadError}</div>
                      )}
                    </div>

                    {/* DYNAMIC SYSTEM DIAGNOSTIC PANEL */}
                    <div className="rounded-lg border p-3.5 space-y-3 font-mono text-[10px]" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border }}>
                      <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: COLORS.border }}>
                        <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--accent-green)' }}>YOLOv11 Core Engine</span>
                        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-green)' }} />
                      </div>
                      
                      <div className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>MODEL LOADED:</span>
                          <span className="block font-bold" style={{ color: 'var(--text-primary)' }}>YOLOv11-Military-Camo (Ultralytics v11)</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>SPEC WEIGHTS:</span>
                          <span className="block break-all" style={{ color: 'var(--accent-green)' }}>models/best.pt</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>IMAGE ENDPOINT:</span>
                          <span className="block" style={{ color: '#60a5fa' }}>POST /api/detect</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>VIDEO ENDPOINT:</span>
                          <span className="block" style={{ color: '#22d3ee' }}>POST /api/detect-video</span>
                        </div>
                        <div className="border-t pt-1.5" style={{ borderColor: COLORS.border }}>
                          <span className="block mb-1" style={{ color: 'var(--text-muted)' }}>DETECTION OUTPUT SCHEMATIC:</span>
                          <pre className="border p-1.5 rounded text-[9px] overflow-x-auto whitespace-pre" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, color: 'var(--accent-green)' }}>
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
                    <div className="flex flex-wrap gap-1 p-1.5 rounded-lg border justify-between items-center" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border }}>
                      <div className="flex gap-1">
                        {(['yolo', 'gradcam', 'thermal'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setActiveOverlayMode(mode)}
                            className="px-3 py-1.5 rounded text-xs transition-all uppercase tracking-wider font-bold"
                            style={activeOverlayMode === mode
                              ? {
                                  backgroundColor: 'var(--accent-green-subtle)',
                                  color: 'var(--accent-green)',
                                  borderColor: 'rgba(16, 185, 129, 0.2)'
                                }
                              : {
                                  color: 'var(--text-secondary)',
                                  borderColor: 'transparent'
                                }
                            }
                            onMouseEnter={(e) => {
                              if (activeOverlayMode !== mode) {
                                e.currentTarget.style.color = 'var(--text-primary)';
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (activeOverlayMode !== mode) {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {mode === 'yolo' ? 'YOLO Coordinates' :
                             mode === 'gradcam' ? 'Grad-CAM Attention' :
                             'Thermal spectrum'}
                          </button>
                        ))}
                      </div>

                      {/* Gradcam Slider */}
                      {activeOverlayMode === 'gradcam' && (
                        <div className="flex items-center gap-2 px-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                          <span>Alpha:</span>
                          <input 
                            type="range" 
                            min="20" 
                            max="95" 
                            value={gradcamAlpha}
                            onChange={(e) => setGradcamAlpha(Number(e.target.value))}
                            className="w-16 h-1 rounded" 
                            style={{ accentColor: 'var(--accent-green)', backgroundColor: 'var(--bg-hover)' }}
                          />
                          <span>{gradcamAlpha}%</span>
                        </div>
                      )}
                    </div>

                    {/* SCREEN CANVAS WORKSPACE AREA */}
                    <div className="relative w-full h-[360px] border overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)' }}>
                      
                      {/* Grid crosshair visual graphics */}
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10 pointer-events-none">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div key={i} className="border border-emerald-500" />
                        ))}
                      </div>

                      {/* Loading State */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                          <div className="text-center">
                            <RefreshCw className="h-8 w-8 mx-auto animate-spin mb-2" style={{ color: 'var(--accent-green)' }} />
                            <div className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>Running YOLOv11 Analysis...</div>
                          </div>
                        </div>
                      )}

                      {/* Error State */}
                      {uploadError && !customImage && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center px-4">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" style={{ color: '#ef4444' }} />
                            <div className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{uploadError}</div>
                          </div>
                        </div>
                      )}

                      {/* No Image State */}
                      {!customImage && !isAnalyzing && !uploadError && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center px-4">
                            <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" style={{ color: 'var(--text-muted)' }} />
                            <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Upload an image to begin analysis</div>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Scenery Drawing or custom Base64 image display */}
                      {customImage && !isAnalyzing && (
                        <img 
                          src={customImage} 
                          alt="Surveillance analysis" 
                          className={`w-full h-full object-cover transition-all ${
                            activeOverlayMode === 'thermal' ? 'hue-rotate-180 invert brightness-110 saturate-150' : ''
                          }`} 
                        />
                      )}

                      {/* 1. YOLO BOUNDING BOX COORDINATES OVERLAY */}
                      {activeOverlayMode === 'yolo' && customImage && selectedDetection && selectedDetection.boundingBoxes && selectedDetection.boundingBoxes.length > 0 && (
                        <>
                          {selectedDetection.boundingBoxes.map((boxObj: any, idx: number) => {
                            const [ymin, xmin, ymax, xmax] = boxObj.box;
                            // Generate different colors for each bounding box
                            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
                            const boxColor = colors[idx % colors.length];
                            const bgColor = boxColor + '1A'; // 10% opacity
                            const shadowColor = boxColor + '33'; // 20% opacity
                            
                            return (
                              <div 
                                key={boxObj.id || idx} 
                                className="absolute border-2 flex flex-col justify-between"
                                style={{
                                  top: `${ymin}%`,
                                  left: `${xmin}%`,
                                  height: `${ymax - ymin}%`,
                                  width: `${xmax - xmin}%`,
                                  transition: 'all 0.3s ease',
                                  borderColor: boxColor,
                                  backgroundColor: bgColor,
                                  boxShadow: `0 0 15px ${shadowColor}`
                                }}
                              >
                                <div className="absolute -top-5 left-0 text-black text-[9px] font-black uppercase font-mono px-1 py-0.5 whitespace-nowrap rounded" style={{ backgroundColor: boxColor }}>
                                  {boxObj.label} • {(boxObj.confidence * 100).toFixed(1)}%
                                </div>
                                <div className="p-1 border-b border-r font-mono text-[9px] self-start" style={{ borderColor: boxColor, color: boxColor, backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
                                  [{xmin.toFixed(1)}%, {ymin.toFixed(1)}%]
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}

                      {/* No detections message */}
                      {activeOverlayMode === 'yolo' && customImage && selectedDetection && (!selectedDetection.boundingBoxes || selectedDetection.boundingBoxes.length === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="font-mono text-xs px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: COLORS.border, color: 'var(--text-muted)' }}>
                            {selectedDetection.detected === false ? 'No detections found' : 'No bounding boxes available'}
                          </div>
                        </div>
                      )}

                      {/* YOLO placeholder before analysis */}
                      {activeOverlayMode === 'yolo' && !customImage && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="font-mono text-xs px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: COLORS.border, color: 'var(--text-muted)' }}>
                            Upload an image to view YOLO coordinates
                          </div>
                        </div>
                      )}

                      {/* 2. GRAD-CAM ACTIVATION ATTENTION OVERLAY */}
                      {activeOverlayMode === 'gradcam' && customImage && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}>
                            {selectedDetection && selectedDetection.detected !== false && selectedDetection.gradcamHeatmapUrl ? (
                              <img 
                                src={selectedDetection.gradcamHeatmapUrl} 
                                className="w-full h-full object-cover mix-blend-screen" 
                                style={{ opacity: gradcamAlpha / 100 }}
                                alt="Grad-CAM visual attention heatmap overlaid on recon"
                              />
                            ) : (
                              <div className="font-mono text-xs px-3.5 py-2 rounded-lg pointer-events-auto" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: COLORS.border, color: 'var(--text-muted)', boxShadow: 'var(--shadow-subtle)' }}>
                                No Grad-CAM available.
                              </div>
                            )}
                          </div>
                          
                          {/* Math indicator HUD in bottom corners */}
                          <div className="absolute right-3 bottom-3 border p-2.5 rounded font-mono text-[9px] max-w-xs space-y-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: COLORS.border, color: 'var(--text-secondary)' }}>
                            <div className="font-bold" style={{ color: 'var(--accent-green)' }}>Grad-CAM Gradient Math:</div>
                            <div>L_CAM = ReLU(Σ_k α_k * A_k)</div>
                            <div>where α_k = 1/Z Σ_i Σ_j ∂y^c / ∂A_i,j^k</div>
                            <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Derivative channel weighting applied to Conv Layer 11</div>
                          </div>
                        </>
                      )}

                      {/* Grad-CAM placeholder before analysis */}
                      {activeOverlayMode === 'gradcam' && !customImage && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="font-mono text-xs px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: COLORS.border, color: 'var(--text-muted)' }}>
                            Upload an image to view Grad-CAM attention
                          </div>
                        </div>
                      )}

                      {/* 3. THERMAL SPECTRUM SENSOR FUSION */}
                      {activeOverlayMode === 'thermal' && customImage && (
                        <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-65 bg-gradient-to-br from-indigo-950 via-purple-900 to-amber-700">
                          {/* Simulated warm pixel areas around detected coordinates */}
                          <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] p-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)', color: 'var(--accent-green)' }}>
                            <div className="absolute top-4 left-4 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: COLORS.border }}>
                              CTR THERMAL: UNLOCK FUSION CHL-08
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Thermal placeholder before analysis */}
                      {activeOverlayMode === 'thermal' && !customImage && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="font-mono text-xs px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: COLORS.border, color: 'var(--text-muted)' }}>
                            Upload an image to view thermal spectrum
                          </div>
                        </div>
                      )}

                      {/* Target crosshair locator ring */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-sky-500/20 w-32 h-32 rounded-full animate-pulse flex items-center justify-center pointer-events-none">
                        <Crosshair className="h-4 w-4 text-sky-400/50" />
                      </div>

                    </div>

                    {/* HUD CORNER DETAILS GRID */}
                    {customImage && selectedDetection && (
                      <div className="border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)' }} id="detection-pipeline-hud">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3" style={{ borderColor: COLORS.border }}>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--accent-green)' }}>MITIGATION REPORT LOCKED</div>
                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedDetection.threatType}</h3>
                          </div>
                          <span className="font-bold font-mono px-2.5 py-1 text-xs border uppercase" style={{ backgroundColor: 'rgba(127, 29, 29, 0.5)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            THREAT: {selectedDetection.tacticalAnalysis?.threatRating || 'HIGH'}
                          </span>
                        </div>

                        {/* Detection Summary Panel */}
                        {selectedDetection.boundingBoxes && selectedDetection.boundingBoxes.length > 0 && (
                          <div className="mb-4 p-3 rounded border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border }}>
                            <div className="text-[9px] uppercase tracking-wider font-mono mb-2" style={{ color: 'var(--text-muted)' }}>DETECTION SUMMARY</div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <div className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Objects</div>
                                <div className="font-mono text-lg font-black" style={{ color: 'var(--accent-green)' }}>
                                  {selectedDetection.boundingBoxes.length}
                                </div>
                              </div>
                              <div>
                                <div className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Highest Confidence</div>
                                <div className="font-mono text-lg font-black" style={{ color: '#3b82f6' }}>
                                  {(Math.max(...selectedDetection.boundingBoxes.map((b: any) => b.confidence)) * 100).toFixed(1)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Average Confidence</div>
                                <div className="font-mono text-lg font-black" style={{ color: '#f59e0b' }}>
                                  {(selectedDetection.boundingBoxes.reduce((sum: number, b: any) => sum + b.confidence, 0) / selectedDetection.boundingBoxes.length * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-3 text-xs">
                          <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border }}>
                            <div className="text-[9px] uppercase tracking-wider font-mono mb-1" style={{ color: 'var(--text-muted)' }}>CONCEALMENT METRIC</div>
                            <div className="font-mono text-base font-black" style={{ color: 'var(--text-primary)' }}>
                              {selectedDetection.tacticalAnalysis?.concealmentScore}%
                            </div>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>YOLO visual camou match ratio</p>
                          </div>

                          <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border }}>
                            <div className="text-[9px] uppercase tracking-wider font-mono mb-1" style={{ color: 'var(--text-muted)' }}>SENSOR FUSION ASSIGN</div>
                            <div className="font-mono text-base font-bold" style={{ color: '#38bdf8' }}>
                              {selectedDetection.tacticalAnalysis?.fusionRatio || '80% VS / 20% TH'}
                            </div>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Dual spectrum alignment balance</p>
                          </div>

                          <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border }}>
                            <div className="text-[9px] uppercase tracking-wider font-mono mb-1" style={{ color: 'var(--text-muted)' }}>BLOCK SECURITY STAMP</div>
                            <div className="font-mono text-[10px] truncate hover:underline cursor-pointer flex items-center gap-1" style={{ color: '#818cf8' }}>
                              <Lock className="h-3 w-3 inline shrink-0" style={{ color: '#6366f1' }} />
                              <span className="truncate">{selectedDetection.blockchainHash}</span>
                            </div>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Secure record reference ledger</p>
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


          {/* ----- MODULE 5: BLOCKCHAIN SECURITY SECURE LEDGER ----- */}
          {activeTab === 'blockchain' && (
            <div className="space-y-6 animate-fade-in" id="blockchain-ledger-view">
              
              <div className="border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-4" style={{ borderColor: COLORS.border }}>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Shield className="h-5 w-5" style={{ color: 'var(--accent-green)' }} />
                      <span>CRYPTOGRAPHIC IMMUTABILITY SURVEILLANCE LEDGER</span>
                    </h2>
                    <p className="text-xs text-gray-400">Zero-trust network architecture ledger. All YOLOv11 detections are mined into blocks with SHA-256 links to prevent unauthorized record erasure.</p>
                  </div>
                  
                  {/* Ledger Reset Utility */}
                  <div className="flex gap-2">
                    <button
                      onClick={triggerAudit}
                      className="rounded-lg bg-sky-950/80 border border-sky-800 px-3 py-2.5 text-xs font-bold text-sky-400 hover:bg-sky-900 transition-colors"
                    >
                      Audit ledger Verification
                    </button>
                    <button
                      onClick={resetBlockchainChain}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-xs font-bold text-gray-300 hover:bg-slate-700 transition-colors"
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
                            className={`w-56 p-4 border transition-all cursor-pointer relative ${
                              selectedBlockForTamper === block.index 
                                ? 'ring-2 ring-emerald-400' 
                                : ''
                            }`}
                            style={isBlockInvalid 
                              ? { backgroundColor: 'rgba(127, 29, 29, 0.6)', borderColor: '#991b1b', color: '#fca5a5', boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)' } 
                              : { backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: COLORS.border }
                            }
                            onMouseEnter={(e) => {
                              if (!isBlockInvalid) e.currentTarget.style.borderColor = COLORS.borderLight;
                            }}
                            onMouseLeave={(e) => {
                              if (!isBlockInvalid) e.currentTarget.style.borderColor = COLORS.border;
                            }}
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
                                <div className="truncate text-white whitespace-pre-line">{formatTimestampUTC(block.timestamp)}</div>
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
                              <div className="absolute inset-0 bg-red-950/10 pointer-events-none border border-red-500/30 animate-pulse" style={{ borderRadius: 'var(--border-radius)' }} />
                            )}
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* CYBER SECURITY OVERWRITE PANEL TRG */}
                {selectedBlockForTamper !== null && (
                  <div className="mt-6 p-4 border grid gap-6 md:grid-cols-2" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)' }}>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#ef4444' }}>
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
                          className="flex-1 rounded-lg px-3 py-2 text-xs uppercase focus:outline-none transition-colors"
                          style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, color: 'var(--text-primary)' }}
                        />
                        <button
                          onClick={executeTamperSimulation}
                          className="rounded-lg bg-red-600 hover:bg-red-500 text-black px-4 py-2.5 font-bold text-xs uppercase transition-colors"
                        >
                          Inject Alteration!
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded border text-xs flex flex-col justify-between font-mono" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderColor: COLORS.border }}>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--accent-green)' }}>CHAIN LINK VERIFICATION METRICS</div>
                        <div className="mt-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
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
                        className="mt-4 w-full rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-2.5 text-center text-[10px] font-mono uppercase text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                      >
                        REKINK LOGS / RECONSTRUCT GENESIS CHAIN
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ----- MODULE 6: HISTORY & ANALYTICS ----- */}

          {/* ----- MODULE 7: PERSISTENT SEARCH HISTORY ----- */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-fade-in" id="history-archives-view">
              
              <div className="border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-4" style={{ borderColor: COLORS.border }}>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <History className="h-5 w-5" style={{ color: 'var(--accent-green)' }} />
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
                        className="rounded-lg pl-8 pr-3 py-2 text-xs w-44 focus:outline-none transition-colors"
                        style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, color: 'var(--text-primary)' }}
                      />
                    </div>

                    <select
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors"
                      style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, color: 'var(--text-secondary)' }}
                    >
                      <option value="ALL">All Threat Levels</option>
                      <option value="CRITICAL">Critical threat Rating</option>
                      <option value="HIGH">High threat Rating</option>
                      <option value="MED">Medium threat Rating</option>
                    </select>
                  </div>
                </div>

                {/* ARCHIVE LOG DATA GRID */}
                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: COLORS.border }}>
                  <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                    <thead>
                      <tr className="border-b font-bold uppercase tracking-wider text-[10px]" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, color: 'var(--text-muted)' }}>
                        <th className="p-3 whitespace-nowrap">Threat type category</th>
                        <th className="p-3 text-center whitespace-nowrap">Confidence</th>
                        <th className="p-3 whitespace-nowrap">Concealment Rating</th>
                        <th className="p-3 whitespace-nowrap">Tactical timestamp</th>
                        <th className="p-3 whitespace-nowrap">Ledger block ID</th>
                        <th className="p-3 text-right whitespace-nowrap">Ledger Verification</th>
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
                            className="cursor-pointer transition-colors"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <td className="p-3 font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                              <span className={`h-2 w-2 rounded-full shrink-0 ${
                                item.tacticalAnalysis?.threatRating === 'CRITICAL' ? 'bg-red-500' :
                                item.tacticalAnalysis?.threatRating === 'HIGH' ? 'bg-orange-500' :
                                'bg-sky-500'
                              }`} />
                              <span className="truncate">{item.threatType}</span>
                            </td>
                            <td className="p-3 text-center text-emerald-400 font-bold whitespace-nowrap">{(item.confidence * 100).toFixed(1)}%</td>
                            <td className="p-3 whitespace-nowrap">{item.tacticalAnalysis?.concealmentScore || 80}% score</td>
                            <td className="p-3 text-gray-400 whitespace-nowrap whitespace-pre-line">{formatTimestampUTC(item.timestamp)}</td>
                            <td className="p-3 text-indigo-400 whitespace-nowrap">Block #{item.blocIndex || idx + 1}</td>
                            <td className="p-3 text-right whitespace-nowrap">
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
                    <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No Detection Timeline Available</div>
                      <div className="text-[10px] mt-1">Upload images to generate detection history</div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ----- MODULE 8: HISTORICAL MULTISPECTRAL ANALYTICS ----- */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in" id="analytics-grid-view">
              
              <div className="border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border, borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-card)' }}>
                <div className="border-b pb-4 mb-4" style={{ borderColor: COLORS.border }}>
                  <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <BarChart3 className="h-5 w-5" style={{ color: 'var(--accent-green)' }} />
                    <span>MULTISPECTRAL HISTORICAL STATISTICAL PANELS</span>
                  </h2>
                  <p className="text-xs text-gray-400">Core analytics charts compiling target classifications, sensor distributions, and classification accuracy curves.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* BAR CHART: DAILY SCANS TREND — pure SVG */}
                  <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border }}>
                    <div className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>TELEMETRY SCANS PROCESS RATE</div>
                    <div className="w-full text-xs font-mono" style={{ color: 'var(--text-muted)', height: 200 }}>
                      {(() => {
                        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                        const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
                        const generated = last7.map(date => ({ day: dayNames[date.getDay()], Scans: detections.filter(d => new Date(d.timestamp).toDateString() === date.toDateString()).length }));
                        const total = generated.reduce((s, x) => s + x.Scans, 0);
                        const chartData = total === 0 ? generated.map(x => ({ ...x, Scans: x.day === 'Sun' ? 8 : 0 })) : generated;
                        return <AnimatedBarChart data={chartData} />;
                      })()}
                    </div>
                  </div>

                  {/* RADAR CHART: THREAT CLASSIFICATIONS WEIGHT */}
                  <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border }}>
                    <div className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>SENSOR THREAT MULTI-FACET CLASSIFICATIONS</div>
                    <div className="h-[200px] w-full text-xs font-mono relative" style={{ color: 'var(--text-muted)' }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={detections.length > 0 ? Array.from(new Set(detections.map(d => d.threatType || d.label))).map(label => ({ label, count: detections.filter(d => (d.threatType || d.label) === label).length })) : [
                          { label: 'Infantry', count: 5 },
                          { label: 'Drone', count: 8 },
                          { label: 'Camo Sniper', count: 3 },
                          { label: 'Armored Vehicle', count: 6 },
                          { label: 'Strategic Base', count: 4 }
                        ]}>
                          <PolarGrid stroke="#27272a" />
                          <PolarAngleAxis dataKey="label" stroke="#52525b" />
                          <PolarRadiusAxis stroke="#27272a" />
                          <RechartsRadar name="Camo Target Weight" dataKey="count" stroke="#38bdf8" fill="#0ea5e9" fillOpacity={0.3} animationDuration={1200} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* LINE CHART: SENSOR ACCURACY CONFORMANCE — pure SVG */}
                  <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border }}>
                    <div className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Ffusion YOLOv11 CONFIDENCE CONFORMANCE</div>
                    <div className="w-full text-xs font-mono" style={{ color: 'var(--text-muted)', height: 200 }}>
                      {(() => {
                        const lineData = detections.length > 0
                          ? detections.map((d, i) => { const v = typeof d.confidence === 'number' ? Math.round(d.confidence * 100) : 0; return { sample: `P_${String(i+1).padStart(2,'0')}`, conf: isNaN(v) ? 0 : v }; })
                          : [{sample:'P_01',conf:0},{sample:'P_02',conf:0},{sample:'P_03',conf:0},{sample:'P_04',conf:0},{sample:'P_05',conf:80},{sample:'P_06',conf:85}];
                        return <AnimatedLineChart data={lineData} />;
                      })()}
                    </div>
                  </div>


                  {/* STATISTICAL SUMMARY KPI OVERLAYS */}
                  <div className="rounded-lg p-4 border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: COLORS.border }}>
                    <div>
                      <div className="text-[10px] font-black tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>MULTISPECTRAL PERFORMANCE EVALUATION</div>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        Surveillance records metrics evaluate optimal thermal fusion convergence averages of <span className="text-emerald-400 font-bold font-mono">--</span>. Classification precision levels are locked into zero-trust secure block chains, completely mitigating record loss.
                      </p>
                    </div>
                    <div className="mt-4 border-t border-slate-900 pt-3 flex justify-between items-center text-xs">
                      <span className="text-gray-500 uppercase font-bold tracking-wider">ANN CONJECTURE PRECISION:</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">--</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>

      {/* FOOTER BLOCK SIGNATURE */}
      <footer className="mt-8 border-t py-6 text-center text-xs" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: COLORS.border, color: 'var(--text-muted)' }} id="footer-signature">
        <div className="mx-auto max-w-7xl px-4 space-y-1 font-mono">
          <p>CAM-YOLO11 Military Camouflage Detection System</p>
          <p>Powered by</p>
          <p>YOLOv11 • React • Express • SQLite • Blockchain</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Built in accordance with secure database and blockchain mandates.</p>
        </div>
      </footer>

    </div>
  );
}
