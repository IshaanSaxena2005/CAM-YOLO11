import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { 
  dbServiceInstance, 
  blockchainInstance, 
  processCamouflageImageAI,
  processCamouflageVideoAI,
  getSurveillanceLogs,
  addSurveillanceLog,
  runFPTestSuite
} from './server/api';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'surveillance-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith('/api')) {
              return next();
            }

            const parsedUrl = new URL(req.url, 'http://localhost:3000');
            const pathname = parsedUrl.pathname;
            const method = req.method;

            res.setHeader('Content-Type', 'application/json');

            try {
              // 1. GET /api/stats
              if (pathname === '/api/stats' && method === 'GET') {
                const detections = dbServiceInstance.getDetections();
                const totalScans = detections.length;
                const activeTargetsList = detections.filter(d => d.detected !== false);
                const activeThreats = activeTargetsList.length;
                const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
                const todaysScans = detections.filter(d => new Date(d.timestamp).getTime() > oneDayAgo).length;
                const sumConfId = activeTargetsList.reduce((sum, d) => sum + d.confidence, 0);
                const avgConfidence = activeTargetsList.length > 0 ? (sumConfId / activeTargetsList.length) * 100 : 0.0;

                return res.end(JSON.stringify({
                  totalDetections: totalScans,
                  activeThreats,
                  todaysScans,
                  systemIntegrity: blockchainInstance.validateChain().isValid,
                  aiConfidence: parseFloat(avgConfidence.toFixed(1)),
                  blockchainBlocks: blockchainInstance.chain.length,
                  databaseStatus: 'ONLINE (PERSISTENT)',
                  sensorFusionDepth: activeThreats > 0 ? '97.2% OPTIMAL' : '0.0% SECURE'
                }));
              }

              // 1b. GET /api/logs
              if (pathname === '/api/logs' && method === 'GET') {
                return res.end(JSON.stringify(getSurveillanceLogs()));
              }

              // 1c. POST /api/test-suite/run
              if (pathname === '/api/test-suite/run' && method === 'POST') {
                const buffers: Buffer[] = [];
                for await (const chunk of req) {
                  buffers.push(chunk as Buffer);
                }
                const bodyStr = Buffer.concat(buffers).toString('utf-8');
                const { threshold } = JSON.parse(bodyStr || '{}');
                const confThreshold = threshold !== undefined ? Number(threshold) : 0.70;
                const report = await runFPTestSuite(confThreshold);
                return res.end(JSON.stringify(report));
              }

              // 2. GET /api/history
              if (pathname === '/api/history' && method === 'GET') {
                const detections = dbServiceInstance.getDetections();
                return res.end(JSON.stringify(detections));
              }

              // 3. POST /api/detect
              if (pathname === '/api/detect' && method === 'POST') {
                const buffers: Buffer[] = [];
                for await (const chunk of req) {
                  buffers.push(chunk as Buffer);
                }
                const bodyStr = Buffer.concat(buffers).toString('utf-8');
                const { base64, fileName, modelName, threshold } = JSON.parse(bodyStr);

                if (!base64) {
                   res.statusCode = 400;
                  return res.end(JSON.stringify({ error: 'Missing base64 image data' }));
                }

                const confThreshold = threshold !== undefined ? Number(threshold) : 0.70;
                addSurveillanceLog(`Image uploaded. Filename: ${fileName || 'recon_imaging.jpg'}`);
                addSurveillanceLog(`Inference started on YOLOv8 Core.`);

                const rawResult = await processCamouflageImageAI(base64, fileName, modelName, confThreshold);
                addSurveillanceLog(`Inference completed.`);

                if (rawResult.detected) {
                  addSurveillanceLog(`Target accepted: ${rawResult.threatType} (Confidence: ${(rawResult.confidence * 100).toFixed(1)}%).`);
                } else {
                  addSurveillanceLog(`Inference scan concluded. ${rawResult.message || 'No valid targets matched.'}`);
                }

                const savedRecord = dbServiceInstance.addDetection(rawResult);
                return res.end(JSON.stringify(savedRecord));
              }

              // 3b. POST /api/detect-video
              if (pathname === '/api/detect-video' && method === 'POST') {
                const buffers: Buffer[] = [];
                for await (const chunk of req) {
                  buffers.push(chunk as Buffer);
                }
                const bodyStr = Buffer.concat(buffers).toString('utf-8');
                const { base64, fileName, modelName } = JSON.parse(bodyStr);

                if (!base64) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ error: 'Missing video base64 data' }));
                }

                const trackingResult = await processCamouflageVideoAI(base64, fileName, modelName);
                return res.end(JSON.stringify(trackingResult));
              }

              // 4. GET /api/blockchain
              if (pathname === '/api/blockchain' && method === 'GET') {
                return res.end(JSON.stringify(blockchainInstance.chain));
              }

              // 5. POST /api/blockchain/verify
              if (pathname === '/api/blockchain/verify' && method === 'POST') {
                const audit = blockchainInstance.validateChain();
                return res.end(JSON.stringify(audit));
              }

              // 6. POST /api/blockchain/tamper
              if (pathname === '/api/blockchain/tamper' && method === 'POST') {
                const buffers: Buffer[] = [];
                for await (const chunk of req) {
                  buffers.push(chunk as Buffer);
                }
                const bodyStr = Buffer.concat(buffers).toString('utf-8');
                const { index, modifiedThreatType } = JSON.parse(bodyStr);

                if (index === undefined || !modifiedThreatType) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ error: 'Missing block index or tampered data' }));
                }

                const success = blockchainInstance.tamperBlock(Number(index), modifiedThreatType);
                return res.end(JSON.stringify({ 
                  success, 
                  message: success 
                    ? `Simulated Hack: Block #${index} modified to "${modifiedThreatType}". Ledger hashes are now in conflict.`
                    : 'Tamper operation failed. Genesis block or invalid index specified.'
                }));
              }

              // 7. POST /api/blockchain/reset
              if (pathname === '/api/blockchain/reset' && method === 'POST') {
                blockchainInstance.chain = [];
                // @ts-ignore
                blockchainInstance.createGenesisBlock();
                
                const detections = dbServiceInstance.getDetections();
                detections.forEach((det) => {
                  const block = blockchainInstance.addBlock(det.id, det.threatType, det.confidence, det.id);
                  det.blocIndex = block.index;
                  det.blockchainHash = block.hash;
                });
                dbServiceInstance.saveDetections(detections);

                return res.end(JSON.stringify({ success: true, message: 'Cryptographic ledger recalibrated, genesis state restored.' }));
              }

              // 8. GET /api/quantum-simulate
              if (pathname === '/api/quantum-simulate' && method === 'GET') {
                return res.end(JSON.stringify({
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
                }));
              }

              // If unhandled /api path
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: `Not Found: ${pathname}` }));

            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message || 'Server internal API routing error' }));
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
