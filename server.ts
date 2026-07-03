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
  
  const totalScans = detections.length;
  const activeTargetsList = detections.filter(d => d.detected !== false);
  const activeThreats = activeTargetsList.length;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const todaysScans = detections.filter(d => new Date(d.timestamp).getTime() > oneDayAgo).length;
  const sumConfId = activeTargetsList.reduce((sum, d) => sum + d.confidence, 0);
  const avgConfidence = activeTargetsList.length > 0 ? (sumConfId / activeTargetsList.length) * 100 : 0.0;

  res.json({
    success: true,
    data: {
      totalDetections: totalScans,
      activeThreats,
      todaysScans,
      systemIntegrity: blockchainInstance.validateChain().isValid,
      aiConfidence: parseFloat(avgConfidence.toFixed(1)),
      blockchainBlocks: blockchainInstance.chain.length,
      databaseStatus: 'ONLINE (PERSISTENT)'
    }
  });
});

// 1b. Fetch dynamic logs from logging engine
app.get('/api/logs', (req, res) => {
  res.json({ success: true, data: getSurveillanceLogs() });
});

// 1c. Trigger False Positive Testing Suite
app.post('/api/test-suite/run', async (req, res) => {
  try {
    const threshold = req.body.threshold !== undefined ? Number(req.body.threshold) : 0.70;
    const report = await runFPTestSuite(threshold);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Test suite failed', error: err.message });
  }
});

// 2. Fetch full historical detections log
app.get('/api/history', (req, res) => {
  const detections = dbServiceInstance.getDetections();
  res.json({ success: true, data: detections });
});

// 3. Process image upload for camouflaged objects (YOLOv11 Validation)
app.post('/api/detect', async (req, res) => {
  try {
    const { base64, fileName, modelName, threshold } = req.body;
    if (!base64) {
      addSurveillanceLog('Image validation failed: Missing base64 payload', 'ERROR');
      return res.status(400).json({ success: false, message: 'Missing image payload', error: 'Base64 is required' });
    }

    const confThreshold = threshold !== undefined ? Number(threshold) : 0.70;

    addSurveillanceLog(`Image uploaded: ${fileName || 'image.jpg'}`);
    addSurveillanceLog('Detection request received');
    addSurveillanceLog('Inference started on YOLOv11 Core');

    // Process image through yolo_pipeline
    const rawResult = await processCamouflageImageAI(base64, fileName, modelName, confThreshold);
    addSurveillanceLog('Inference completed');

    if (rawResult.detected) {
      addSurveillanceLog(`Target accepted: ${rawResult.threatType} (Confidence: ${(rawResult.confidence * 100).toFixed(1)}%)`);
    } else {
      addSurveillanceLog(`No valid target detected: ${rawResult.message || 'No targets matched threshold'}`, 'WARNING');
    }

    const savedRecord = dbServiceInstance.addDetection(rawResult);
    addSurveillanceLog('Detection stored in database');
    if (savedRecord.detected !== false) {
      addSurveillanceLog(`Blockchain record created (Block #${savedRecord.blocIndex})`);
    }
    addSurveillanceLog('History updated');
    res.json({ success: true, data: savedRecord });
  } catch (error: any) {
    const errMsg = error.message || 'Unknown error';
    if (errMsg.includes('timeout')) {
      addSurveillanceLog('Detection timeout', 'ERROR');
    } else if (errMsg.includes('python3') || errMsg.includes('Python')) {
      addSurveillanceLog('Python pipeline unavailable', 'ERROR');
    } else {
      addSurveillanceLog(`Critical surveillance pipeline error: ${errMsg}`, 'ERROR');
    }
    console.error('Error in /api/detect:', error);
    res.status(500).json({ success: false, message: 'Critical surveillance pipeline error', error: error.message });
  }
});

// 3b. Process video upload trackers (YOLOv11 + Video temporal analysis)
app.post('/api/detect-video', async (req, res) => {
  try {
    const { base64, fileName, modelName } = req.body;
    if (!base64) {
      return res.status(400).json({ success: false, message: 'Missing video payload', error: 'Base64 is required' });
    }

    const trackingResult = await processCamouflageVideoAI(base64, fileName, modelName);
    res.json({ success: true, data: trackingResult });
  } catch (error: any) {
    console.error('Error in /api/detect-video:', error);
    res.status(500).json({ success: false, message: 'Critical video surveillance pipeline error', error: error.message });
  }
});

// 4. Retrieve entire secure block ledger
app.get('/api/blockchain', (req, res) => {
  res.json({ success: true, data: blockchainInstance.chain });
});

// 5. Audit/Verify entire blockchain ledger for alterations
app.post('/api/blockchain/verify', (req, res) => {
  const audit = blockchainInstance.validateChain();
  res.json({ success: true, data: audit });
});

// 6. Deliberately tamper with a block to demonstrate security safeguards
app.post('/api/blockchain/tamper', (req, res) => {
  const { index, modifiedThreatType } = req.body;
  if (index === undefined || !modifiedThreatType) {
    return res.status(400).json({ success: false, message: 'Missing block index or tampered data', error: 'Invalid request' });
  }

  const success = blockchainInstance.tamperBlock(Number(index), modifiedThreatType);
  res.json({ 
    success, 
    message: success 
      ? `Block #${index} modified to "${modifiedThreatType}". Ledger hashes are now in conflict.`
      : 'Tamper operation failed. Genesis block or invalid index specified.'
  });
});

// 7. Reset the blockchain state (regenerate Genesis)
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

  res.json({ success: true, message: 'Blockchain recalibrated, genesis state restored.' });
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
