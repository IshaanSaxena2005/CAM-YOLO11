<div align="center">

# CAM-YOLO11

### AI-Powered Military Camouflage Detection & Surveillance System

A full-stack computer vision platform for detecting camouflaged military targets using **YOLOv11**, featuring a modern React dashboard, Express backend, Python inference engine, and blockchain-backed detection logging.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Python](https://img.shields.io/badge/Python-3.11-yellow?logo=python)
![YOLOv11](https://img.shields.io/badge/YOLO-v11-red)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-orange)
![License](https://img.shields.io/badge/Academic-UROP-success)

</div>

---

# Overview

CAM-YOLO11 is an AI-powered reconnaissance system developed to detect camouflaged military objects from aerial or ground imagery.

The project combines deep learning, computer vision, full-stack web development, and secure logging into one integrated platform. Users can upload reconnaissance images, perform object detection using YOLOv11, visualize detected targets, monitor system statistics, and securely store detection history.

The project is being developed as part of an **Undergraduate Research Opportunity Program (UROP).**

---

# Features

### AI Detection

- YOLOv11 object detection
- Image inference
- Video inference support
- Confidence score prediction
- Multi-object detection
- Configurable confidence threshold

### Visualization

- Bounding box rendering
- Detection overlays
- Grad-CAM visualization (research module)
- Detection summaries
- Interactive dashboard

### Backend

- RESTful API architecture
- Express + TypeScript
- Python inference pipeline
- Configurable environment variables
- Health monitoring endpoint

### Security

- Blockchain-backed detection records
- Detection history
- Persistent storage
- Audit verification

### Dashboard

- Real-time statistics
- Detection logs
- Historical records
- Blockchain viewer
- Research panel

---

# System Architecture

```
                    User
                      │
                      ▼
          React + TypeScript Dashboard
                      │
                      ▼
               Express REST API
                      │
          ┌───────────┴────────────┐
          ▼                        ▼
    Python YOLOv11           Blockchain
 Detection Pipeline             Ledger
          │                        │
          └───────────┬────────────┘
                      ▼
               Detection Results
                      │
                      ▼
             Dashboard Visualization
```

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

## Backend

- Node.js
- Express
- TypeScript

## AI & Computer Vision

- YOLOv11
- PyTorch
- OpenCV
- Ultralytics

## Database

- JSON Storage

## Security

- Blockchain Ledger

---

# Project Structure

```
CAM-YOLO11
│
├── src/
│   ├── Components
│   ├── Assets
│   ├── Types
│   └── App.tsx
│
├── server/
│   ├── api.ts
│   └── services
│
├── database/
│   └── surveillance_db.json
│
├── yolo_pipeline.py
├── server.ts
├── config.ts
├── .env.example
└── README.md
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/USERNAME/CAM-YOLO11.git

cd CAM-YOLO11
```

Install Node dependencies

```bash
npm install
```

Install Python packages

```bash
pip install ultralytics torch torchvision opencv-python
```

---

# Environment Variables

Create a `.env` file.

```env
PORT=3000

MODEL_PATH=best.pt

DATABASE_PATH=database/surveillance_db.json

CONFIDENCE_THRESHOLD=0.70

MAX_UPLOAD_SIZE=10mb
```

---

# Running the Project

Start frontend

```bash
npm run dev
```

Start backend

```bash
node --import tsx server.ts
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Server health |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/history` | Detection history |
| GET | `/api/logs` | Activity logs |
| POST | `/api/detect` | Image detection |
| POST | `/api/detect-video` | Video detection |
| GET | `/api/blockchain` | Blockchain records |
| POST | `/api/blockchain/verify` | Verify blockchain |
| POST | `/api/test-suite/run` | Validation suite |

---

# Detection Pipeline

```
Upload Image

        │

        ▼

React Dashboard

        │

        ▼

Express API

        │

        ▼

Python YOLOv11

        │

        ▼

Target Detection

        │

        ▼

Bounding Boxes

        │

        ▼

Detection Logging

        │

        ▼

Blockchain Storage

        │

        ▼

Dashboard Visualization
```

---

# Current Status

| Module | Status |
|---------|--------|
| Frontend Dashboard | ✅ Completed |
| Backend APIs | ✅ Completed |
| Database | ✅ Completed |
| Blockchain | ✅ Completed |
| REST API | ✅ Completed |
| Health Monitoring | ✅ Completed |
| Logging System | ✅ Completed |
| Detection Pipeline | ✅ Integrated |
| YOLOv11 Training | 🚧 In Progress |
| Grad-CAM | 🚧 In Progress |

---

# Future Work

- Live webcam detection
- Drone surveillance support
- Multi-object tracking
- Cloud deployment
- Docker support
- PostgreSQL integration
- Authentication
- Model auto-update
- Edge device deployment

---

# Contributors

## Ishaan Saxena

- Frontend Development
- Backend Development
- REST APIs
- React Dashboard
- Blockchain Integration
- Database Management
- System Integration

---

## Harpreet Singh

- Dataset Preparation
- YOLOv11 Training
- Model Optimization
- Grad-CAM Integration
- Experimental Evaluation
- Performance Metrics

---

# Screenshots

> Add screenshots after completing the project.

- Dashboard
- Detection Interface
- Bounding Box Results
- Blockchain Panel
- Detection History
- System Logs

---

# License

This project was developed for academic research under the **Undergraduate Research Opportunity Program (UROP)**.

---

# Acknowledgements

- Ultralytics YOLO
- OpenCV
- PyTorch
- React
- Node.js
- Express
- Tailwind CSS
- Vite
