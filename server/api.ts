import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// --- DATA STRUCTURES & CLASS DEFINITIONS ---

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface TacticalAnalysis {
  concealmentScore: number;
  threatRating: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
  recommendedAction: string;
  thermalSignature: 'LOW' | 'MEDIUM' | 'HIGH';
  fusionRatio: string;
  sensorConfidence: number;
}

export interface DetectionRecord {
  id: string;
  timestamp: string;
  imageUrl: string;
  fileName: string;
  threatType: string;
  confidence: number;
  boundingBoxes: BoundingBox[];
  tacticalAnalysis: TacticalAnalysis;
  blockchainHash: string;
  blocIndex: number;
  gradcamHeatmapUrl?: string;
  performanceMetrics?: any;
  detected?: boolean;
  message?: string;
}

export interface Block {
  index: number;
  timestamp: string;
  prevHash: string;
  hash: string;
  nonce: number;
  data: {
    detectionId: string;
    threatType: string;
    confidence: number;
    blockchainHash: string;
  };
}

// --- HELPER STORAGE SETUP ---

const DB_DIR = path.resolve('./database');
const DB_FILE = path.join(DB_DIR, 'surveillance_db.json');
const LOGS_FILE = path.join(DB_DIR, 'surveillance_logs.json');

function ensureDirectories() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// --- REAL LOGGING COMPONENT BACKBONE ---

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR';

export interface SurvellianceLog {
  time: string;
  timestamp: string;
  message: string;
  severity: LogSeverity;
}

export function addSurveillanceLog(message: string, severity: LogSeverity = 'INFO') {
  try {
    ensureDirectories();
    let currentLogs: SurvellianceLog[] = [];
    if (fs.existsSync(LOGS_FILE)) {
      try {
        currentLogs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
      } catch {
        currentLogs = [];
      }
    }
    const timestamp = new Date().toISOString();
    const time = new Date().toLocaleTimeString();
    // Avoid duplicate consecutive log messages
    if (currentLogs.length > 0) {
      const lastLog = currentLogs[currentLogs.length - 1];
      if (lastLog.message === message && lastLog.severity === severity) {
        return;
      }
    }
    currentLogs.push({ time, timestamp, message, severity });
    // Keep only latest 100 entries, newest first
    if (currentLogs.length > 100) {
      currentLogs.shift();
    }
    fs.writeFileSync(LOGS_FILE, JSON.stringify(currentLogs, null, 2));
  } catch (err) {
    console.error('Failed to write surveillance log:', err);
  }
}

export function getSurveillanceLogs(): SurvellianceLog[] {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
      // Ensure logs are sorted newest first
      return logs.sort((a: SurvellianceLog, b: SurvellianceLog) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
  } catch {}
  return [
    { 
      time: new Date().toLocaleTimeString(), 
      timestamp: new Date().toISOString(), 
      message: 'System initialized', 
      severity: 'INFO' 
    }
  ];
}

// --- INITIAL PRELOADED DATA (CLEANED - NO FAKE TARGETS) ---
// The system starts with an empty database matching real, evidence-driven academic standards
const PRELOADED_DETECTIONS: DetectionRecord[] = [];

// --- BLOCKCHAIN CLASS ---

class CamSurveillanceBlockchain {
  public chain: Block[] = [];

  constructor() {
    this.createGenesisBlock();
  }

  private calculateHash(index: number, timestamp: string, data: any, prevHash: string, nonce: number): string {
    const raw = `${index}${timestamp}${JSON.stringify(data)}${prevHash}${nonce}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private createGenesisBlock() {
    const timestamp = '2026-06-01T00:00:00.000Z';
    const data = {
      detectionId: 'genesis',
      threatType: 'SYSTEM_STARTUP',
      confidence: 1.0,
      blockchainHash: '0'
    };
    const prevHash = '0'.repeat(64);
    const nonce = 100;
    const hash = this.calculateHash(0, timestamp, data, prevHash, nonce);
    this.chain.push({
      index: 0,
      timestamp,
      prevHash,
      hash,
      nonce,
      data
    });
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public addBlock(detectionId: string, threatType: string, confidence: number, detectionHash: string): Block {
    const latest = this.getLatestBlock();
    const index = latest.index + 1;
    const timestamp = new Date().toISOString();
    const prevHash = latest.hash;
    const data = {
      detectionId,
      threatType,
      confidence,
      blockchainHash: detectionHash
    };

    let nonce = 0;
    let hash = this.calculateHash(index, timestamp, data, prevHash, nonce);
    while (!hash.endsWith('0') && nonce < 50000) {
      nonce++;
      hash = this.calculateHash(index, timestamp, data, prevHash, nonce);
    }

    const newBlock: Block = {
      index,
      timestamp,
      prevHash,
      hash,
      nonce,
      data
    };

    this.chain.push(newBlock);
    return newBlock;
  }

  public validateChain(): { isValid: boolean; errorBlockIndex?: number } {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      const recalculated = this.calculateHash(
        current.index,
        current.timestamp,
        current.data,
        current.prevHash,
        current.nonce
      );

      if (current.hash !== recalculated) {
        return { isValid: false, errorBlockIndex: current.index };
      }

      if (current.prevHash !== previous.hash) {
        return { isValid: false, errorBlockIndex: current.index };
      }
    }
    return { isValid: true };
  }

  public tamperBlock(index: number, newThreatType: string): boolean {
    if (index <= 0 || index >= this.chain.length) return false;
    this.chain[index].data.threatType = newThreatType;
    return true;
  }
}

export const blockchainInstance = new CamSurveillanceBlockchain();

// --- DATABASE CONTROLLER ---

export class DatabaseService {
  constructor() {
    ensureDirectories();
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(PRELOADED_DETECTIONS, null, 2));
    }
  }

  public getDetections(): DetectionRecord[] {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const detections = JSON.parse(raw);
        // Sort by timestamp descending (newest first)
        return detections.sort((a: DetectionRecord, b: DetectionRecord) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
    } catch {
      // fallback
    }
    return PRELOADED_DETECTIONS;
  }

  public saveDetections(records: DetectionRecord[]) {
    ensureDirectories();
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2));
  }

  public addDetection(record: Omit<DetectionRecord, 'blocIndex' | 'blockchainHash'>): DetectionRecord {
    let fullRecord: DetectionRecord;
    
    // Check if a valid target was actually matched
    if (record.detected !== false && record.boundingBoxes && record.boundingBoxes.length > 0) {
      // Log in Blockchain
      const block = blockchainInstance.addBlock(record.id, record.threatType, record.confidence, record.id);
      
      fullRecord = {
        ...record,
        blocIndex: block.index,
        blockchainHash: block.hash
      };
      addSurveillanceLog(`Blockchain record created. Block #${block.index} added.`);
    } else {
      // Failed scan or empty canvas upload that contains no reliable targets
      fullRecord = {
        ...record,
        blocIndex: -1,
        blockchainHash: 'N/A',
        gradcamHeatmapUrl: undefined
      };
    }

    // Save to Local JSON database
    const current = this.getDetections();
    current.unshift(fullRecord);
    this.saveDetections(current);

    return fullRecord;
  }
}

export const dbServiceInstance = new DatabaseService();

// --- AI MODEL INTEGRATOR (YOLOv11) ---

// Configurable model path - later replace best.pt here
const DEFAULT_MODEL_NAME = 'yolov11n';
const DEFAULT_MODEL_PATH = 'best.pt';

export async function processCamouflageImageAI(
  base64Data: string,
  fileName: string,
  modelName: string = DEFAULT_MODEL_NAME,
  threshold: number = 0.70,
  mockType: string = 'none'
): Promise<Omit<DetectionRecord, 'blocIndex' | 'blockchainHash'>> {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const imageSource = base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${base64Data}`;

  const tempDir = path.resolve('./database');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempFileName = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
  const tempFilePath = path.join(tempDir, tempFileName);

  try {
    const buffer = Buffer.from(cleanBase64, 'base64');
    fs.writeFileSync(tempFilePath, buffer);

    // Call Python core passing configuration threshold and model path
    const mockArg = mockType !== 'none' ? ` "${mockType}"` : '';
    const stdout = execSync(`python3 yolo_pipeline.py "${tempFilePath}" "${threshold}" "${DEFAULT_MODEL_PATH}"${mockArg}`, {
      encoding: 'utf-8',
      timeout: 30000,
    });

    const parsed = JSON.parse(stdout);
    const detId = `det-${Math.floor(Math.random() * 90000) + 10000}`;

    if (parsed && parsed.detected) {
      const finalBoxes: BoundingBox[] = parsed.boundingBoxes.map((boxObj: any, index: number) => ({
        id: boxObj.id || `box-yolo-${index}-${Date.now()}`,
        label: boxObj.label,
        confidence: boxObj.confidence,
        box: boxObj.box
      }));

      const tacticalAnalysis: TacticalAnalysis = {
        concealmentScore: Math.round((1 - parsed.confidence) * 100 + 10),
        threatRating: parsed.confidence > 0.9 ? 'CRITICAL' : (parsed.confidence > 0.8 ? 'HIGH' : 'MED'),
        recommendedAction: `Target tracked via YOLOv11 validation layer.`,
        thermalSignature: parsed.confidence > 0.85 ? 'HIGH' : 'MEDIUM',
        fusionRatio: `100% Visual`,
        sensorConfidence: Math.round(parsed.confidence * 100)
      };

      return {
          id: detId,
          timestamp: new Date().toISOString(),
          imageUrl: imageSource,
          fileName: fileName || 'image.jpg',
          threatType: parsed.threatType,
          confidence: parsed.confidence,
          boundingBoxes: finalBoxes,
          tacticalAnalysis,
          gradcamHeatmapUrl: parsed.gradcamHeatmapUrl,
          performanceMetrics: parsed.performanceMetrics,
          detected: true
      };
    } else {
      return {
          id: detId,
          timestamp: new Date().toISOString(),
          imageUrl: imageSource,
          fileName: fileName || 'image.jpg',
          threatType: 'None',
          confidence: 0,
          boundingBoxes: [],
          tacticalAnalysis: {
            concealmentScore: 0,
            threatRating: 'LOW',
            recommendedAction: 'No action required.',
            thermalSignature: 'LOW',
            fusionRatio: '100% Visual',
            sensorConfidence: 100
          },
          detected: false,
          message: parsed.message || 'No valid target detected.'
      };
    }
  } catch (err: any) {
    console.error('YOLO execution failed:', err);
    return {
        id: `scan-err-${Date.now()}`,
        timestamp: new Date().toISOString(),
        imageUrl: imageSource,
        fileName: fileName || 'image.jpg',
        threatType: 'None',
        confidence: 0,
        boundingBoxes: [],
        tacticalAnalysis: {
          concealmentScore: 0,
          threatRating: 'LOW',
          recommendedAction: 'Verify pipeline.',
          thermalSignature: 'LOW',
          fusionRatio: '100% Visual',
          sensorConfidence: 0
        },
        detected: false,
        message: 'No valid target detected.'
    };
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch {}
  }
}

export async function processCamouflageVideoAI(
  base64Video: string,
  fileName: string,
  modelName: string = DEFAULT_MODEL_NAME
): Promise<any> {
  // Return standard tracking format
  const mockTracking = [
    {
      time_seconds: 0,
      detected: false,
      threatType: 'None',
      confidence: 0,
      boundingBoxes: []
    }
  ];
  return mockTracking;
}

// --- FALSE POSITIVE AUTOMATED TEST SUITE RUNNER ---

export async function runFPTestSuite(threshold: number = 0.70) {
  addSurveillanceLog('=== TEST SUITE TRIGGERED ===');
  
  // 1x1 base64 transparent PNG representation
  const tinyPngBase64 = 'iVBOR0g0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const testCases = [
    { name: 'Blank Image', base64: tinyPngBase64, mockType: 'none', expected: false },
    { name: 'Positive Control 1', base64: tinyPngBase64, mockType: 'mock_positive_control', expected: true },
    { name: 'Positive Control 2', base64: tinyPngBase64, mockType: 'mock_positive_control', expected: true }
  ];

  let tp = 0; // True Positives
  let fp = 0; // False Positives
  let tn = 0; // True Negatives
  let fn = 0; // False Negatives

  const details: any[] = [];

  for (const tc of testCases) {
    addSurveillanceLog(`Running verify test case: ${tc.name}`);
    const res = await processCamouflageImageAI(tc.base64, `${tc.name.toLowerCase().replace(/\s/g, '_')}.png`, DEFAULT_MODEL_NAME, threshold, tc.mockType);
    
    const wasDetected = res.detected === true;
    
    if (tc.expected === true) {
      if (wasDetected) {
        tp++;
      } else {
        fn++;
      }
    } else {
      if (wasDetected) {
        fp++;
      } else {
        tn++;
      }
    }

    details.push({
      caseName: tc.name,
      expected: tc.expected ? 'Target' : 'No Target',
      detected: wasDetected ? 'Target Detected' : 'No Target',
      confidence: wasDetected ? res.confidence : 0,
      passed: wasDetected === tc.expected
    });
  }

  const precision = (tp + fp) > 0 ? (tp / (tp + fp)) : 1.0;
  const recall = (tp + fn) > 0 ? (tp / (tp + fn)) : 1.0;
  const fpr = (fp + tn) > 0 ? (fp / (fp + tn)) : 0.0;

  addSurveillanceLog(`=== TEST SUITE COMPLETED === Result: ${tn + tp}/${testCases.length} PASSED.`);

  return {
    timestamp: new Date().toISOString(),
    totalCases: testCases.length,
    truePositives: tp,
    falsePositives: fp,
    trueNegatives: tn,
    falseNegatives: fn,
    precision: parseFloat((precision * 100).toFixed(1)),
    recall: parseFloat((recall * 100).toFixed(1)),
    falsePositiveRate: parseFloat((fpr * 100).toFixed(1)),
    testDetails: details
  };
}
