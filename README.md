# 📦 CAM‑YOLO11
## Camouflaged Object Detection using YOLOv11 for Military Monitoring

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.19-black?logo=express)
![Python](https://img.shields.io/badge/Python-3.11-yellow?logo=python)
![YOLOv11](https://img.shields.io/badge/YOLOv11-1.0-red)
![OpenCV](https://img.shields.io/badge/OpenCV-4.8-orange)
![SQLite](https://img.shields.io/badge/SQLite-3.45-blue)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

### Overview
CAM‑YOLO11 is an end‑to‑end reconnaissance platform that detects camouflaged military objects in aerial or ground imagery. The system combines a React + TypeScript frontend, an Express + Node.js backend, a Python inference pipeline powered by Ultralytics YOLOv11, and a blockchain‑backed audit log. Users can upload images or video, view detection overlays, explore analytics, and securely store evidence for later review.

---

## Features
- 🎯 Camouflaged object detection with YOLOv11
- 📤 Image and video analysis
- 📊 Detection history and analytics dashboard
- 🔗 Blockchain‑based evidence logging
- 🗄️ Secure SQLite storage of detections
- ⚙️ Real‑time statistics panel
- 🔒 Confidence threshold configuration

---

## System Architecture
```mermaid
flowchart TD
    A[User] --> B[React + TypeScript Dashboard]
    B --> C[Express REST API]
    C --> D[Python YOLOv11 Inference]
    C --> E[SQLite DB]
    D --> F[Blockchain Ledger]
    F --> G[Detection Results]
    G --> B
```

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Front‑end | React, TypeScript, Vite, Tailwind CSS |
| Back‑end | Node.js, Express, TypeScript |
| AI / CV | Python, Ultralytics YOLOv11, OpenCV |
| Data | SQLite |
| Security | Blockchain ledger (custom implementation) |

---

## Folder Structure
```
CAM‑YOLO11/
├─ src/                # React source code
│   ├─ components/
│   ├─ assets/
│   └─ App.tsx
├─ server/            # Express API
│   ├─ api.ts
│   └─ services/
├─ database/          # SQLite database file
│   └─ surveillance.db
├─ models/            # YOLOv11 model files
│   └─ best.pt
├─ yolo_pipeline.py   # Python inference script
├─ .env.example       # Example environment variables
└─ README.md
```

---

## Installation
```bash
# Clone the repository
git clone https://github.com/your‑org/CAM-YOLO11.git
cd CAM‑YOLO11

# Node dependencies
npm install

# Python environment (recommended venv)
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt   # contains ultralytics, torch, opencv-python, etc.
```

---

## Running the Project
```bash
# 1. Set up environment variables
cp .env.example .env
# Edit .env as needed (PORT, MODEL_PATH, DATABASE_PATH, CONFIDENCE_THRESHOLD)

# 2. Start the backend (Express)
npm run dev   # Vite dev server also proxies API calls
```
The dashboard will be available at `http://localhost:5173` (Vite default).

---

## Model Information
The pretrained YOLOv11 model used for inference is located at:
```
models/best.pt
```
It was trained on the **MHCD2022** camouflage dataset.

---

## Dataset
The system is evaluated with the **MHCD2022** dataset, which contains labeled camouflaged objects in varied terrain and lighting conditions.

---

## Screenshots
| View | Placeholder |
|------|-------------|
| Dashboard | ![Dashboard](./screenshots/dashboard.png) |
| Image Analysis | ![Image Analysis](./screenshots/image_analysis.png) |
| Detection Result | ![Detection Result](./screenshots/detection_result.png) |
| Analytics | ![Analytics](./screenshots/analytics.png) |
| Blockchain | ![Blockchain](./screenshots/blockchain.png) |
| History | ![History](./screenshots/history.png) |

---

## Future Improvements
- 📈 Incorporate additional camouflage datasets to improve robustness.
- 🛡️ Add role‑based access control for the dashboard.
- ⚡ Optimize inference latency with TensorRT or ONNX runtime.
- 📱 Provide a mobile‑friendly view of the analytics dashboard.

---

## Authors
- **Ishaan Saxena** – Lead Engineer, Front‑end & UI/UX
- **[Additional contributors]** – Backend, AI pipeline, Security

---

## License
This project is licensed under the **MIT License**. See the `LICENSE` file for details.
