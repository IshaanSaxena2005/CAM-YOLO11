import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG, ensureStartupPaths } from './config';
import { execSync } from 'child_process';
import fs from 'fs';
import {
  dbServiceInstance,
  blockchainInstance,
  processCamouflageImageAI,
  processCamouflageVideoAI,
  getSurveillanceLogs,
  addSurveillanceLog,
  runFPTestSuite
} from './server/api.js';

// ─── Shared response helper ───────────────────────────────────────────────────
/**
 * Build a standardised API envelope.
 * Every endpoint always returns { success, message, data, error }.
 */
function ok<T>(data: T, message = 'OK'): { success: true; message: string; data: T; error: null } {
  return { success: true, message, data, error: null };
}
function fail(message: string, error: string | null = null): { success: false; message: string; data: null; error: string | null } {
  return { success: false, message, data: null, error };
}

// ─── App setup ────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = CONFIG.PORT;

ensureStartupPaths();

app.use(express.json({ limit: CONFIG.MAX_UPLOAD_SIZE }));

// ─── Security headers ───────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://localhost:* ws://localhost:*;");
  next();
});

// ─── API Endpoints ────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Purpose : System health check – reports server, DB, blockchain, Python,
 *           and model availability without requiring any body.
 * Request : none
 * Response: { success, message, data: { server, database, blockchain,
 *              python, modelConfigured, modelPath }, error }
 */
app.get('/api/health', (_req, res) => {
  try {
    let pythonAvailable = false;
    try {
      const platform = process.platform as string;
      const pythonCmd = platform === 'win32' ? 'python' : 'python3';
      execSync(`${pythonCmd} --version`, { stdio: 'ignore' });
      pythonAvailable = true;
    } catch {
      pythonAvailable = false;
    }

    const healthData = {
      server: 'running',
      database: fs.existsSync(CONFIG.DATABASE_PATH) ? 'connected' : 'missing',
      blockchain: blockchainInstance.validateChain().isValid ? 'valid' : 'corrupt',
      python: pythonAvailable ? 'available' : 'unavailable',
      modelConfigured: fs.existsSync(CONFIG.MODEL_PATH),
      modelPath: CONFIG.MODEL_PATH
    };

    res.status(200).json(ok(healthData, 'System health check passed'));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail('Health check failed', msg));
  }
});

/**
 * GET /api/stats
 * Purpose : Returns aggregated surveillance dashboard statistics derived from
 *           the detection history and blockchain state.
 * Request : none
 * Response: { success, message, data: { totalDetections, activeThreats,
 *              todaysScans, systemIntegrity, aiConfidence,
 *              blockchainBlocks, databaseStatus }, error }
 */
app.get('/api/stats', (_req, res) => {
  try {
    const detections = dbServiceInstance.getDetections();
    const activeTargets = detections.filter(d => d.detected !== false);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todaysScans = detections.filter(
      d => new Date(d.timestamp).getTime() > oneDayAgo
    ).length;
    const sumConf = activeTargets.reduce((s, d) => s + d.confidence, 0);
    const avgConf =
      activeTargets.length > 0
        ? parseFloat(((sumConf / activeTargets.length) * 100).toFixed(1))
        : 0;

    res.status(200).json(
      ok({
        totalDetections: detections.length,
        activeThreats: activeTargets.length,
        todaysScans,
        systemIntegrity: blockchainInstance.validateChain().isValid,
        aiConfidence: avgConf,
        blockchainBlocks: blockchainInstance.chain.length,
        databaseStatus: 'ONLINE (PERSISTENT)'
      })
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail('Failed to compute dashboard statistics', msg));
  }
});

/**
 * GET /api/logs
 * Purpose : Returns the most recent system surveillance event log entries.
 * Request : none
 * Response: { success, message, data: SurveillanceLog[], error }
 */
app.get('/api/logs', (_req, res) => {
  try {
    const logs = getSurveillanceLogs();
    res.status(200).json(ok(logs, 'Logs retrieved'));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail('Failed to retrieve logs', msg));
  }
});

/**
 * GET /api/history
 * Purpose : Returns the full historical list of detection records stored in
 *           the persistent JSON database, sorted newest-first.
 * Request : none
 * Response: { success, message, data: DetectionRecord[], error }
 */
app.get('/api/history', (_req, res) => {
  try {
    const detections = dbServiceInstance.getDetections();
    res.status(200).json(ok(detections, 'Detection history retrieved'));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail('Failed to retrieve detection history', msg));
  }
});

/**
 * POST /api/detect
 * Purpose : Receives a base64-encoded image, runs it through the YOLOv11
 *           Python pipeline, stores the result in the database and blockchain,
 *           and returns the full detection record.
 * Request : { base64: string, fileName?: string, modelName?: string, threshold?: number }
 * Response: { success, message, data: DetectionRecord, error }
 */
app.post('/api/detect', async (req, res) => {
  try {
    const { base64, fileName, modelName, threshold } = req.body as {
      base64?: unknown;
      fileName?: unknown;
      modelName?: unknown;
      threshold?: unknown;
    };

    if (!base64 || typeof base64 !== 'string' || base64.trim() === '') {
      return res
        .status(400)
        .json(fail('Missing or invalid image payload', 'Field "base64" is required and must be a non-empty string'));
    }

    const safeFileName = typeof fileName === 'string' ? fileName : 'image.jpg';
    const safeModelName = typeof modelName === 'string' ? modelName : undefined;
    const confThreshold =
      threshold !== undefined && !Number.isNaN(Number(threshold))
        ? Math.min(1, Math.max(0, Number(threshold)))
        : CONFIG.CONFIDENCE_THRESHOLD;

    addSurveillanceLog(`Image uploaded: ${safeFileName}`);
    addSurveillanceLog('Detection request received');
    addSurveillanceLog('Inference started on YOLOv11 Core');

    const rawResult = await processCamouflageImageAI(
      base64,
      safeFileName,
      safeModelName,
      confThreshold
    );
    addSurveillanceLog('Inference completed');

    if (rawResult.detected) {
      addSurveillanceLog(
        `Target accepted: ${rawResult.threatType} (Confidence: ${(rawResult.confidence * 100).toFixed(1)}%)`
      );
    } else {
      addSurveillanceLog(
        `No valid target detected: ${rawResult.message ?? 'No targets matched threshold'}`,
        'WARNING'
      );
    }

    const savedRecord = dbServiceInstance.addDetection(rawResult);
    addSurveillanceLog('Detection stored in database');
    if (savedRecord.detected !== false) {
      addSurveillanceLog(`Blockchain record created (Block #${savedRecord.blocIndex})`);
    }
    addSurveillanceLog('History updated');

    const message = rawResult.detected
      ? `Detection complete – ${rawResult.boundingBoxes.length} target(s) identified`
      : 'Inference complete – no targets detected above threshold';

    return res.status(200).json(ok(savedRecord, message));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    if (errMsg.includes('timeout')) {
      addSurveillanceLog('Detection timeout', 'ERROR');
    } else if (errMsg.toLowerCase().includes('python')) {
      addSurveillanceLog('Python pipeline unavailable', 'ERROR');
    } else {
      addSurveillanceLog(`Pipeline error: ${errMsg}`, 'ERROR');
    }
    console.error('Error in POST /api/detect:', err);
    return res.status(500).json(fail('Inference pipeline error', errMsg));
  }
});

/**
 * POST /api/detect-video
 * Purpose : Receives a base64-encoded video file, passes it through the
 *           temporal YOLOv11 frame-tracker, and returns per-second tracking data.
 * Request : { base64: string, fileName?: string, modelName?: string }
 * Response: { success, message, data: TrackingFrame[], error }
 */
app.post('/api/detect-video', async (req, res) => {
  try {
    const { base64, fileName, modelName } = req.body as {
      base64?: unknown;
      fileName?: unknown;
      modelName?: unknown;
    };

    if (!base64 || typeof base64 !== 'string' || base64.trim() === '') {
      return res
        .status(400)
        .json(fail('Missing or invalid video payload', 'Field "base64" is required and must be a non-empty string'));
    }

    const safeFileName = typeof fileName === 'string' ? fileName : 'video.mp4';
    const safeModelName = typeof modelName === 'string' ? modelName : undefined;

    const trackingResult = await processCamouflageVideoAI(base64, safeFileName, safeModelName);
    return res.status(200).json(ok(trackingResult, 'Video analysis complete'));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in POST /api/detect-video:', err);
    return res.status(500).json(fail('Video surveillance pipeline error', msg));
  }
});

/**
 * GET /api/blockchain
 * Purpose : Returns the entire immutable evidence ledger (all blocks in the chain).
 * Request : none
 * Response: { success, message, data: Block[], error }
 */
app.get('/api/blockchain', (_req, res) => {
  try {
    res.status(200).json(ok(blockchainInstance.chain, 'Blockchain ledger retrieved'));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail('Failed to retrieve blockchain ledger', msg));
  }
});

/**
 * POST /api/blockchain/verify
 * Purpose : Runs a full cryptographic integrity audit across every block
 *           in the chain and reports whether the ledger is intact.
 * Request : none
 * Response: { success, message, data: { isValid, errorBlockIndex? }, error }
 */
app.post('/api/blockchain/verify', (_req, res) => {
  try {
    const audit = blockchainInstance.validateChain();
    const message = audit.isValid
      ? 'Blockchain integrity verified – all blocks are valid'
      : `Integrity failure detected at block #${audit.errorBlockIndex}`;
    res.status(200).json(ok(audit, message));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail('Blockchain verification failed', msg));
  }
});

/**
 * POST /api/blockchain/tamper
 * Purpose : Simulates a data-tampering attack on a specified block to
 *           demonstrate the blockchain's tamper-detection capabilities.
 * Request : { index: number, modifiedThreatType: string }
 * Response: { success, message, data: null, error }
 */
app.post('/api/blockchain/tamper', (req, res) => {
  try {
    const { index, modifiedThreatType } = req.body as {
      index?: unknown;
      modifiedThreatType?: unknown;
    };

    if (index === undefined || index === null) {
      return res
        .status(400)
        .json(fail('Missing field: index', 'Field "index" (number) is required'));
    }
    if (!modifiedThreatType || typeof modifiedThreatType !== 'string' || modifiedThreatType.trim() === '') {
      return res
        .status(400)
        .json(fail('Missing field: modifiedThreatType', 'Field "modifiedThreatType" (string) is required'));
    }
    if (Number.isNaN(Number(index))) {
      return res
        .status(400)
        .json(fail('Invalid field: index must be a number', null));
    }

    const blockIndex = Number(index);
    const tampered = blockchainInstance.tamperBlock(blockIndex, modifiedThreatType);

    if (!tampered) {
      return res
        .status(422)
        .json(fail('Tamper operation failed – genesis block or out-of-range index', null));
    }

    return res
      .status(200)
      .json(
        ok(
          null,
          `Block #${blockIndex} modified to "${modifiedThreatType}". Ledger hashes are now in conflict.`
        )
      );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail('Tamper simulation failed unexpectedly', msg));
  }
});

/**
 * POST /api/blockchain/reset
 * Purpose : Regenerates the Genesis block and replays all detection records
 *           to restore a valid, untampered blockchain state.
 * Request : none
 * Response: { success, message, data: null, error }
 */
app.post('/api/blockchain/reset', (_req, res) => {
  try {
    blockchainInstance.chain = [];
    // @ts-ignore – createGenesisBlock is private but required for reset
    blockchainInstance.createGenesisBlock();

    const detections = dbServiceInstance.getDetections();
    detections.forEach(det => {
      const block = blockchainInstance.addBlock(det.id, det.threatType, det.confidence, det.id);
      det.blocIndex = block.index;
      det.blockchainHash = block.hash;
    });
    dbServiceInstance.saveDetections(detections);

    res.status(200).json(ok(null, 'Blockchain recalibrated – genesis state restored'));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail('Blockchain reset failed', msg));
  }
});

/**
 * POST /api/test-suite/run
 * Purpose : Triggers the automated false-positive validation suite against
 *           the YOLOv11 pipeline using a configurable confidence threshold.
 * Request : { threshold?: number }
 * Response: { success, message, data: TestSuiteReport, error }
 */
app.post('/api/test-suite/run', async (req, res) => {
  try {
    const { threshold } = req.body as { threshold?: unknown };
    const confThreshold =
      threshold !== undefined && !Number.isNaN(Number(threshold))
        ? Math.min(1, Math.max(0, Number(threshold)))
        : CONFIG.CONFIDENCE_THRESHOLD;

    const report = await runFPTestSuite(confThreshold);
    res.status(200).json(ok(report, 'Test suite completed'));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail('Test suite execution failed', msg));
  }
});

// ─── 404 catch-all for unknown /api/* routes ─────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json(fail('Endpoint not found', 'The requested API route does not exist'));
});

// ─── Production serving ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Server startup ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(`CAM-YOLO11 backend running on port ${PORT} (${env})`);
});

export default app;
