from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import cv2
import time
import os
import shutil
from pydantic import BaseModel
from safety_engine import SafetyMonitor

# --- GLOBAL VARIABLES ---
camera = None
monitor = None
OUTPUT_DIR = "static"

# Ensure output directory exists for processed videos
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global monitor, camera
    print("[INFO] Initializing Safety Monitor (GPU)...")
    monitor = SafetyMonitor()
    monitor.set_active(True) # Force monitoring ON by default so feed shows immediately
    
    print("[INFO] Opening Camera...")
    # Use cv2.CAP_DSHOW on Windows for faster/reliable access
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW) 
    if not camera.isOpened():
        print("[WARNING] Camera 0 failed. Trying 1...")
        camera = cv2.VideoCapture(1, cv2.CAP_DSHOW)

    if camera.isOpened():
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        camera.set(cv2.CAP_PROP_FPS, 30)
    else:
        print("[ERROR] No camera found!")

    yield
    
    print("[INFO] Shutdown cleanup...")
    if camera and camera.isOpened():
        camera.release()

app = FastAPI(lifespan=lifespan)

# --- CORS MIDDLEWARE (Required for Next.js frontend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Next.js dev server
        "http://127.0.0.1:3000",
        "http://localhost:3001",      # Alternate port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static folder so browsers can play generated videos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Create templates directory if it doesn't exist
os.makedirs("templates", exist_ok=True)

# Global Log Storage for Live Feed
detection_logs = []

# --- DATA MODELS ---
class ThresholdSettings(BaseModel):
    conf: float

class GearSettings(BaseModel):
    requirements: list[str]

class MonitorState(BaseModel):
    active: bool

# --- API ENDPOINTS ---

# 1. Monitoring Toggle
@app.post("/api/monitor/toggle")
async def toggle_monitor(state: MonitorState):
    if monitor:
        monitor.set_active(state.active)
    return {"status": "updated", "active": state.active}

@app.get("/api/monitor/status")
async def get_monitor_status():
    if monitor:
        return {"active": monitor.is_active}
    return {"active": False}

# 2. Threshold Settings
@app.post("/api/settings/threshold")
async def set_threshold(settings: ThresholdSettings):
    if monitor:
        monitor.set_confidence(settings.conf)
    return {"status": "updated", "new_conf": settings.conf}

@app.get("/api/settings/threshold")
async def get_threshold_settings():
    """Returns the current sensitivity"""
    if monitor:
        return {"conf": monitor.general_conf}
    return {"conf": 0.50}

# 3. Gear Settings
@app.post("/api/settings/gear")
async def set_gear(settings: GearSettings):
    if monitor:
        monitor.update_requirements(settings.requirements)
    return {"status": "updated", "active": settings.requirements}

@app.get("/api/settings/gear")
async def get_gear_settings():
    """Returns the currently active required gear"""
    if monitor:
        return {"requirements": list(monitor.REQUIRED_GEAR)}
    return {"requirements": []}

from database import engine, Base, get_db
from models import Log
from log_service import save_logs
from sqlalchemy.orm import Session
from fastapi import Depends
from datetime import datetime

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# New endpoint: search logs in DB
@app.get("/api/logs/search")
async def search_logs(
    person_id: int | None = None,
    start: str | None = None,
    end: str | None = None,
    equipment: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Log)
    if person_id is not None:
        query = query.filter(Log.person_id == person_id)
    if start:
        query = query.filter(Log.timestamp >= datetime.fromisoformat(start))
    if end:
        query = query.filter(Log.timestamp <= datetime.fromisoformat(end))
    if equipment:
        # search in detected or missing JSON arrays
        query = query.filter(
            Log.detected.contains([equipment]) | Log.missing.contains([equipment])
        )
    results = query.order_by(Log.timestamp.desc()).limit(200).all()
    # Convert to serializable dicts
    logs = []
    for r in results:
        logs.append(
            {
                "id": r.id,
                "person_id": r.person_id,
                "timestamp": r.timestamp.isoformat(),
                "detected": r.detected,
                "missing": r.missing,
                "source": r.source,
                "confidence": r.confidence,
            }
        )
    return {"logs": logs}

# New endpoint: analytics summary (counts per equipment)
@app.get("/api/analytics/summary")
async def analytics_summary(db: Session = Depends(get_db)):
    # Simple aggregation: count detections per equipment type
    from sqlalchemy import func, json_each
    # Detected equipment counts
    detected_counts = (
        db.query(json_each.value, func.count())
        .select_from(Log, func.json_each(Log.detected))
        .group_by(json_each.value)
        .all()
    )
    missing_counts = (
        db.query(json_each.value, func.count())
        .select_from(Log, func.json_each(Log.missing))
        .group_by(json_each.value)
        .all()
    )
    return {
        "detected": {item: cnt for item, cnt in detected_counts},
        "missing": {item: cnt for item, cnt in missing_counts},
    }

# Original Logs & Stats (kept for compatibility)
@app.get("/api/logs")
async def get_logs():
    return {"logs": detection_logs[::-1]}

@app.get("/api/stats")
async def get_stats():
    if not detection_logs:
        return {"total_violations": 0, "compliance_rate": 100}
    recent_logs = detection_logs[-50:]
    violations = len([d for d in recent_logs if d['status'] == 'VIOLATION'])
    total = len(recent_logs)
    compliance = ((total - violations) / total) * 100 if total > 0 else 100
    return {"total_violations": violations, "compliance_rate": round(compliance, 1)}

# --- LIVE STREAMING LOGIC --
def generate_frames():
    global camera
    while True:
        # 1. Check if camera is accessible
        if camera is None or not camera.isOpened():
            time.sleep(1)
            continue

        # 2. Read Frame
        success, frame = camera.read()
        if not success:
            time.sleep(0.1)
            continue

        try:
            # 3. Live Inference (Process the frame)
            # Restore full resolution for clear detection
            annotated_frame, data = monitor.process_frame(frame)
            
            # 4. Update Logs (Shared with UI & Database)
            if data:
                detection_logs.extend(data)
                if len(detection_logs) > 50: detection_logs.pop(0)
                
                # PERSIST TO DATABASE
                try:
                    with next(get_db()) as db:
                        save_logs(db, data, source="Live Camera")
                except Exception as db_err:
                    print(f"Database Save Error: {db_err}")

            # 5. MODERN VISUALS: High-Quality Resize & Encode
            preview = cv2.resize(annotated_frame, (1280, 720), interpolation=cv2.INTER_LINEAR)
            
            # Quality: 80% JPEG quality for HD clarity
            ret, buffer = cv2.imencode('.jpg', preview, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            frame_bytes = buffer.tobytes()

            # 6. Yield frame to browser
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                   
        except Exception as e:
            print(f"Stream Error: {e}")
            time.sleep(0.1)

@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

# --- RECORDED VIDEO PROCESSING ---
@app.post("/analyze_video")
async def analyze_video(file: UploadFile = File(...)):
    # 1. Save Uploaded File
    temp_input = f"{OUTPUT_DIR}/temp_input.mp4"
    
    output_filename = f"processed_{int(time.time())}.webm"
    output_path = f"{OUTPUT_DIR}/{output_filename}"

    with open(temp_input, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Setup Processing
    cap = cv2.VideoCapture(temp_input)
    # Force 720p for faster processing
    target_width, target_height = 1280, 720
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    # CHANGE: Use 'vp80' (VP8) - Faster & better compatibility than VP9
    try:
        fourcc = cv2.VideoWriter_fourcc(*'vp80')
        out = cv2.VideoWriter(output_path, fourcc, fps, (target_width, target_height))
        
        # Critical Check: Did the writer actually open?
        if not out.isOpened():
            print("[WARNING] VP8 codec failed. Falling back to mp4v...")
            output_filename = f"processed_{int(time.time())}.mp4"
            output_path = f"{OUTPUT_DIR}/{output_filename}"
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (target_width, target_height))
            
    except Exception as e:
        print(f"[ERROR] Video Writer Error: {e}")
        return {"status": "Error", "message": str(e)}
    
    # Temporarily force monitor active
    was_active = monitor.is_active
    monitor.set_active(True)

    results = []
    frame_count = 0
    
    # 3. Process Frame by Frame
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        # Resize for speed
        frame = cv2.resize(frame, (target_width, target_height))
        
        annotated_frame, data = monitor.process_frame(frame)
        
        if data: results.extend(data)
        out.write(annotated_frame)
        frame_count += 1

    cap.release()
    out.release()
    
    # PERSIST RESULTS TO DATABASE
    if results:
        try:
            with next(get_db()) as db:
                save_logs(db, results, source=f"Video: {file.filename}")
        except Exception as db_err:
            print(f"Database Save Error: {db_err}")
    
    # Restore monitor state
    monitor.set_active(was_active)
    
    return {
        "status": "Complete", 
        "video_url": f"/static/{output_filename}",
        "total_frames": frame_count,
        "logs": results[:50]
    }

# --- HEALTH CHECK ---
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "camera": camera is not None and camera.isOpened(),
        "monitor": monitor is not None
    }

# --- PAGE ROUTES (Optional - for standalone backend) ---
@app.get("/", response_class=HTMLResponse)
async def read_root():
    return """
    <html>
        <head><title>Safety Monitor Backend</title></head>
        <body style="font-family: system-ui; padding: 40px; background: #0e0e0e; color: white;">
            <h1>🛡️ Safety Monitor Backend</h1>
            <p>API is running on port 8000</p>
            <h3>Available Endpoints:</h3>
            <ul>
                <li><code>GET /api/monitor/status</code> - Check monitoring status</li>
                <li><code>POST /api/monitor/toggle</code> - Toggle monitoring on/off</li>
                <li><code>GET /api/settings/threshold</code> - Get sensitivity</li>
                <li><code>POST /api/settings/threshold</code> - Set sensitivity</li>
                <li><code>GET /api/settings/gear</code> - Get required PPE</li>
                <li><code>POST /api/settings/gear</code> - Set required PPE</li>
                <li><code>GET /api/logs</code> - Get detection logs</li>
                <li><code>GET /api/stats</code> - Get compliance stats</li>
                <li><code>GET /video_feed</code> - Live MJPEG stream</li>
                <li><code>POST /analyze_video</code> - Upload video for analysis</li>
            </ul>
            <p>Frontend should be running at <a href="http://localhost:3000" style="color: #3b82f6;">http://localhost:3000</a></p>
        </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)