# Marketwise: AI-Powered Safety Compliance System

**Marketwise** is an intelligent workplace safety monitoring solution designed to automate the detection of Personal Protective Equipment (PPE) compliance. By leveraging advanced Computer Vision (YOLOv8) and real-time video analytics, it helps organizations maintain safety standards, track violations, and generate actionable insights.

![Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![YOLOv8](https://img.shields.io/badge/AI-YOLOv8s-magenta)

## 📸 Project Gallery

### Landing Page
> The entry point for the Marketwise platform.
![Landing Page](./public/Screenshot%202026-01-17%20122008.png)

### Operations Dashboard
> Comprehensive view of safety compliance scores, active cameras, and violation trends.
![Dashboard](./public/Screenshot%202026-01-17%20122026.png)

### Real-Time Monitoring
> Live inference feed detecting PPE (Helmets/Vests) with low-latency bounding boxes.
![Live Streaming](./public/Screenshot%202026-01-17%20122130.png)

### Processed Recordings & History
> Review historical footage and detected violation snapshots.
![Processed Recordings](./public/Screenshot%202026-01-17%20122142.png)

---

## 🚀 Key Features

* **Real-Time Monitoring:** Live video feed processing with bounding box overlays for safety gear detection.
* **Smart Detection:** Automatically identifies PPE compliance (Helmets, Vests) and potential violations.
* **Analytics Dashboard:** Visualizes compliance scores, violation trends, and camera performance metrics.
* **Video Management:** Tools to upload, trim, and analyze historical footage from Pexels or local sources.
* **Audit Logs:** Searchable database of detected incidents with snapshots.

## 🧠 Model Training & Performance

The core of Marketwise is powered by a custom-trained **YOLOv8s (Small)** model, optimized for speed and accuracy in industrial environments.

### Training Specifications
We achieved high-performance results using the following configuration:

| Parameter | Details |
| :--- | :--- |
| **Base Model** | YOLOv8s |
| **Training Epochs** | 150 (Best weights: `bests-150epoch-pro.pt`) |
| **Total Dataset** | ~3,200 Annotated Images |
| **Primary Source** | 2,801 annotated images via **Roboflow** |
| **Custom Data** | 400 frames manually extracted & labelled from **Pexels** stock footage |

*The model was fine-tuned to handle varying lighting conditions and angles by combining standard datasets with manually curated video frames.*

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn UI
* **Visualization:** Recharts (Analytics & Trends)

### Backend
* **Language:** Python 3.10+
* **AI Engine:** Ultralytics YOLOv8, PyTorch
* **Tracking:** ByteTrack
* **Database:** SQLite (`logs.db`)

## 📂 Project Structure

```bash
Marketwise/
├── app/                  # Next.js App Router (Dashboard, Analytics, Monitor)
├── backend/              # Python Logic
│   ├── bests-150epoch-pro.pt  # Production Model Weights
│   ├── safety_engine.py       # Detection Logic
│   ├── log_service.py         # Database Interactions
│   └── main.py                # API Entry Point
├── components/           # UI Components
│   ├── analytics/        # Charts (Compliance Score, Trends)
│   ├── monitor/          # Video Players & PPE Checklists
│   └── logs/             # Data Tables
└── public/               # Static Assets & Screenshots
