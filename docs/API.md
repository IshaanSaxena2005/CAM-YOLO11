# API Documentation for CAM‑YOLO11 Backend

---

## Common Response Envelope
All endpoints return a JSON object with the following shape:

```json
{
  "success": boolean,
  "message": string,
  "data": any | null,
  "error": string | null
}
```

- `success` – `true` for a successful request, `false` otherwise.
- `message` – Human‑readable description of the outcome.
- `data` – Payload when `success` is `true`. Set to `null` on errors.
- `error` – Error description when `success` is `false`. Set to `null` on success.

---

## Environment Variables (see `.env.example`)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP port the Express server listens on. | `3000` |
| `MODEL_PATH` | Absolute path to the YOLOv11 model file (e.g., `best.pt`). | `./models/best.pt` |
| `DATABASE_PATH` | Path to the persistent JSON database. | `./database/surveillance_db.json` |
| `LOG_DIRECTORY` | Directory where log files are stored. | `./database` |
| `CONFIDENCE_THRESHOLD` | Default confidence threshold (0‑1) used when the client omits `threshold`. | `0.70` |
| `MAX_UPLOAD_SIZE` | Maximum request body size accepted by the server (e.g., `10mb`). | `10mb` |

---

## Validation Rules & Limits
- **Base64 payloads** – Must be a non‑empty string. Missing or non‑string values trigger **400 Bad Request**.
- **`threshold`** – Optional number. If supplied, it is clamped to the range **0 – 1**. Invalid numbers fall back to the default `CONFIDENCE_THRESHOLD`.
- **File names** – Optional strings; defaults to `image.jpg` or `video.mp4` when omitted.
- **Upload size** – Enforced by `express.json({ limit: CONFIG.MAX_UPLOAD_SIZE })`. Exceeding the limit results in **413 Payload Too Large**.
- **`index` (tamper endpoint)** – Must be a numeric block index within the current chain (`0 ≤ index < chain.length`). Out‑of‑range values produce **422 Unprocessable Entity**.

---

# Endpoints

### `GET /api/health`
- **Purpose** – Quick health‑check of the service.
- **Method** – `GET`
- **URL** – `/api/health`
- **Request Body** – *None*
- **Success Response (200)**
```json
{
  "success": true,
  "message": "System health check passed",
  "data": {
    "server": "running",
    "database": "connected" | "missing",
    "blockchain": "valid" | "corrupt",
    "python": "available" | "unavailable",
    "modelConfigured": true | false,
    "modelPath": "<absolute path>"
  },
  "error": null
}
```
- **Error Response (500)** – Unexpected internal error.
- **Notes** – No authentication required; suitable for orchestration tools.

---

### `GET /api/stats`
- **Purpose** – Returns aggregated dashboard statistics.
- **Method** – `GET`
- **URL** – `/api/stats`
- **Request Body** – *None*
- **Success Response (200)**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "totalDetections": number,
    "activeThreats": number,
    "todaysScans": number,
    "systemIntegrity": true | false,
    "aiConfidence": number,
    "blockchainBlocks": number,
    "databaseStatus": "ONLINE (PERSISTENT)"
  },
  "error": null
}
```
- **Error Response (500)** – Failure to compute statistics.

---

### `GET /api/logs`
- **Purpose** – Retrieves the most recent system logs.
- **Method** – `GET`
- **URL** – `/api/logs`
- **Request Body** – *None*
- **Success Response (200)**
```json
{
  "success": true,
  "message": "Logs retrieved",
  "data": [
    {
      "time": "14:32:10",
      "timestamp": "2026-07-04T09:32:10.123Z",
      "message": "System initialized",
      "severity": "INFO"
    }
    // …more entries, newest first
  ],
  "error": null
}
```
- **Error Response (500)** – Unable to read the log file.

---

### `GET /api/history`
- **Purpose** – Returns the full detection history stored in the persistent JSON DB.
- **Method** – `GET`
- **URL** – `/api/history`
- **Request Body** – *None*
- **Success Response (200)**
```json
{
  "success": true,
  "message": "Detection history retrieved",
  "data": [
    {
      "id": "det-12345",
      "timestamp": "2026-07-04T09:20:15.000Z",
      "imageUrl": "data:image/jpeg;base64,...",
      "fileName": "sample.jpg",
      "threatType": "Camo Sniper",
      "confidence": 0.94,
      "boundingBoxes": [
        { "id": "box-1", "label": "Sniper", "confidence": 0.94, "box": [0.1,0.2,0.3,0.4] }
      ],
      "tacticalAnalysis": {},
      "blockchainHash": "abc123...",
      "blocIndex": 7,
      "detected": true
    }
  ],
  "error": null
}
```
- **Error Response (500)** – Failure to read or parse the DB file.

---

### `POST /api/detect`
- **Purpose** – Accepts a base64‑encoded image, runs YOLOv11 inference, stores the result, and returns the detection record.
- **Method** – `POST`
- **URL** – `/api/detect`
- **Request Body** (JSON)
```json
{
  "base64": "<base64 string>",
  "fileName": "optional.jpg",
  "modelName": "optionalModelName",
  "threshold": 0.70
}
```
- **Validation**
  - `base64` – required, non‑empty string.
  - `fileName` – optional, string; defaults to `image.jpg`.
  - `modelName` – optional, string.
  - `threshold` – optional, number; clamped to 0‑1. Defaults to `CONFIG.CONFIDENCE_THRESHOLD`.
- **Success Response (200)**
```json
{
  "success": true,
  "message": "Detection complete – 2 target(s) identified",
  "data": {
    "id": "det-67890",
    "timestamp": "2026-07-04T09:45:12.000Z",
    "imageUrl": "data:image/jpeg;base64,...",
    "fileName": "sample.jpg",
    "threatType": "Camo Vehicle",
    "confidence": 0.89,
    "boundingBoxes": [
      { "id": "box-1", "label": "Vehicle", "confidence": 0.89, "box": [0.15,0.25,0.45,0.65] }
    ],
    "tacticalAnalysis": {},
    "gradcamHeatmapUrl": null,
    "performanceMetrics": null,
    "detected": true
  },
  "error": null
}
```
- **Error Responses**
  - **400** – Missing/invalid `base64` payload.
  ```json
  {"success":false,"message":"Missing or invalid image payload","data":null,"error":"Field \"base64\" is required and must be a non‑empty string"}
  ```
  - **500** – Unexpected pipeline or server error.
  ```json
  {"success":false,"message":"Inference pipeline error","data":null,"error":"<error message>"}
  ```
- **Notes** – Logs each stage and updates the blockchain when a detection is recorded.

---

### `POST /api/detect-video`
- **Purpose** – Accepts a base64‑encoded video, runs (mocked) temporal tracking, and returns per‑second tracking data.
- **Method** – `POST`
- **URL** – `/api/detect-video`
- **Request Body** (JSON)
```json
{
  "base64": "<base64 string>",
  "fileName": "optional.mp4",
  "modelName": "optionalModelName"
}
```
- **Validation** – Same `base64` requirement as the image endpoint.
- **Success Response (200)**
```json
{
  "success": true,
  "message": "Video analysis complete",
  "data": [
    {
      "time_seconds": 0,
      "detected": false,
      "threatType": "None",
      "confidence": 0,
      "boundingBoxes": []
    }
    // …more frames
  ],
  "error": null
}
```
- **Error Responses** – Same pattern as `/api/detect` (400 / 500).
- **Notes** – Current implementation returns mock data; real YOLOv11 video inference will replace it without API change.

---

### `GET /api/blockchain`
- **Purpose** – Retrieves the full immutable ledger (all blocks).
- **Method** – `GET`
- **URL** – `/api/blockchain`
- **Request Body** – *None*
- **Success Response (200)**
```json
{
  "success": true,
  "message": "Blockchain ledger retrieved",
  "data": [
    {
      "index": 0,
      "timestamp": "2026-06-01T00:00:00.000Z",
      "prevHash": "000…",
      "hash": "abc123…",
      "nonce": 100,
      "data": {
        "detectionId": "genesis",
        "threatType": "SYSTEM_STARTUP",
        "confidence": 1.0,
        "blockchainHash": "0"
      }
    }
    // …subsequent blocks
  ],
  "error": null
}
```
- **Error Response (500)** – Failure to read blockchain state.

---

### `POST /api/blockchain/verify`
- **Purpose** – Audits the entire chain for cryptographic integrity.
- **Method** – `POST`
- **URL** – `/api/blockchain/verify`
- **Request Body** – *None*
- **Success Response (200)** – Validation result.
```json
{
  "success": true,
  "message": "Blockchain integrity verified – all blocks are valid",
  "data": { "isValid": true },
  "error": null
}
```
- *If the chain is corrupt*:
```json
{
  "success": true,
  "message": "Integrity failure detected at block #5",
  "data": { "isValid": false, "errorBlockIndex": 5 },
  "error": null
}
```
- **Error Response (500)** – Unexpected error during verification.

---

### `POST /api/blockchain/tamper`
- **Purpose** – Simulates a tampering attack on a specific block (development/demo only).
- **Method** – `POST`
- **URL** – `/api/blockchain/tamper`
- **Request Body** (JSON)
```json
{
  "index": 3,
  "modifiedThreatType": "MALICIOUS_ENTRY"
}
```
- **Validation**
  - `index` – required, numeric, must be within current chain length.
  - `modifiedThreatType` – required, non‑empty string.
- **Success Response (200)**
```json
{
  "success": true,
  "message": "Block #3 modified to \"MALICIOUS_ENTRY\". Ledger hashes are now in conflict.",
  "data": null,
  "error": null
}
```
- **Error Responses**
  - **400** – Missing or invalid fields.
  - **422** – Index out of range or attempt to tamper the genesis block.
  - **500** – Unexpected server error.
- **Notes** – After tampering, `/api/blockchain/verify` will report a failure.

---

### `POST /api/blockchain/reset`
- **Purpose** – Re‑creates the Genesis block and re‑plays all stored detections to restore a valid chain.
- **Method** – `POST`
- **URL** – `/api/blockchain/reset`
- **Request Body** – *None*
- **Success Response (200)**
```json
{
  "success": true,
  "message": "Blockchain recalibrated – genesis state restored",
  "data": null,
  "error": null
}
```
- **Error Response (500)** – Failure to rebuild the chain.

---

### `POST /api/test-suite/run`
- **Purpose** – Executes the false‑positive test suite against the YOLOv11 pipeline.
- **Method** – `POST`
- **URL** – `/api/test-suite/run`
- **Request Body** (JSON)
```json
{
  "threshold": 0.70 // optional, clamped 0‑1
}
```
- **Success Response (200)** – Summary of the suite run.
```json
{
  "success": true,
  "message": "Test suite completed",
  "data": {
    "timestamp": "2026-07-04T09:55:00.000Z",
    "totalCases": 3,
    "truePositives": 2,
    "falsePositives": 0,
    "trueNegatives": 1,
    "falseNegatives": 0,
    "precision": 100.0,
    "recall": 100.0,
    "falsePositiveRate": 0.0,
    "testDetails": [
      { "caseName": "Blank Image", "expected": "No Target", "detected": "No Target", "confidence": 0, "passed": true }
      // …
    ]
  },
  "error": null
}
```
- **Error Response (500)** – Pipeline or internal failure.
- **Notes** – The suite runs a small set of mock images; results are deterministic.

---

## Status Codes Overview
| Code | Meaning |
|------|---------|
| **200** | Successful request (payload in `data`). |
| **400** | Bad request – validation failed (missing/invalid fields). |
| **401** | Not used – the API is currently unauthenticated. |
| **403** | Not used. |
| **404** | Endpoint does not exist (`/api/*` catch‑all). |
| **413** | Payload too large (exceeds `MAX_UPLOAD_SIZE`). |
| **422** | Unprocessable Entity – e.g., tamper index out of range. |
| **500** | Internal server error – unexpected exception. |

---

*The documentation reflects the exact implementation in `server.ts` (as of 2026‑07‑04). No stale or placeholder endpoints are listed.*
