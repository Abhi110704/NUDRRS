import cv2
import torch
from ultralytics import YOLO
from transformers import pipeline
import numpy as np
from PIL import Image
import os
from django.conf import settings

class AIVerificationService:
    def __init__(self):
        self.yolo_model = None
        self.text_classifier = None
        self.load_models()
    
    def load_models(self):
        try:
            # Load YOLO model for object detection
            model_path = getattr(settings, 'YOLO_MODEL_PATH', 'yolov8n.pt')
            self.yolo_model = YOLO(model_path)
            
            # Load text classification model
            self.text_classifier = pipeline(
                "text-classification",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
        except Exception as e:
            print(f"Error loading AI models: {e}")
    
    def verify_image(self, image_path):
        """Verify if image contains emergency-related content"""
        try:
            if not self.yolo_model:
                return self.mock_verification_result()
            
            # Load and process image
            image = cv2.imread(image_path)
            if image is None:
                return {"error": "Could not load image"}
            
            # Run YOLO detection
            results = self.yolo_model(image)
            
            # Analyze detected objects
            emergency_objects = [
                'person', 'car', 'truck', 'bus', 'motorcycle', 'bicycle',
                'fire hydrant', 'stop sign', 'traffic light'
            ]
            
            detected_objects = []
            confidence_scores = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        class_name = self.yolo_model.names[class_id]
                        
                        detected_objects.append(class_name)
                        confidence_scores.append(confidence)
            
            # Determine if it's an emergency
            is_emergency = any(obj in emergency_objects for obj in detected_objects)
            avg_confidence = np.mean(confidence_scores) if confidence_scores else 0.0
            
            # Determine priority based on detected objects
            priority = 'LOW'
            if 'fire hydrant' in detected_objects or 'truck' in detected_objects:
                priority = 'HIGH'
            elif 'person' in detected_objects and len(detected_objects) > 2:
                priority = 'MEDIUM'
            
            return {
                'is_emergency': is_emergency,
                'confidence': avg_confidence,
                'detected_objects': detected_objects,
                'suggested_priority': priority,
                'analysis_complete': True
            }
            
        except Exception as e:
            print(f"Error in image verification: {e}")
            return self.mock_verification_result()
    
    def classify_text(self, text):
        """Classify emergency text description"""
        try:
            if not self.text_classifier:
                return self.mock_text_classification()
            
            # Basic emergency keywords
            emergency_keywords = [
                'help', 'emergency', 'urgent', 'fire', 'flood', 'earthquake',
                'accident', 'injured', 'trapped', 'rescue', 'danger', 'critical'
            ]
            
            text_lower = text.lower()
            emergency_score = sum(1 for keyword in emergency_keywords if keyword in text_lower)
            
            # Use transformer for sentiment analysis
            sentiment = self.text_classifier(text)[0]
            
            # Determine urgency
            is_urgent = emergency_score > 0 or sentiment['label'] == 'NEGATIVE'
            confidence = max(emergency_score * 0.2, sentiment['score'])
            
            # Classify disaster type
            disaster_type = 'OTHER'
            if 'flood' in text_lower or 'water' in text_lower:
                disaster_type = 'FLOOD'
            elif 'fire' in text_lower or 'burn' in text_lower:
                disaster_type = 'FIRE'
            elif 'earthquake' in text_lower or 'shake' in text_lower:
                disaster_type = 'EARTHQUAKE'
            elif 'medical' in text_lower or 'injured' in text_lower:
                disaster_type = 'MEDICAL'
            
            return {
                'is_urgent': is_urgent,
                'confidence': confidence,
                'suggested_disaster_type': disaster_type,
                'emergency_keywords_found': emergency_score,
                'sentiment': sentiment
            }
            
        except Exception as e:
            print(f"Error in text classification: {e}")
            return self.mock_text_classification()
    
    def mock_verification_result(self):
        """Mock verification for demo purposes"""
        return {
            'is_emergency': True,
            'confidence': 0.85,
            'detected_objects': ['person', 'car'],
            'suggested_priority': 'MEDIUM',
            'analysis_complete': True,
            'mock_data': True
        }
    
    def mock_text_classification(self):
        """Mock text classification for demo purposes"""
        return {
            'is_urgent': True,
            'confidence': 0.75,
            'suggested_disaster_type': 'OTHER',
            'emergency_keywords_found': 2,
            'sentiment': {'label': 'NEGATIVE', 'score': 0.8},
            'mock_data': True
        }
