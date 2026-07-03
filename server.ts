import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  dbServiceInstance, 
  blockchainInstance, 
  processCamouflageImageAI, 
  processCamouflageVideoAI,
  DetectionRecord,
  getSurveillanceLogs,
  addSurveillanceLog,
  runFPTestSuite
} from './server/api.js';

// Setup ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON bodies with 10MB limit for base64 drone frames uploading
app.use(express.json({ limit: '10mb' }));

// --- API ENDPOINTS ---

// 1. System state dashboard stats
app.get('/api/stats', (req, res) => {
  const detections = dbServiceInstance.getDetections();
  
  // Total Scans Carried is the actual size of our database
  const totalScans = detections.length;

  // Active Targets represents only valid accepted detections
  const activeTargetsList = detections.filter(d => d.detected !== false);
  const activeThreats = activeTargetsList.length;
  
  // Today's scans count (detections processed in final 24h)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const todaysScans = detections.filter(d => new Date(d.timestamp).getTime() > oneDayAgo).length;

  // Calculate actual average confidence of accepted detections
  const sumConfId = activeTargetsList.reduce((sum, d) => sum + d.confidence, 0);
  const avgConfidence = activeTargetsList.length > 0 ? (sumConfId / activeTargetsList.length) * 100 : 0.0;

  res.json({
    totalDetections: totalScans,
    activeThreats,
    todaysScans,
    systemIntegrity: blockchainInstance.validateChain().isValid,
    aiConfidence: parseFloat(avgConfidence.toFixed(1)),
    blockchainBlocks: blockchainInstance.chain.length,
    databaseStatus: 'ONLINE (PERSISTENT)',
    sensorFusionDepth: activeThreats > 0 ? '97.2% OPTIMAL' : '0.0% SECURE'
  });
});

// 1b. Fetch dynamic logs from logging engine
app.get('/api/logs', (req, res) => {
  res.json(getSurveillanceLogs());
});

// 1c. Trigger False Positive Testing Suite
app.post('/api/test-suite/run', async (req, res) => {
  try {
    const threshold = req.body.threshold !== undefined ? Number(req.body.threshold) : 0.70;
    const report = await runFPTestSuite(threshold);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch full historical detections log
app.get('/api/history', (req, res) => {
  const detections = dbServiceInstance.getDetections();
  res.json(detections);
});

// 3. Process image upload for camouflaged objects (Strict YOLOv8 Validation)
app.post('/api/detect', async (req, res) => {
  try {
    const { base64, fileName, modelName, threshold } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'Missing image payload (Base64 is required)' });
    }

    const confThreshold = threshold !== undefined ? Number(threshold) : 0.70;

    addSurveillanceLog(`Image uploaded. Filename: ${fileName || 'recon_imaging.jpg'}`);
    addSurveillanceLog(`Inference started on YOLOv8 Core.`);

    // Process image through yolo_pipeline
    const rawResult = await processCamouflageImageAI(base64, fileName, modelName, confThreshold);
    addSurveillanceLog(`Inference completed.`);

    if (rawResult.detected) {
      addSurveillanceLog(`Target accepted: ${rawResult.threatType} (Confidence: ${(rawResult.confidence * 100).toFixed(1)}%).`);
    } else {
      addSurveillanceLog(`Inference scan concluded. ${rawResult.message || 'No valid targets matched.'}`);
    }

    const savedRecord = dbServiceInstance.addDetection(rawResult);
    res.json(savedRecord);
  } catch (error: any) {
    console.error('Error in /api/detect:', error);
    res.status(500).json({ error: error.message || 'Critical surveillance pipeline error' });
  }
});

// 3b. Process video upload trackers (YOLOv11 + Video temporal analysis)
app.post('/api/detect-video', async (req, res) => {
  try {
    const { base64, fileName, modelName } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'Missing video payload (Base64 is required)' });
    }

    const trackingResult = await processCamouflageVideoAI(base64, fileName, modelName);
    res.json(trackingResult);
  } catch (error: any) {
    console.error('Error in /api/detect-video:', error);
    res.status(500).json({ error: error.message || 'Critical video surveillance pipeline error' });
  }
});

// 4. Retrieve entire secure block ledger
app.get('/api/blockchain', (req, res) => {
  res.json(blockchainInstance.chain);
});

// 5. Audit/Verify entire blockchain ledger for alterations
app.post('/api/blockchain/verify', (req, res) => {
  const audit = blockchainInstance.validateChain();
  res.json(audit);
});

// 6. Deliberately tamper with a block to demonstrate military cybersecurity safeguards
app.post('/api/blockchain/tamper', (req, res) => {
  const { index, modifiedThreatType } = req.body;
  if (index === undefined || !modifiedThreatType) {
    return res.status(400).json({ error: 'Missing block index or tampered data' });
  }

  const success = blockchainInstance.tamperBlock(Number(index), modifiedThreatType);
  res.json({ 
    success, 
    message: success 
      ? `Simulated Hack: Block #${index} modified to "${modifiedThreatType}". Ledger hashes are now in conflict.`
      : 'Tamper operation failed. Genesis block or invalid index specified.'
  });
});

// 7. Reset the blockchain state (regenerate Genesis) to restore normal status
app.post('/api/blockchain/reset', (req, res) => {
  // Simple reload database/blockchain
  blockchainInstance.chain = [];
  // Re-create Genesis and reload detections
  // @ts-ignore
  blockchainInstance.createGenesisBlock();
  
  const detections = dbServiceInstance.getDetections();
  // replay blocks to re-establish hashes
  detections.forEach((det) => {
    const block = blockchainInstance.addBlock(det.id, det.threatType, det.confidence, det.id);
    det.blocIndex = block.index;
    det.blockchainHash = block.hash;
  });
  dbServiceInstance.saveDetections(detections);

  res.json({ success: true, message: 'Cryptographic ledger recalibrated, genesis state restored.' });
});

// 8. Quantum Optimization Tuning endpoints
app.get('/api/quantum-simulate', (req, res) => {
  res.json({
    parameterComparison: [
      { epochWeight: 10, standardmAP: 78.4, quantummAP: 86.2, featureFusionLevel: 2 },
      { epochWeight: 30, standardmAP: 82.1, quantummAP: 91.5, featureFusionLevel: 4 },
      { epochWeight: 60, standardmAP: 84.8, quantummAP: 94.8, featureFusionLevel: 5 },
      { epochWeight: 80, standardmAP: 86.3, quantummAP: 96.9, featureFusionLevel: 7 },
      { epochWeight: 100, standardmAP: 87.5, quantummAP: 98.2, featureFusionLevel: 8 }
    ],
    hyperparameterWeights: [
      { name: 'CAM Fusion depth', weight: 42, optimizedWeight: 88, deviation: '+110%' },
      { name: 'Stochastic learning', weight: 35, optimizedWeight: 74, deviation: '+111%' },
      { name: 'Feature map spacing', weight: 18, optimizedWeight: 55, deviation: '+205%' },
      { name: 'Batch-Norm alignment', weight: 65, optimizedWeight: 92, deviation: '+41%' },
      { name: 'Grid convolution grids', weight: 50, optimizedWeight: 85, deviation: '+70%' }
    ]
  });
});

// --- PRODUCTION SERVING ---

// If in production, serve the React build artifacts
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  
  // Route general navigation endpoints to the SPA html page
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Full-Stack military command center operating live on port ${PORT} in production mode`);
  });
}

// Export the app instance for importing inside Vite config dev environment middleware
export default app;
