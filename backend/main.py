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
import json
from pydantic import BaseModel
from safety_engine import SafetyMonitor

# --- DATA MODELS ---
class CameraConfig(BaseModel):
    id: str | None = None
    name: str
    source: str # '0', '1', or URL
    type: str # 'webcam' or 'ip'
    zone: str = "General"

# --- GLOBAL STATE ---
monitor = SafetyMonitor()
OUTPUT_DIR = "static"
os.makedirs(OUTPUT_DIR, exist_ok=True)
DETECTION_LOGS_LIMIT = 500
detection_logs = []
ACTIVE_CAMERAS = {}      # cam_id -> cv2.VideoCapture
CAMERA_METADATA = []     # list of CameraConfig
LAST_LOG_TIME = {}       # (source, person_id) -> timestamp
LOG_COOLDOWN_SECONDS = 10 # Only log same person/violation once every 10s

# --- LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global monitor
    print("[INFO] Initializing Safety Monitor (GPU)...")
    monitor = SafetyMonitor()
    monitor.set_active(True)
    
    # Initialize with default webcam if none exist
    # (Actually let's wait for user to add)
    
    yield
    
    print("[INFO] Shutdown cleanup...")
    for cam_id, cam in ACTIVE_CAMERAS.items():
        cam.release()
    ACTIVE_CAMERAS.clear()

app = FastAPI(lifespan=lifespan)

# --- CAMERA API ---
@app.get("/api/cameras")
async def list_cameras():
    return CAMERA_METADATA

@app.post("/api/cameras")
async def add_camera(cam: CameraConfig):
    import uuid
    cam_id = str(uuid.uuid4())[:8]
    cam.id = cam_id
    
    # Try to open source
    try:
        source = int(cam.source) if cam.source.isdigit() else cam.source
        
        # Helper to test connection
        def try_source(s):
            cap = cv2.VideoCapture(s)
            if cap.isOpened():
                # Read one frame to verify stream is actually sending data
                ret, _ = cap.read()
                if ret: return cap
                cap.release()
            return None

        # Try 1: Original source
        cap = try_source(source)
        
        # Try 2: If IP and failed, try common /video or /shot.jpg suffixes
        if not cap and isinstance(source, str) and source.startswith("http"):
            for suffix in ["/video", "/live", "/stream"]:
                test_url = source.rstrip("/") + suffix
                print(f"[INFO] Testing refined URL: {test_url}")
                cap = try_source(test_url)
                if cap:
                    cam.source = test_url # Update to working URL
                    break

        if cap:
            ACTIVE_CAMERAS[cam_id] = cap
            CAMERA_METADATA.append(cam)
            return {"status": "success", "camera": cam}
        else:
            return {"status": "error", "message": f"Could not connect to {cam.source}. Please check URL and network."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/api/cameras/{cam_id}")
async def delete_camera(cam_id: str):
    global CAMERA_METADATA
    if cam_id in ACTIVE_CAMERAS:
        ACTIVE_CAMERAS[cam_id].release()
        del ACTIVE_CAMERAS[cam_id]
        CAMERA_METADATA = [c for c in CAMERA_METADATA if c.id != cam_id]
        return {"status": "success"}
    return {"status": "error", "message": "Camera not found"}

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

# --- DASHBOARD API ---
@app.get("/api/dashboard/summary")
async def get_dashboard_summary():
    # Reuse existing stats logic
    recent_logs = detection_logs[-50:]
    violations = len([d for d in recent_logs if d['status'] == 'VIOLATION'])
    total = len(recent_logs)
    compliance = ((total - violations) / total) * 100 if total > 0 else 100
    
    return {
        "activeViolations": violations,
        "camerasOnline": len(ACTIVE_CAMERAS),
        "complianceScore": round(compliance, 1),
        "averageResponseTime": 1.2 # Placeholder
    }

@app.get("/api/dashboard/violations")
async def get_dashboard_violations(limit: int = 5):
    # Filter logs for violations
    v_logs = [l for l in detection_logs if l.get('status') == 'VIOLATION'][::-1]
    return v_logs[:limit]

@app.get("/api/dashboard/system-status")
async def get_dashboard_system_status():
    return {
        "status": "online",
        "monitor_active": monitor.is_active if monitor else False,
        "gpu_available": torch.cuda.is_available(),
        "storage_usage": "2.4GB" # Placeholder
    }

@app.get("/api/dashboard/activity")
async def get_dashboard_activity(limit: int = 4):
    return detection_logs[::-1][:limit]

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

# New endpoint: analytics summary
@app.get("/api/analytics/summary")
async def analytics_summary(db: Session = Depends(get_db)):
    from sqlalchemy import func, json_each, cast, Date
    
    # 1. Equipment Counts
    detected_counts = (
        db.query(json_each.value, func.count())
        .select_from(Log, func.json_each(Log.detected))
        .group_by(json_each.value).all()
    )
    missing_counts = (
        db.query(json_each.value, func.count())
        .select_from(Log, func.json_each(Log.missing))
        .group_by(json_each.value).all()
    )

    # 2. Violation Trend (Daily)
    # We count logs that have non-empty 'missing' list as violations
    # Note: SQLite json_array_length or similar can be used if supported, 
    # but let's do a simpler approach: count all logs per day for now, 
    # or filter logs in memory if DB volume is small.
    # For robust SQLite counting of JSON arrays:
    violation_trend = (
        db.query(cast(Log.timestamp, Date), func.count(Log.id))
        .filter(func.json_array_length(Log.missing) > 0)
        .group_by(cast(Log.timestamp, Date))
        .order_by(cast(Log.timestamp, Date))
        .all()
    )

    # 3. Compliance Score Trend (Daily)
    # Score = (Total - Violations) / Total * 100
    daily_stats = (
        db.query(
            cast(Log.timestamp, Date),
            func.count(Log.id).label("total"),
            func.sum(func.case((func.json_array_length(Log.missing) > 0, 1), else_=0)).label("violations")
        )
        .group_by(cast(Log.timestamp, Date))
        .order_by(cast(Log.timestamp, Date))
        .all()
    )

    # 4. Camera Performance
    camera_stats = (
        db.query(Log.source, func.count(Log.id))
        .filter(func.json_array_length(Log.missing) > 0)
        .group_by(Log.source)
        .all()
    )

    return {
        "detected": {item: cnt for item, cnt in detected_counts},
        "missing": {item: cnt for item, cnt in missing_counts},
        "violationTrend": [{"date": str(d), "violations": c} for d, c in violation_trend],
        "complianceTrend": [
            {"date": str(d), "score": round(((t - v) / t) * 100, 1) if t > 0 else 100} 
            for d, t, v in daily_stats
        ],
        "cameraPerformance": [{"camera": s, "violations": c} for s, c in camera_stats]
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
def generate_frames(cam_id: str):
    while True:
        # 1. Check if camera is accessible
        if cam_id not in ACTIVE_CAMERAS:
            print(f"[ERROR] Camera {cam_id} not initialized")
            break
            
        cap = ACTIVE_CAMERAS[cam_id]
        success, frame = cap.read()
        
        if not success:
            # Maybe it's an IP cam that disconnected?
            time.sleep(1)
            continue

        try:
            # Get metadata for source name
            cam_name = "Camera"
            for m in CAMERA_METADATA:
                if m.id == cam_id:
                    cam_name = m.name
                    break

            # 3. Live Inference
            annotated_frame, data = monitor.process_frame(frame)
            
            # 4. Filter and Update Logs with cooldown
            filtered_data = []
            now = time.time()
            if data:
                for entry in data:
                    person_id = entry.get("id")
                    key = (cam_name, person_id)
                    
                    # Only log if it's a violation AND outside cooldown
                    if entry.get("status") == "VIOLATION":
                         last_time = LAST_LOG_TIME.get(key, 0)
                         if now - last_time > LOG_COOLDOWN_SECONDS:
                             filtered_data.append(entry)
                             LAST_LOG_TIME[key] = now
                    else:
                        # SAFE logs are less noisy, but maybe we don't even need them in DB?
                        # For now, let's keep them transient in memory only
                        pass

                if filtered_data:
                    detection_logs.extend(filtered_data)
                    if len(detection_logs) > 50: detection_logs.pop(0)
                    
                    # PERSIST TO DATABASE
                    try:
                        with next(get_db()) as db:
                            save_logs(db, filtered_data, source=cam_name)
                    except Exception as db_err:
                        print(f"Stats DB Error: {db_err}")

            # 5. Encode & Stream
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                   
        except Exception as e:
            print(f"[STREAM ERROR] {e}")
            break

@app.get("/video_feed/{cam_id}")
async def video_feed(cam_id: str):
    return StreamingResponse(generate_frames(cam_id), media_type="multipart/x-mixed-replace; boundary=frame")

# --- RECORDED VIDEO PROCESSING ---
from fastapi import Form
@app.post("/analyze_video")
async def analyze_video(
    file: UploadFile = File(...),
    start_time: float = Form(0.0),
    end_time: float = Form(None),
    required_gear: str = Form(None)
):
    # Parse required gear if provided
    active_requirements = None
    if required_gear:
        try:
            active_requirements = json.loads(required_gear)
        except:
            # Fallback to comma-separated if not valid JSON
            active_requirements = [g.strip().lower() for g in required_gear.split(",")]
    
    # 1. Save Uploaded File
    temp_input = f"{OUTPUT_DIR}/temp_input.mp4"
    
    output_filename = f"processed_{int(time.time())}.webm"
    output_path = f"{OUTPUT_DIR}/{output_filename}"

    with open(temp_input, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Setup Processing
    cap = cv2.VideoCapture(temp_input)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_duration_ms = (total_frames / fps) * 1000 if fps > 0 else 0

    # Seek to start time
    start_ms = start_time * 1000
    cap.set(cv2.CAP_PROP_POS_MSEC, start_ms)
    
    end_ms = end_time * 1000 if end_time is not None else video_duration_ms
    
    # Use original dimensions
    orig_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    orig_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # CHANGE: Use 'vp80' (VP8) - Faster & better compatibility than VP9
    try:
        fourcc = cv2.VideoWriter_fourcc(*'vp80')
        out = cv2.VideoWriter(output_path, fourcc, fps, (orig_width, orig_height))
        
        # Critical Check: Did the writer actually open?
        if not out.isOpened():
            print("[WARNING] VP8 codec failed. Falling back to mp4v...")
            output_filename = f"processed_{int(time.time())}.mp4"
            output_path = f"{OUTPUT_DIR}/{output_filename}"
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (orig_width, orig_height))
            
    except Exception as e:
        print(f"[ERROR] Video Writer Error: {e}")
        return {"status": "Error", "message": str(e)}
    
    # Temporarily force monitor active
    was_active = monitor.is_active
    monitor.set_active(True)

    results = []
    frame_count = 0
    first_frame_thumb = None
    
    # 3. Process Frame by Frame
    while cap.isOpened():
        current_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
        if current_ms > end_ms:
            break

        ret, frame = cap.read()
        if not ret: break
        
        annotated_frame, data = monitor.process_frame(frame, override_requirements=active_requirements)
        
        # Save first frame as thumbnail
        if frame_count == 0:
            thumb_filename = f"thumb_{output_filename}.jpg"
            cv2.imwrite(f"{OUTPUT_DIR}/{thumb_filename}", annotated_frame)
            first_frame_thumb = f"/static/{thumb_filename}"

        if data: results.extend(data)
        out.write(annotated_frame)
        frame_count += 1

    cap.release()
    out.release()
    
    # PERSIST RESULTS TO DATABASE
    if results:
        try:
            with next(get_db()) as db:
                save_logs(db, results, source=output_filename)
        except Exception as db_err:
            print(f"Database Save Error: {db_err}")
    
    # Restore monitor state
    monitor.set_active(was_active)
    
    return {
        "status": "Success",
        "video_url": f"/static/{output_filename}",
        "thumbnail_url": first_frame_thumb,
        "total_frames": frame_count,
        "logs": results
    }

@app.get("/api/videos/history")
async def get_video_history(db: Session = Depends(get_db)):
    from sqlalchemy import func
    # 1. Get all processed files from static folder
    files = [f for f in os.listdir(OUTPUT_DIR) if f.startswith("processed_") and (f.endswith(".webm") or f.endswith(".mp4"))]
    files.sort(reverse=True)
    
    history = []
    for filename in files:
        # 2. Get violation count for this specific file from DB
        violation_count = db.query(Log).filter(
            Log.source == filename,
            func.json_array_length(Log.missing) > 0
        ).count()

        total_detections = db.query(Log).filter(Log.source == filename).count()
        
        # Check if thumbnail exists
        thumb_name = f"thumb_{filename}.jpg"
        thumb_path = os.path.join(OUTPUT_DIR, thumb_name)
        thumb_url = f"/static/{thumb_name}" if os.path.exists(thumb_path) else None
        
        history.append({
            "filename": filename,
            "url": f"/static/{filename}",
            "thumbnail_url": thumb_url,
            "timestamp": os.path.getmtime(os.path.join(OUTPUT_DIR, filename)),
            "violations": violation_count,
            "total_detections": total_detections
        })
    
    return {"history": history}

# --- HEALTH CHECK ---
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "cameras_active": len(ACTIVE_CAMERAS),
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
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)