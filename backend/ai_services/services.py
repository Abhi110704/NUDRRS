import os
from django.conf import settings
from PIL import Image
import random

class AIVerificationService:
    def __init__(self):
        self.emergency_keywords = [
            'help', 'emergency', 'urgent', 'fire', 'flood', 'earthquake',
            'accident', 'injured', 'trapped', 'rescue', 'danger', 'critical',
            'sos', 'disaster', 'emergency', 'help needed', 'urgent assistance'
        ]
    
    def verify_image(self, image_path):
        """Mock image verification service (will be replaced with real AI later)"""
        try:
            # For now, return a mock verification result
            # In production, this will use YOLO or other AI models
            
            # Simulate AI processing delay
            import time
            time.sleep(0.1)
            
            # Mock emergency detection based on image size/format
            try:
                with Image.open(image_path) as img:
                    width, height = img.size
                    # Simple heuristic: larger images might be more serious
                    is_emergency = width > 800 or height > 600
            except:
                is_emergency = random.choice([True, False])
            
            # Mock confidence and priority
            confidence = random.uniform(0.7, 0.95)
            priority = random.choice(['LOW', 'MEDIUM', 'HIGH'])
            
            return {
                'is_emergency': is_emergency,
                'confidence': round(confidence, 2),
                'detected_objects': ['person', 'vehicle'] if is_emergency else ['building'],
                'suggested_priority': priority,
                'analysis_complete': True,
                'note': 'Mock AI service - replace with real AI in production'
            }
            
        except Exception as e:
            print(f"Error in image verification: {e}")
            return self.mock_verification_result()
    
    def classify_text(self, text):
        """Classify emergency text description using keyword matching"""
        try:
            text_lower = text.lower()
            emergency_score = sum(1 for keyword in self.emergency_keywords if keyword in text_lower)
            
            # Determine emergency level based on keyword count
            if emergency_score >= 3:
                emergency_level = 'CRITICAL'
                priority = 'HIGH'
            elif emergency_score >= 2:
                emergency_level = 'HIGH'
                priority = 'MEDIUM'
            elif emergency_score >= 1:
                emergency_level = 'MEDIUM'
                priority = 'LOW'
            else:
                emergency_level = 'LOW'
                priority = 'LOW'
            
            return {
                'emergency_level': emergency_level,
                'priority': priority,
                'confidence': min(0.9, 0.5 + (emergency_score * 0.1)),
                'keywords_found': [kw for kw in self.emergency_keywords if kw in text_lower],
                'analysis_complete': True
            }
            
        except Exception as e:
            print(f"Error in text classification: {e}")
            return self.mock_text_classification()
    
    def mock_verification_result(self):
        """Fallback mock result"""
        return {
            'is_emergency': True,
            'confidence': 0.8,
            'detected_objects': ['person'],
            'suggested_priority': 'MEDIUM',
            'analysis_complete': True,
            'note': 'Mock service - AI models not loaded'
        }
    
    def mock_text_classification(self):
        """Fallback mock text classification"""
        return {
            'emergency_level': 'MEDIUM',
            'priority': 'MEDIUM',
            'confidence': 0.7,
            'keywords_found': ['emergency'],
            'analysis_complete': True,
            'note': 'Mock service - AI models not loaded'
        }
    
    def predict_disaster_risk(self, location_data):
        """Mock disaster risk prediction (will use real ML models later)"""
        try:
            # Mock risk assessment based on location
            risk_factors = {
                'flood_risk': random.uniform(0.1, 0.9),
                'earthquake_risk': random.uniform(0.05, 0.8),
                'fire_risk': random.uniform(0.1, 0.7),
                'cyclone_risk': random.uniform(0.05, 0.6)
            }
            
            # Determine overall risk level
            max_risk = max(risk_factors.values())
            if max_risk > 0.7:
                overall_risk = 'HIGH'
            elif max_risk > 0.4:
                overall_risk = 'MEDIUM'
            else:
                overall_risk = 'LOW'
            
            return {
                'overall_risk': overall_risk,
                'risk_factors': risk_factors,
                'recommendations': [
                    'Monitor weather updates',
                    'Prepare emergency kit',
                    'Know evacuation routes'
                ],
                'prediction_confidence': random.uniform(0.6, 0.9),
                'note': 'Mock prediction service - replace with real ML models in production'
            }
            
        except Exception as e:
            print(f"Error in disaster risk prediction: {e}")
            return {
                'overall_risk': 'UNKNOWN',
                'risk_factors': {},
                'recommendations': ['Service temporarily unavailable'],
                'prediction_confidence': 0.0,
                'error': str(e)
            }
