# 🛡️ Safety Compliance Backend

This is the FastAPI backend for the Safety Compliance Dashboard. It provides real-time AI-powered PPE detection and safety monitoring.

## 📋 Prerequisites

- Python 3.9+
- CUDA-compatible GPU (recommended for real-time inference)
- Webcam for live monitoring
- Your trained YOLOv8 model (`bests-350epoch.pt`)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Add Your Model Files

Place your trained models in the `backend` folder:
- `yolov8n-pose.pt` - YOLOv8 pose detection model (downloads automatically)
- `bests-350epoch.pt` - Your custom PPE detection model

### 3. Start the Backend Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## 📡 API Endpoints

### Monitoring Control
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/monitor/status` | Check if monitoring is active |
| POST | `/api/monitor/toggle` | Enable/disable monitoring |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/threshold` | Get detection sensitivity |
| POST | `/api/settings/threshold` | Set detection sensitivity |
| GET | `/api/settings/gear` | Get required PPE items |
| POST | `/api/settings/gear` | Set required PPE items |

### Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | Get detection logs |
| GET | `/api/stats` | Get compliance statistics |

### Video
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/video_feed` | Live MJPEG video stream |
| POST | `/analyze_video` | Upload video for offline analysis |

## 🔧 Configuration

### Detected PPE Classes
The model detects the following equipment:
- N95 Mask
- Surgical Mask
- Hand Gloves
- Lab Coat
- Protective Eye Glasses
- Protective Head Cap

### Required Gear (Configurable via API)
Default required gear IDs:
- `mask` - Face mask (N95 or Surgical)
- `gloves` - Hand gloves
- `coat` - Lab coat
- `glasses` - Eye protection
- `cap` - Head cap

## 📁 Folder Structure

```
backend/
├── main.py              # FastAPI application
├── safety_engine.py     # YOLOv8 AI inference engine
├── bytetrack.yaml       # Tracker configuration
├── requirements.txt     # Python dependencies
├── static/              # Processed videos output
└── README.md            # This file
```

## 🔗 Frontend Integration

The frontend (Next.js) should connect to:
- API Base URL: `http://localhost:8000`
- Video Feed: `http://localhost:8000/video_feed`

CORS is pre-configured for `localhost:3000` (Next.js dev server).

## ⚠️ Troubleshooting

### Camera not found
- Check your webcam is connected
- Try changing camera index in `main.py` (line 28)

### CUDA/GPU Issues
- Install CUDA-compatible PyTorch: https://pytorch.org/get-started/locally/
- The system will fallback to CPU if GPU is unavailable

### Model not loading
- Ensure `bests-350epoch.pt` is in the backend folder
- YOLOv8 pose model downloads automatically on first run
