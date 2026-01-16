import cv2
import numpy as np
from ultralytics import YOLO
from datetime import datetime
import torch
import os

class SafetyMonitor:
    def __init__(self, pose_model_path='yolov8n-pose.pt', obj_model_path=r'C:\Users\Pragyan\Downloads\safety-compliance-dashboard\backend\bests-90epoch.pt'):
        # Check for GPU
        self.device = '0' if torch.cuda.is_available() else 'cpu'
        print(f"🚀 Loading models on {self.device}...")

        # Load Pose Model (downloads automatically if not present)
        self.pose_model = YOLO(pose_model_path)
        
        # Load Object Detection Model (with graceful fallback)
        self.obj_model = None
        self.demo_mode = False
        
        if os.path.exists(obj_model_path):
            print(f"✓ Loading custom PPE model: {obj_model_path}")
            self.obj_model = YOLO(obj_model_path)
        else:
            print(f"⚠️ WARNING: Custom model '{obj_model_path}' not found!")
            print("   Running in DEMO MODE (pose detection only)")
            print(f"   To enable PPE detection, place your model file at: {os.path.abspath(obj_model_path)}")
            self.demo_mode = True
        
        # --- STATE & SETTINGS ---
        self.is_active = False  # Default: Monitoring OFF
        self.general_conf = 0.63
        
        # INTERNAL SENSITIVITY OVERRIDES
        self.CLASS_SPECIFIC_THRESHOLDS = {
            'Coverall': 0.50,
            'Face_Shield': 0.50,
            'Gloves': 0.45,
            'Goggles': 0.50,
            'Mask': 0.30
        }

        self.EQUIPMENT_CLASSES = {
            0: 'Coverall', 
            1: 'Face_Shield', 
            2: 'Gloves', 
            3: 'Goggles', 
            4: 'Mask'
        }
        
        # Default: All gear is required
        self.REQUIRED_GEAR = {'mask', 'gloves', 'coverall', 'goggles', 'face_shield'}

        # Optimization vars
        self.frame_count = 0
        self.SKIP_FRAMES = 2
        
        # Cache for re-evaluation (allows instant settings updates)
        self.last_pose_data = None
        self.last_equip_data = []

    def set_active(self, status: bool):
        self.is_active = status
        print(f"[INFO] Monitoring Active: {self.is_active}")

    def set_confidence(self, val: float):
        """Update General Threshold from UI"""
        self.general_conf = val

    def update_requirements(self, active_gear: list):
        """Update what gear is considered mandatory"""
        self.REQUIRED_GEAR = set(active_gear)
        print(f"[INFO] Updated Compliance Rules: {self.REQUIRED_GEAR}")

    def is_overlapping(self, box1, box2):
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        return x2 > x1 and y2 > y1

    def check_keypoint_association(self, equip_box, keypoints, equip_type):
        x1, y1, x2, y2 = equip_box
        relevant_kps = []
        if 'mask' in equip_type: relevant_kps = [0, 3, 4] # Nose, ears
        elif 'goggles' in equip_type: relevant_kps = [1, 2] # Eyes
        elif 'face_shield' in equip_type: relevant_kps = [0, 1, 2] # Nose, eyes
        elif 'gloves' in equip_type: relevant_kps = [9, 10] # Wrists
        elif 'coverall' in equip_type: relevant_kps = [5, 6, 11, 12] # Shoulders, hips

        for kp_idx in relevant_kps:
            if kp_idx < len(keypoints):
                kx, ky = keypoints[kp_idx][:2]
                if x1 < kx < x2 and y1 < ky < y2:
                    return True
        return False

    def process_frame(self, frame):
        # 1. IDLE STATE
        if not self.is_active:
            return frame, []

        self.frame_count += 1
        annotated_frame = frame.copy()

        # Decide if we run fresh inference or use cached data
        run_inference = True
        if self.frame_count > 1 and self.frame_count % (self.SKIP_FRAMES + 1) != 0:
            run_inference = False

        if run_inference:
            # 2. Run Pose Tracking (ByteTrack Applied Here)
            # CHANGE: tracker="bytetrack.yaml" now looks for your LOCAL file first
            pose_results = self.pose_model.track(
                frame, 
                persist=True, 
                verbose=False, 
                tracker="bytetrack.yaml", 
                device=self.device, 
                half=True
            )
            
            # 3. Run Object Detection (GPU - Low Confidence Pass)
            # Only run if model is available (not in demo mode)
            self.last_equip_data = []
            if self.obj_model is not None:
                obj_results = self.obj_model(frame, verbose=False, device=self.device, half=True, conf=0.10)

                # 4. Store Raw Equipment Data
                if obj_results[0].boxes:
                    boxes = obj_results[0].boxes
                    cls = boxes.cls.cpu().numpy()
                    conf = boxes.conf.cpu().numpy()
                    xyxy = boxes.xyxy.cpu().numpy()
                
                    for i, c in enumerate(cls):
                        cls_name = self.EQUIPMENT_CLASSES.get(int(c), 'unknown')
                        score = float(conf[i])
                        
                        # Sensitivity Logic
                        specific_thresh = self.CLASS_SPECIFIC_THRESHOLDS.get(cls_name)
                        required_score = specific_thresh if specific_thresh is not None else self.general_conf
                        
                        if score >= required_score:
                            self.last_equip_data.append({'bbox': xyxy[i], 'class': cls_name})

            # 5. Store Raw Pose Data
            self.last_pose_data = None
            if pose_results[0].boxes and pose_results[0].keypoints:
                boxes = pose_results[0].boxes
                keypoints = pose_results[0].keypoints
                
                self.last_pose_data = {
                    'ids': boxes.id.cpu().numpy() if boxes.id is not None else [0] * len(boxes),
                    'bboxes': boxes.xyxy.cpu().numpy(),
                    'kps': keypoints.xy.cpu().numpy()
                }

        # --- ALWAYS RUN COMPLIANCE CHECK (Even on skipped frames) ---
        visuals, persons_data = self.compute_compliance(self.last_pose_data, self.last_equip_data)
        
        annotated_frame = self.draw_visuals(annotated_frame, visuals)
        return annotated_frame, persons_data

    def compute_compliance(self, pose_data, equip_data):
        """Re-evaluates compliance logic based on inputs and CURRENT settings"""
        current_visuals = []
        persons_data = []

        if pose_data:
            ids = pose_data['ids']
            bboxes = pose_data['bboxes']
            kps_all = pose_data['kps']

            for person_id, bbox, kps in zip(ids, bboxes, kps_all):
                person_gear = set()
                
                for equip in equip_data:
                    e_bbox = equip['bbox']
                    e_name = equip['class']
                    # Normalize names
                    simple_name = next((k for k in ['mask', 'gloves', 'coverall', 'goggles', 'face_shield'] if k in e_name.lower()), None)

                    if simple_name:
                        if self.is_overlapping(bbox, e_bbox):
                            if self.check_keypoint_association(e_bbox, kps, simple_name):
                                person_gear.add(simple_name)
                                current_visuals.append({'type': 'rect', 'coords': e_bbox, 'color': (0, 255, 0), 'text': e_name})

                # Compliance Check against current self.REQUIRED_GEAR
                missing = self.REQUIRED_GEAR - person_gear
                status = "VIOLATION" if missing else "COMPLIANT"
                color = (0, 0, 255) if status == "VIOLATION" else (0, 255, 0)
                
                label = f"ID:{int(person_id)} {status}"
                current_visuals.append({'type': 'rect', 'coords': bbox, 'color': color, 'text': label})

                persons_data.append({
                    "id": int(person_id),
                    "timestamp": datetime.now().isoformat(),
                    "status": status,
                    "detected": list(person_gear),
                    "missing": list(missing)
                })

        return current_visuals, persons_data

    def draw_visuals(self, frame, visuals):
        # Modern Font Settings
        font = cv2.FONT_HERSHEY_DUPLEX # Slightly cleaner than SIMPLEX
        font_scale = 0.5               # Smaller, cleaner text
        font_thickness = 1             # Thin text font
        box_thickness = 2              # Thinner bounding box lines

        for item in visuals:
            x1, y1, x2, y2 = map(int, item['coords'])
            color = item['color']
            text = item['text']

            # 1. Draw Modern Thin Bounding Box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, box_thickness)

            # 2. Create Modern Text Label (Filled background "pill")
            
            # Calculate text size to make the background box fit perfectly
            (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, font_thickness)
            
            # Coordinates for the background text box (positioned just above the bounding box)
            text_bg_x1 = x1
            text_bg_y1 = y1 - text_height - 10 # Shift up by height + padding
            text_bg_x2 = x1 + text_width + 10  # Add horizontal padding
            text_bg_y2 = y1

            # Ensure text box doesn't go off-screen top
            if text_bg_y1 < 0:
                text_bg_y1 = y1
                text_bg_y2 = y1 + text_height + 10

            # Draw filled rectangle for text background (uses the same color as box)
            cv2.rectangle(frame, (text_bg_x1, text_bg_y1), (text_bg_x2, text_bg_y2), color, cv2.FILLED)

            # Draw white text on top of the filled background
            # Add padding (+5, -5) to center text in the filled box
            text_x = x1 + 5 
            text_y = text_bg_y2 - 5

            # Use cv2.LINE_AA for anti-aliased (smooth) text edges
            cv2.putText(frame, text, (text_x, text_y), font, font_scale, (255, 255, 255), font_thickness, cv2.LINE_AA)
            
        return frame
